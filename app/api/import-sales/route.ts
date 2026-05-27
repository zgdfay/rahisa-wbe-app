import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";
import { parseSalesExcel } from "@/lib/excelParser";

const DATA_DIR = path.resolve(process.cwd(), "data");
const DATA_PATH = path.resolve(DATA_DIR, "sales.json");

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

    // ensure data dir
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

    // Filter out records with invalid dates
    const valid = transformed.filter((r) => /^\d{4}-\d{2}-\d{2}$/.test(r.date));

    // Merge with existing data (append, don't overwrite)
    let existing: any[] = [];
    if (fs.existsSync(DATA_PATH)) {
      try {
        existing = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8") || "[]");
      } catch { }
    }

    const merged = [...existing, ...valid];
    fs.writeFileSync(DATA_PATH, JSON.stringify(merged, null, 2), "utf-8");

    return NextResponse.json({ imported: valid.length });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
