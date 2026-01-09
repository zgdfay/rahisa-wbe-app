"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Attempting to use shadcn tabs if available, otherwise will fallback to buttons in next step if error
import {
  Download,
  FileText,
  TrendingUp,
  Package,
  BarChart3,
  Printer,
} from "lucide-react";
import { toast } from "sonner";

import { Transaction } from "../sales/components/types";
import {
  Ingredient,
  getStockStatus,
  getStatusColor,
  getStatusLabel,
} from "../inventory/components/types";

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
  const [stockData, setStockData] = useState<Ingredient[]>([]);
  const [activeTab, setActiveTab] = useState("sales");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  useEffect(() => {
    // Load Sales Data
    const savedSales = localStorage.getItem("sales_transactions");
    if (savedSales) {
      setSalesData(JSON.parse(savedSales));
    }

    // Load Stock Data
    const savedStock = localStorage.getItem("inventory_stock");
    if (savedStock) {
      setStockData(JSON.parse(savedStock));
    }
  }, []);

  // --- Filter Logic ---
  // 1. Get unique months from sales data
  const availableMonths = Array.from(
    new Set(
      salesData.map((t) => {
        // Assuming date format YYYY-MM-DD
        const date = new Date(t.date);
        return date.toLocaleString("id-ID", { month: "long", year: "numeric" });
      })
    )
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // Newest first

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

  // --- Export Logic ---
  const downloadCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      toast.error("Tidak ada data untuk diexport");
      return;
    }

    // Generate Header
    const headers = Object.keys(data[0]).join(",");

    // Generate Rows
    const rows = data
      .map((obj) =>
        Object.values(obj)
          .map((val) => (typeof val === "string" ? `"${val}"` : val))
          .join(",")
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
      }.csv`
    );
  };

  const handleExportStock = () => {
    const dataToExport = stockData.map((i) => ({
      Nama: i.name,
      Stok: i.currentStock,
      Unit: i.unit,
      Status: getStockStatus(i.currentStock, i.minStock),
      MinStock: i.minStock,
      MaxStock: i.maxStock,
    }));
    downloadCSV(
      dataToExport,
      `laporan_stok_${new Date().toISOString().split("T")[0]}.csv`
    );
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

  const lowStockCount = stockData.filter(
    (i) => getStockStatus(i.currentStock, i.minStock) !== "safe"
  ).length;

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
            <Button
              onClick={handleExportSales}
              className="gap-2 cursor-pointer text-white shadow-lg shadow-primary-500/20"
            >
              <Download className="w-4 h-4" />
              Export Penjualan (.csv)
            </Button>
          )}
          {activeTab === "stock" && (
            <Button
              onClick={handleExportStock}
              className="gap-2 cursor-pointer text-white shadow-lg shadow-primary-500/20"
            >
              <Download className="w-4 h-4" />
              Export Stok (.csv)
            </Button>
          )}
        </div>
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
              onValueChange={(val) => setSelectedMonth(val)}
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
        {activeTab === "stock" && (
          <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg border border-blue-100 w-fit text-blue-800 text-sm">
            <Package className="w-4 h-4" />
            <span>
              Laporan menunjukkan <strong>Posisi Stok Terkini</strong>{" "}
              (Real-time)
            </span>
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
            onClick={() => setActiveTab("stock")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
              activeTab === "stock"
                ? "bg-primary-500 text-white shadow-md"
                : "hover:bg-primary-50 text-gray-600"
            }`}
          >
            <Package className="w-4 h-4" /> Laporan Stok
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
                    {filteredSales.length > 0 ? (
                      filteredSales.map((t) => (
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
            </div>
          )}

          {/* Stock Report */}
          {(activeTab === "stock" ||
            (typeof window !== "undefined" &&
              window.matchMedia("print").matches)) && (
            <div
              className={`space-y-6 ${
                activeTab !== "stock"
                  ? "hidden print:block print:mt-8 print:break-before-page"
                  : ""
              }`}
            >
              <h2 className="text-xl font-bold hidden print:block mb-4 border-b pb-2">
                Laporan Stok Bahan
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm font-medium text-muted">
                      Total Jenis Bahan
                    </div>
                    <div className="text-2xl font-bold text-primary-600">
                      {stockData.length} Item
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm font-medium text-muted">
                      Status Perlu Perhatian
                    </div>
                    <div
                      className={`text-2xl font-bold ${
                        lowStockCount > 0 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {lowStockCount} Item
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-white rounded-xl border border-primary-100 shadow-sm overflow-hidden">
                <Table>
                  <TableHeader className="bg-primary-50/50">
                    <TableRow>
                      <TableHead>Nama Bahan</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Stok Saat Ini</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="print:hidden">Keterangan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockData.length > 0 ? (
                      stockData.map((item) => {
                        const status = getStockStatus(
                          item.currentStock,
                          item.minStock
                        );
                        const colors = getStatusColor(status);
                        return (
                          <TableRow key={item.id}>
                            <TableCell className="font-semibold text-primary-900">
                              {item.name}
                            </TableCell>
                            <TableCell>{item.unit}</TableCell>
                            <TableCell className="font-mono font-medium">
                              {item.currentStock}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`${colors.badge} border`}
                              >
                                {getStatusLabel(status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted print:hidden">
                              Min: {item.minStock} / Max: {item.maxStock}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center h-24 text-muted"
                        >
                          Belum ada data stok
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
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
