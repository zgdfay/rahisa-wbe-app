import * as XLSX from "xlsx";

export interface SalesRow {
  tanggal: string;
  nama_produk: string;
  kategori_produk?: string;
  stok_awal?: number;
  barang_masuk?: number;
  jumlah_terjual: number;
  stok_akhir?: number;
  harga_jual?: number;
  total_penjualan?: number;
  diskon?: number;
}

// -----------------------------------------------------------------------
// Baris-baris ini akan di-SKIP saat parsing (kategori & footer)
// -----------------------------------------------------------------------
const SKIP_ROW_KEYWORDS = [
  "cake",
  "donat",
  "minuman",
  "desert",
  "roti",
  "total",
  "jumlah",
  "sub total",
  "subtotal",
];

function isSkipRow(firstCell: unknown): boolean {
  const text = String(firstCell ?? "").trim().toLowerCase();
  if (!text) return true;
  return SKIP_ROW_KEYWORDS.some((kw) => text === kw);
}

// -----------------------------------------------------------------------
// Extract tanggal dari nama sheet atau dari baris judul
// Contoh: "01 January 2026", "01 Jan 26", "1-1-2026", sheet name "Jan", dll
// -----------------------------------------------------------------------
function extractDateFromTitle(candidates: string[]): string {
  const months: Record<string, number> = {
    january: 1, jan: 1,
    february: 2, feb: 2,
    march: 3, mar: 3,
    april: 4, apr: 4,
    may: 5, mei: 5,
    june: 6, jun: 6,
    july: 7, jul: 7,
    august: 8, aug: 8, agustus: 8, agu: 8,
    september: 9, sep: 9,
    october: 10, oct: 10, oktober: 10, okt: 10,
    november: 11, nov: 11,
    december: 12, dec: 12, desember: 12, des: 12,
  };

  for (const text of candidates) {
    if (!text) continue;

    // Format: "01 January 2026" atau "1 Jan 2026"
    const m1 = text.match(/(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})/);
    if (m1) {
      const day = parseInt(m1[1], 10);
      const monthNum = months[m1[2].toLowerCase()];
      const year = parseInt(m1[3], 10);
      if (monthNum && day >= 1 && day <= 31) {
        return `${year}-${String(monthNum).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      }
    }

    // Format: "2026-01-01" atau "01/01/2026" atau "01-01-2026"
    const m2 = text.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (m2) {
      return `${m2[1]}-${m2[2].padStart(2, "0")}-${m2[3].padStart(2, "0")}`;
    }
    const m3 = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (m3) {
      return `${m3[3]}-${m3[2].padStart(2, "0")}-${m3[1].padStart(2, "0")}`;
    }
  }
  return "";
}

// -----------------------------------------------------------------------
// Parser utama — support multi-sheet
// -----------------------------------------------------------------------
export function parseSalesExcel(arrayBuffer: ArrayBuffer): SalesRow[] {
  const buffer = Buffer.from(arrayBuffer);
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: true });

  if (wb.SheetNames.length === 0) throw new Error("Workbook tidak punya sheet");

  const allRows: SalesRow[] = [];

  // Loop semua sheet (tiap sheet = satu hari atau satu bulan)
  for (const sheetName of wb.SheetNames) {
    const sheet = wb.Sheets[sheetName];
    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: null,
      blankrows: false,
      raw: true,
    }) as any[][];

    if (rows.length === 0) continue;

    // Cari tanggal dari: nama sheet, lalu scan 5 baris pertama
    const titleCandidates = [
      sheetName,
      ...rows.slice(0, 5).map((r) =>
        r.filter(Boolean).join(" ")
      ),
    ];
    let sheetDate = extractDateFromTitle(titleCandidates);

    // Temukan baris header (maksimal scan 10 baris pertama)
    const normalize = (value: unknown) =>
      String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/[\s_\-\/]+/g, "")
        .replace(/[^a-z0-9]/g, "");

    const aliases: Record<keyof SalesRow, string[]> = {
      tanggal: ["tanggal", "date", "tgl"],
      nama_produk: [
        "namaproduk", "namaroti", "namabarang", "produk",
        "product", "productname", "item", "barang",
      ],
      kategori_produk: ["kategoriproduk", "kategori", "category"],
      stok_awal: ["stokawal", "stockawal", "stokawalpcs", "stokawalunit", "stockawal"],
      barang_masuk: ["barangmasuk", "masuk", "inbound", "jumlahmasuk"],
      jumlah_terjual: [
        "jumlahterjual", "laku", "terjual", "sold",
        "quantity", "qty", "jumlah",
      ],
      stok_akhir: ["stokakhir", "stockakhir", "sisa", "stockend", "sisastok"],
      harga_jual: ["hargajual", "harga", "price"],
      total_penjualan: ["totalpenjualan", "total", "omset", "revenue"],
      diskon: ["diskon", "discount", "discbonus", "disc", "bonus"],
    } as const;

    const headerCandidates = rows.slice(0, Math.min(rows.length, 10));
    let headerIndex = -1;
    let headerMap: Record<string, number> = {};

    for (let i = 0; i < headerCandidates.length; i++) {
      const row = headerCandidates[i] || [];
      const map: Record<string, number> = {};
      for (let col = 0; col < row.length; col++) {
        const cell = normalize(row[col]);
        if (!cell) continue;
        if (!map[cell]) map[cell] = col;
      }

      const matchedCount = Object.entries(aliases).reduce((count, [, keys]) => {
        return count + (keys.some((key) => Object.prototype.hasOwnProperty.call(map, key)) ? 1 : 0);
      }, 0);

      if (matchedCount >= 2) {
        headerIndex = i;
        headerMap = map;
        break;
      }
    }

    // Jika tidak ketemu header, skip sheet ini
    if (headerIndex === -1) continue;

    // Helper: ambil nilai satu field dari baris
    const getCell = (row: any[], field: keyof SalesRow) => {
      const possibleKeys = aliases[field];
      for (const key of possibleKeys) {
        const colIndex = headerMap[key];
        if (typeof colIndex === "number") {
          const value = row[colIndex];
          if (value !== null && value !== undefined && value !== "") return value;
        }
      }
      return null;
    };

    const toNumber = (value: unknown) => {
      if (value === null || value === undefined || value === "") return undefined;
      if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
      // Handle format Rupiah: "Rp12.000" → 12000
      const text = String(value)
        .trim()
        .replace(/rp/gi, "")
        .replace(/\./g, "")
        .replace(/,/g, ".")
        .trim();
      const parsed = Number(text);
      return Number.isFinite(parsed) ? parsed : undefined;
    };

    const toDateString = (value: unknown): string => {
      if (value === null || value === undefined || value === "") return "";

      const formatLocal = (d: Date) => {
        const yyyy = d.getFullYear();
        if (yyyy < 1900 || yyyy > 2100) return "";
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
      };

      if (value instanceof Date && !isNaN(value.getTime())) {
        return formatLocal(value);
      }
      if (typeof value === "number") {
        const date = XLSX.SSF.parse_date_code(value);
        if (date) {
          const jsDate = new Date(Date.UTC(date.y, date.m - 1, date.d));
          return jsDate.toISOString().slice(0, 10);
        }
      }
      const text = String(value).trim();

      // Coba parse format lokal DD/MM/YYYY atau DD-MM-YYYY
      const match = text.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
      if (match) {
        const year = parseInt(match[3], 10);
        if (year >= 1900 && year <= 2100) {
          return `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
        }
        return "";
      }

      const parsed = new Date(text);
      if (!isNaN(parsed.getTime())) return formatLocal(parsed);
      return text;
    };

    // Cek apakah kolom tanggal ada di header
    const hasTanggalCol = aliases.tanggal.some(
      (k) => Object.prototype.hasOwnProperty.call(headerMap, k)
    );

    // Pre-scan untuk mencari tanggal pertama di kolom tanggal (berguna jika baris atas kosong)
    if (hasTanggalCol && !sheetDate) {
      for (let i = headerIndex + 1; i < rows.length; i++) {
        const d = toDateString(getCell(rows[i] || [], "tanggal"));
        if (d) {
          sheetDate = d;
          break;
        }
      }
    }

    let lastSeenTanggal = sheetDate;

    // Parse baris data
    for (let i = headerIndex + 1; i < rows.length; i++) {
      const row = rows[i] || [];

      // Skip baris kosong
      if (row.every((c) => c === null || c === undefined || String(c).trim() === "")) continue;

      // Skip baris kategori & footer (Cake, Donat, Minuman, TOTAL, dll)
      const firstNonNull = row.find((c) => c !== null && c !== undefined && String(c).trim() !== "");
      if (isSkipRow(firstNonNull)) continue;

      // Ambil tanggal: dari kolom jika ada, fallback ke lastSeenTanggal
      let tanggal = "";
      if (hasTanggalCol) {
        tanggal = toDateString(getCell(row, "tanggal"));
      }
      if (tanggal) {
        lastSeenTanggal = tanggal;
      } else {
        tanggal = lastSeenTanggal;
      }

      const nama_produk = String(getCell(row, "nama_produk") ?? "").trim();
      const jumlah_terjual = toNumber(getCell(row, "jumlah_terjual"));

      // Wajib ada nama produk dan jumlah terjual
      if (!nama_produk || jumlah_terjual === undefined) continue;

      // Skip baris yang nama produknya seperti header (mengandung "nama", "roti", dll)
      if (/^(nama|roti|produk|barang|item)$/i.test(nama_produk)) continue;

      allRows.push({
        tanggal,
        nama_produk,
        kategori_produk: String(getCell(row, "kategori_produk") ?? "").trim() || undefined,
        stok_awal: toNumber(getCell(row, "stok_awal")),
        barang_masuk: toNumber(getCell(row, "barang_masuk")),
        jumlah_terjual,
        stok_akhir: toNumber(getCell(row, "stok_akhir")),
        harga_jual: toNumber(getCell(row, "harga_jual")),
        total_penjualan: toNumber(getCell(row, "total_penjualan")),
        diskon: toNumber(getCell(row, "diskon")),
      });
    }
  }

  if (allRows.length === 0) {
    throw new Error(
      "Tidak ada data penjualan yang bisa dibaca. Pastikan header mengandung kolom: NAMA ROTI / NAMA PRODUK, LAKU / JUMLAH TERJUAL."
    );
  }

  return allRows;
}
