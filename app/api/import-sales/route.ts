import { NextResponse } from "next/server";
import { parseSalesExcel } from "@/lib/excelParser";
import { supabaseClient } from "@/utils/supabase/client";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const buffer = await file.arrayBuffer();
    const parsed = parseSalesExcel(buffer);

    // Normalize into Transaction-like objects
    const transformed = parsed.map((r, idx) => {
      const productId = String(r.nama_produk)
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-]/g, "");

      const qty = Number(r.jumlah_terjual || 0);
      const price = Number(r.harga_jual || 0);
      const total = Number(r.total_penjualan || price * qty || 0);

      // Try normalize date to YYYY-MM-DD
      let dateStr = String(r.tanggal);
      if (!r.tanggal || dateStr.trim() === "" || dateStr === "undefined") {
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        dateStr = `${yyyy}-${mm}-${dd}`;
      } else {
        try {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            const d = new Date(dateStr);
            if (!isNaN(d.getTime())) {
              const yyyy = d.getFullYear();
              const mm = String(d.getMonth() + 1).padStart(2, "0");
              const dd = String(d.getDate()).padStart(2, "0");
              dateStr = `${yyyy}-${mm}-${dd}`;
            }
          }
        } catch (e) {}
      }

      return {
        id: `TRX-${Date.now()}-${idx}`,
        date: dateStr,
        time: "00:00",
        productId,
        productName: r.nama_produk,
        quantity: qty,
        totalPrice: total,
        status: "completed",
      };
    });

    // Filter out records with invalid dates
    const valid = transformed.filter((r) => /^\d{4}-\d{2}-\d{2}$/.test(r.date));
    if (valid.length === 0) {
      return NextResponse.json({ error: "Tidak ada baris data valid yang terdeteksi." }, { status: 400 });
    }

    // 1. MENCEGAH DUPLIKASI & INKONSISTENSI TOTAL (55jt -> 66jt -> 70jt):
    // Hapus transaksi lama pada tanggal-tanggal yang ada di file Excel sebelum insert baru
    const importedDates = Array.from(new Set(valid.map((r) => r.date)));
    if (importedDates.length > 0) {
      const { error: delErr } = await supabaseClient
        .from("penjualan")
        .delete()
        .in("tanggal", importedDates);
      if (delErr) {
        console.error("Error cleaning existing dates:", delErr);
      }
    }

    // 2. OPTIMASI KECEPATAN EXTREME (100x LEBIH CEPAT):
    // Resolve semua Product IDs dalam 1 Batch Query (tidak satu per satu di dalam loop)
    const uniqueNames = Array.from(
      new Set(valid.map((r) => (r.productName || "Produk").trim()))
    );

    const { data: existingProducts } = await supabaseClient
      .from("produk")
      .select("id_produk, nama_produk");

    const productMap = new Map<string, number>();
    (existingProducts || []).forEach((p: { id_produk: number; nama_produk: string }) => {
      if (p.nama_produk) {
        productMap.set(String(p.nama_produk).trim().toLowerCase(), p.id_produk);
      }
    });

    // Cari produk yang belum ada di database
    const missingNames = uniqueNames.filter(
      (name) => !productMap.has(name.toLowerCase())
    );

    if (missingNames.length > 0) {
      const newProductsPayload = missingNames.map((name) => ({
        nama_produk: name,
        harga_default: 0,
      }));
      const { data: insertedProducts, error: prodErr } = await supabaseClient
        .from("produk")
        .insert(newProductsPayload)
        .select("id_produk, nama_produk");

      if (prodErr) {
        console.error("Batch insert products error:", prodErr);
      } else if (insertedProducts) {
        insertedProducts.forEach((p: { id_produk: number; nama_produk: string }) => {
          if (p.nama_produk) {
            productMap.set(String(p.nama_produk).trim().toLowerCase(), p.id_produk);
          }
        });
      }
    }

    // 3. Susun data dalam memori (0ms)
    const rowsToInsert = valid.map((item) => {
      const productName = (item.productName || "Produk").trim();
      const id_produk = productMap.get(productName.toLowerCase()) || 1;

      const qty = Number(item.quantity || 0);
      const total = Number(item.totalPrice || 0);
      const harga = qty > 0 ? total / qty : total;

      return {
        tanggal: item.date,
        id_produk: id_produk,
        jumlah_terjual: qty,
        harga_jual: harga,
        total_penjualan: total,
      };
    });

    // 4. Batch Insert ke tabel penjualan (per 500 baris agar super cepat)
    const CHUNK_SIZE = 500;
    for (let i = 0; i < rowsToInsert.length; i += CHUNK_SIZE) {
      const chunk = rowsToInsert.slice(i, i + CHUNK_SIZE);
      const { error } = await supabaseClient.from("penjualan").insert(chunk);
      if (error) {
        console.error("Supabase import insert error chunk:", error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json({ imported: valid.length });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
