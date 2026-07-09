import { NextResponse } from "next/server";
import { supabaseClient, getOrInsertProductId } from "@/utils/supabase/client";

export const dynamic = "force-dynamic";

interface PenjualanRow {
  id_penjualan?: string;
  tanggal?: string;
  jumlah_terjual?: number;
  total_penjualan?: number;
  produk?: { nama_produk?: string } | { nama_produk?: string }[];
}

interface TransactionPayload {
  productName?: string;
  quantity?: number | string;
  totalPrice?: number | string;
  date?: string;
}

export async function GET() {
  try {
    const { data, error } = await supabaseClient
      .from("penjualan")
      .select("id_penjualan, tanggal, jumlah_terjual, total_penjualan, produk(id_produk, nama_produk)")
      .order("tanggal", { ascending: false })
      .range(0, 4999);

    if (error) {
      console.error("Supabase GET error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const transformed = (data || []).map((row: PenjualanRow, idx: number) => {
      const prodObj = Array.isArray(row.produk) ? row.produk[0] : row.produk;
      const productName = prodObj?.nama_produk || "Produk";
      const productId =
        productName
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9\-]/g, "") || "produk";

      return {
        id: row.id_penjualan || `TRX-${idx}`,
        date: row.tanggal || new Date().toISOString().split("T")[0],
        time: "00:00",
        productId,
        productName,
        quantity: Number(row.jumlah_terjual || 0),
        totalPrice: Number(row.total_penjualan || 0),
        status: "completed",
      };
    });

    return NextResponse.json(transformed);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const toAdd: TransactionPayload[] = Array.isArray(body) ? body : [body];

    const rowsToInsert = [];
    for (const item of toAdd) {
      const productName = item.productName || "Produk";
      const id_produk = await getOrInsertProductId(supabaseClient, productName);

      const qty = Number(item.quantity || 0);
      const total = Number(item.totalPrice || 0);
      const harga = qty > 0 ? total / qty : total;

      rowsToInsert.push({
        tanggal: item.date || new Date().toISOString().split("T")[0],
        id_produk: id_produk,
        jumlah_terjual: qty,
        harga_jual: harga,
        total_penjualan: total,
      });
    }

    if (rowsToInsert.length > 0) {
      const { error } = await supabaseClient.from("penjualan").insert(rowsToInsert);
      if (error) {
        console.error("Supabase POST insert error:", error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json({ added: rowsToInsert.length });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}

export async function DELETE() {
  try {
    const { error } = await supabaseClient
      .from("penjualan")
      .delete()
      .neq("id_penjualan", "00000000-0000-0000-0000-000000000000");

    if (error) {
      console.error("Supabase DELETE error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ deleted: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
