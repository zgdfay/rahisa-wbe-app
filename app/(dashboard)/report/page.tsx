"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, Upload, TrendingUp, BarChart3, Printer, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { Transaction } from "../sales/components/types";

// Helper to format currency
const formatRupiah = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

export default function ReportPage() {
  const [salesData, setSalesData] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState("sales");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load Sales Data from server
    const load = async () => {
      try {
        const res = await fetch("/api/sales");
        if (!res.ok) return;
        const data: Transaction[] = await res.json();
        setSalesData(data || []);
      } catch (e) {
        console.error("Failed to load sales", e);
      }
    };
    load();
  }, []);

  // --- Filter Logic ---
  // 1. Get unique months from sales data
  const availableMonths = Array.from(
    new Set(
      salesData.map((t) => {
        if (!t.date) return "";
        const date = new Date(t.date);
        if (isNaN(date.getTime())) return "";
        return date.toLocaleString("id-ID", { month: "long", year: "numeric" });
      }).filter(Boolean),
    ),
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  // 2. Filter sales based on selected month
  const filteredSales =
    selectedMonth === "all"
      ? salesData
      : salesData.filter((t) => {
          const date = new Date(t.date);
          const monthStr = date.toLocaleString("id-ID", {
            month: "long",
            year: "numeric",
          });
          return monthStr === selectedMonth;
        });

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // --- Export Logic ---
  const downloadCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      toast.error("Tidak ada data untuk diexport");
      return;
    }

    const headers = Object.keys(data[0]).join(",");
    const rows = data
      .map((obj) =>
        Object.values(obj)
          .map((val) => (typeof val === "string" ? `"${val}"` : val))
          .join(","),
      )
      .join("\n");

    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("File CSV berhasil didownload");
  };

  const handleExportSales = () => {
    const dataToExport = filteredSales.map((t) => ({
      ID: t.id,
      Tanggal: t.date,
      Jam: t.time,
      Produk: t.productName,
      Qty: t.quantity,
      Total: t.totalPrice,
      Status: t.status,
    }));
    downloadCSV(
      dataToExport,
      `laporan_penjualan_${
        selectedMonth === "all" ? "semua" : selectedMonth.replace(" ", "_")
      }.csv`,
    );
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.trim().split("\n");

        if (lines.length < 2) {
          toast.error("File CSV kosong atau tidak valid");
          return;
        }

        // Parse header
        const headers = lines[0]
          .split(",")
          .map((h) => h.trim().replace(/"/g, "").toLowerCase());

        // Map header names to Transaction fields
        const headerMap: Record<string, string> = {
          id: "id",
          tanggal: "date",
          jam: "time",
          produk: "productName",
          qty: "quantity",
          total: "totalPrice",
          status: "status",
        };

        const mappedHeaders = headers.map((h) => headerMap[h] || h);

        // Parse rows
        const newTransactions: Transaction[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i]
            .split(",")
            .map((v) => v.trim().replace(/^"|"$/g, ""));
          if (values.length < mappedHeaders.length) continue;

          const row: any = {};
          mappedHeaders.forEach((header, idx) => {
            row[header] = values[idx];
          });

          // Convert types
          newTransactions.push({
            id: row.id || `import-${Date.now()}-${i}`,
            date: row.date || "",
            time: row.time || "",
            productId:
              row.productId ||
              row.productName?.toLowerCase().replace(/\s+/g, "-") ||
              "",
            productName: row.productName || "",
            quantity: Number(row.quantity) || 0,
            totalPrice: Number(row.totalPrice) || 0,
            status: (["completed", "pending", "cancelled"].includes(row.status)
              ? row.status
              : "completed") as Transaction["status"],
          });
        }

        if (newTransactions.length === 0) {
          toast.error("Tidak ada data valid ditemukan di file CSV");
          return;
        }

        // Merge with existing data
        const existingIds = new Set(salesData.map((t) => t.id));
        const uniqueNew = newTransactions.filter((t) => !existingIds.has(t.id));
        const merged = [...salesData, ...uniqueNew];

        setSalesData(merged);

        // Persist new records to server (fire-and-forget, onload tidak bisa async)
        fetch("/api/sales", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(uniqueNew),
        }).catch((e) => console.error("Failed to persist imported CSV", e));

        toast.success(
          `Berhasil import ${uniqueNew.length} data penjualan!${uniqueNew.length < newTransactions.length ? ` (${newTransactions.length - uniqueNew.length} data duplikat diabaikan)` : ""}`,
        );
      } catch (err) {
        console.error(err);
        toast.error("Gagal membaca file CSV. Pastikan format file benar.");
      }
    };
    reader.readAsText(file);

    // Reset input so the same file can be re-imported
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePrint = () => {
    window.print();
  };

  // --- Calculations ---
  const totalRevenue = filteredSales
    .filter((t) => t.status === "completed")
    .reduce((acc, curr) => acc + curr.totalPrice, 0);

  const totalSoldItems = filteredSales
    .filter((t) => t.status === "completed")
    .reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="space-y-8 animate-fade-in p-1 print:p-0">
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 20mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          nav,
          aside,
          header,
          .no-print,
          .tabs-list {
            display: none !important;
          }
          main,
          .p-4,
          .p-6,
          .p-8 {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          * {
            color: black !important;
          }
          .print-hidden {
            display: none !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-primary-900">
            Laporan & Arsip
          </h1>
          <p className="text-muted mt-1">
            Pusat data dan dokumentasi operasional toko
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handlePrint}
            variant="outline"
            className="gap-2 cursor-pointer bg-white"
          >
            <Printer className="w-4 h-4" />
            Cetak PDF
          </Button>
          {activeTab === "sales" && (
            <>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="gap-2 cursor-pointer bg-white"
              >
                <Upload className="w-4 h-4" />
                Import CSV
              </Button>
              <Button
                onClick={handleExportSales}
                className="gap-2 cursor-pointer text-white shadow-lg shadow-primary-500/20"
              >
                <Download className="w-4 h-4" />
                Export Penjualan (.csv)
              </Button>
            </>
          )}
        </div>

        {/* Hidden file input for CSV import */}
        <input
          type="file"
          ref={fileInputRef}
          accept=".csv"
          onChange={handleImportCSV}
          className="hidden"
        />
      </div>

      {/* Controls (Month Filter) */}
      <div className="print:hidden">
        {activeTab === "sales" && (
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border w-fit shadow-sm">
            <span className="text-xs font-medium text-gray-500 pl-3">
              Periode:
            </span>
            <Select
              value={selectedMonth}
              onValueChange={(val) => {
                setSelectedMonth(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[150px] h-8 border-0 bg-transparent focus:ring-0 focus:ring-offset-0 font-semibold text-sm text-primary-900 shadow-none px-2 ring-offset-0">
                <SelectValue placeholder="Pilih Periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="all"
                  className="cursor-pointer font-medium text-sm"
                >
                  Semua Riwayat
                </SelectItem>
                {availableMonths.map((month) => (
                  <SelectItem
                    key={month}
                    value={month}
                    className="cursor-pointer text-sm"
                  >
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Tabs Layout */}
      <div className="space-y-4">
        <div className="flex gap-2 border-b pb-4 overflow-x-auto tabs-list print:hidden">
          <button
            onClick={() => setActiveTab("sales")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
              activeTab === "sales"
                ? "bg-primary-500 text-white shadow-md"
                : "hover:bg-primary-50 text-gray-600"
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Laporan Penjualan
          </button>
          <button
            onClick={() => setActiveTab("prediction")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
              activeTab === "prediction"
                ? "bg-primary-500 text-white shadow-md"
                : "hover:bg-primary-50 text-gray-600"
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Laporan Prediksi
          </button>
        </div>

        {/* Content */}
        <div className="min-h-[500px]">
          {/* Sales Report */}
          {(activeTab === "sales" ||
            (typeof window !== "undefined" &&
              window.matchMedia("print").matches)) && (
            <div
              className={`space-y-6 ${
                activeTab !== "sales" ? "hidden print:block print:mt-8" : ""
              }`}
            >
              <h2 className="text-xl font-bold hidden print:block mb-4 border-b pb-2">
                Laporan Penjualan
              </h2>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm font-medium text-muted">
                      Total Pendapatan
                    </div>
                    <div className="text-2xl font-bold text-primary-600">
                      {formatRupiah(totalRevenue)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm font-medium text-muted">
                      Total Produk Terjual
                    </div>
                    <div className="text-2xl font-bold text-primary-600">
                      {totalSoldItems} pcs
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm font-medium text-muted">
                      Total Transaksi
                    </div>
                    <div className="text-2xl font-bold text-primary-600">
                      {salesData.length}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-white rounded-xl border border-primary-100 shadow-sm overflow-hidden">
                <Table>
                  <TableHeader className="bg-primary-50/50">
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Produk</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSales.length > 0 ? (
                      paginatedSales.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="font-medium text-gray-600">
                            {t.date}{" "}
                            <span className="text-xs text-gray-400 ml-1">
                              {t.time}
                            </span>
                          </TableCell>
                          <TableCell className="font-semibold text-primary-900">
                            {t.productName}
                          </TableCell>
                          <TableCell>{t.quantity}</TableCell>
                          <TableCell>{formatRupiah(t.totalPrice)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                t.status === "completed"
                                  ? "default"
                                  : "destructive"
                              }
                              className="text-white hover:text-white"
                            >
                              {t.status === "completed" ? "Selesai" : t.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center h-24 text-muted"
                        >
                          Belum ada data penjualan
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
                <div className="text-sm text-gray-500">
                  Menampilkan <span className="font-medium">{paginatedSales.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> - <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredSales.length)}</span> dari <span className="font-medium">{filteredSales.length}</span> transaksi
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Per halaman:</span>
                    <Select
                      value={itemsPerPage.toString()}
                      onValueChange={(val) => {
                        setItemsPerPage(Number(val));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-[70px] h-8">
                        <SelectValue placeholder="10" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="h-8 w-8"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm font-medium w-12 text-center">
                      {currentPage} / {Math.max(1, totalPages)}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages || totalPages === 0}
                      className="h-8 w-8"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Prediction Report */}
          {(activeTab === "prediction" ||
            (typeof window !== "undefined" &&
              window.matchMedia("print").matches)) && (
            <div
              className={`space-y-6 ${
                activeTab !== "prediction"
                  ? "hidden print:block print:mt-8 print:break-before-page"
                  : ""
              }`}
            >
              <h2 className="text-xl font-bold hidden print:block mb-4 border-b pb-2">
                Laporan Prediksi
              </h2>

              <Card className="bg-blue-50 border-blue-100">
                <CardContent className="pt-6 text-center py-12">
                  <BarChart3 className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-blue-900">
                    Modul Prediksi Tersedia Terpisah
                  </h3>
                  <p className="text-blue-700 max-w-md mx-auto mt-2 mb-6">
                    Analisis prediksi mendalam menggunakan metode Double
                    Exponential Smoothing tersedia di halaman Prediksi.
                  </p>
                  <Button
                    asChild
                    className="no-print text-white hover:text-white"
                  >
                    <a href="/predictions">Buka Halaman Prediksi</a>
                  </Button>
                </CardContent>
              </Card>

              <div className="bg-white p-6 rounded-xl border border-gray-100 hidden print:block">
                <p className="text-center text-gray-500 italic">
                  Lihat lampiran terpisah untuk detail analisis prediksi
                  penjualan.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
