import { NextResponse } from "next/server";
import { parseSalesExcel } from "@/lib/excelParser";
import { supabaseClient, getOrInsertProductId } from "@/utils/supabase/client";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const buffer = await file.arrayBuffer();
    const parsed = parseSalesExcel(buffer);

    // normalize into Transaction-like objects
    const transformed = parsed.map((r, idx) => {
      const productId = String(r.nama_produk)
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-]/g, "");

      const qty = Number(r.jumlah_terjual || 0);
      const price = Number(r.harga_jual || 0);
      const total = Number(r.total_penjualan || price * qty || 0);

      // try normalize date to YYYY-MM-DD
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

    // Batch process products and insert into Supabase
    const rowsToInsert = [];
    for (const item of valid) {
      const productName = item.productName || "Produk";
      const id_produk = await getOrInsertProductId(supabaseClient, productName);

      const qty = Number(item.quantity || 0);
      const total = Number(item.totalPrice || 0);
      const harga = qty > 0 ? total / qty : total;

      rowsToInsert.push({
        tanggal: item.date,
        id_produk: id_produk,
        jumlah_terjual: qty,
        harga_jual: harga,
        total_penjualan: total,
      });
    }

    if (rowsToInsert.length > 0) {
      const { error } = await supabaseClient.from("penjualan").insert(rowsToInsert);
      if (error) {
        console.error("Supabase import insert error:", error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json({ imported: valid.length });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
