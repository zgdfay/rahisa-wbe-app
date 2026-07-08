"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, Trash2, Loader2, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Transaction } from "./components/types";
import { SalesInputForm } from "./components/SalesInputForm";
import { SalesHistoryTable } from "./components/SalesHistoryTable";
import { SalesTrendChart } from "./components/SalesTrendChart";

export default function SalesPage() {
  const [activeTab, setActiveTab] = useState("input");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userRole, setUserRole] = useState("admin");
  const [isImporting, setIsImporting] = useState(false);
  const [importStepText, setImportStepText] = useState("");
  const [importProgress, setImportProgress] = useState(0);
  const [isResetting, setIsResetting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importAbortControllerRef = useRef<AbortController | null>(null);

  // Load transactions and role from client/server storage on mount
  useEffect(() => {
    const loadFromServer = async () => {
      try {
        const res = await fetch("/api/sales");
        if (res.ok) {
          const json = await res.json();
          setTransactions(json || []);
        }
      } catch (e) {
        console.error("Failed to load transactions from server", e);
      }
    };

    loadFromServer();

    const timer = setTimeout(() => {
      try {
        const session = localStorage.getItem("user_session");
        if (session) {
          const parsed = JSON.parse(session);
          if (parsed.role) setUserRole(parsed.role);
        }
      } catch (e) {
        console.error(e);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const handleSaveTransaction = (newTransaction: Transaction) => {
    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);
  };

  // Refresh data from server (use after import)
  const handleRefresh = async () => {
    try {
      const res = await fetch("/api/sales");
      if (res.ok) {
        const json = await res.json();
        setTransactions(json || []);
      }
    } catch (e) {
      console.error("refresh failed", e);
    }
  };

  const handleResetData = async () => {
    const confirm = window.confirm(
      "Apakah kamu yakin ingin mereset/menghapus semua data penjualan? Aksi ini tidak dapat dibatalkan."
    );
    if (!confirm) return;

    setIsResetting(true);
    try {
      const res = await fetch("/api/sales", { method: "DELETE" });
      if (res.ok) {
        await handleRefresh();
        toast.success("Reset Data Berhasil", {
          description: "Semua data penjualan berhasil direset dari Supabase.",
        });
      } else {
        const errorText = await res.text();
        toast.error("Gagal Mereset Data", {
          description: `${errorText} (Status: ${res.status})`,
        });
      }
    } catch (e) {
      toast.error("Error Koneksi", {
        description: String(e),
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleCancelImport = () => {
    if (importAbortControllerRef.current) {
      importAbortControllerRef.current.abort();
      importAbortControllerRef.current = null;
    }
    setIsImporting(false);
    setImportProgress(0);
    setImportStepText("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.info("Impor Dibatalkan", {
      description: "Proses impor file Excel telah dibatalkan.",
    });
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const f = input.files?.[0];
    if (!f) return;

    const controller = new AbortController();
    importAbortControllerRef.current = controller;

    setIsImporting(true);
    setImportStepText("Membaca struktur & baris file Excel...");
    setImportProgress(20);

    const stepTimer1 = setTimeout(() => {
      setImportStepText("Mencocokkan produk & memproses tanggal...");
      setImportProgress(50);
    }, 1500);

    const stepTimer2 = setTimeout(() => {
      setImportStepText("Menyimpan transaksi ke database Supabase...");
      setImportProgress(80);
    }, 3500);

    const fd = new FormData();
    fd.append("file", f);

    try {
      const res = await fetch("/api/import-sales", {
        method: "POST",
        body: fd,
        signal: controller.signal,
      });
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (res.ok) {
        setImportProgress(100);
        setImportStepText("Impor berhasil diselesaikan!");
        await handleRefresh();
        toast.success("Import Excel Berhasil!", {
          description: "Seluruh data transaksi berhasil disinkronkan ke Supabase.",
        });
      } else {
        const txt = await res.json().catch(() => ({ error: "Unknown error" }));
        toast.error("Gagal Mengimpor Excel", {
          description: txt.error || JSON.stringify(txt),
        });
      }
    } catch (err: unknown) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      toast.error("Terjadi Kesalahan Koneksi", {
        description: String(err),
      });
    } finally {
      input.value = "";
      importAbortControllerRef.current = null;
      setTimeout(() => {
        setIsImporting(false);
        setImportProgress(0);
        setImportStepText("");
      }, 700);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Overlay Modal Loading Import */}
      {isImporting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-primary-200 dark:border-primary-800 p-8 max-w-md w-full mx-4 space-y-6 text-center transform transition-all">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-primary-100 dark:border-primary-950" />
              <div className="absolute inset-0 rounded-full border-4 border-t-primary-800 border-r-primary-500 border-b-transparent border-l-transparent animate-spin" />
              <FileSpreadsheet className="w-8 h-8 text-primary-700 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-primary-900 dark:text-white">
                Memproses File Excel...
              </h3>
              <p className="text-sm text-muted-foreground font-medium transition-all duration-300">
                {importStepText || "Mohon tunggu sebentar..."}
              </p>
            </div>

            {/* Animated Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-primary-100 dark:bg-primary-950 h-3 rounded-full overflow-hidden p-0.5 shadow-inner">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500 ease-out shadow-sm"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground font-semibold px-1">
                <span>Sinkronisasi Supabase</span>
                <span className="text-primary-600 font-bold">{importProgress}%</span>
              </div>
            </div>

            <div className="p-3.5 bg-primary-50 dark:bg-primary-950/60 rounded-xl border border-primary-100 dark:border-primary-900/40 text-xs text-primary-700 dark:text-primary-300 font-medium">
              Jangan menutup atau memuat ulang halaman hingga proses selesai.
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleCancelImport}
              className="w-full border-primary-200 dark:border-primary-800 text-muted-foreground hover:text-red-600 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer font-medium"
            >
              Batalkan Impor
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-900">Penjualan</h1>
          <p className="text-muted mt-1">
            Kelola transaksi dan pantau performa penjualan produk.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleImportExcel}
          />
          {userRole === "admin" && (
            <Button
              type="button"
              disabled={isResetting || isImporting}
              onClick={handleResetData}
              variant="outline"
              className="gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 cursor-pointer"
            >
              {isResetting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mereset...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Reset Data
                </>
              )}
            </Button>
          )}
          <Button
            type="button"
            disabled={isImporting || isResetting}
            onClick={() => fileInputRef.current?.click()}
            className="gap-2 text-white bg-primary-600 hover:bg-primary-700 cursor-pointer shadow-md shadow-primary-600/20"
          >
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Mengimpor...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Import Excel
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs
        defaultValue="input"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full max-w-[400px] grid-cols-3 mb-8 cursor-pointer">
          <TabsTrigger value="input" className="cursor-pointer">
            Input
          </TabsTrigger>
          <TabsTrigger value="history" className="cursor-pointer">
            Riwayat
          </TabsTrigger>
          <TabsTrigger value="trends" className="cursor-pointer">
            Tren
          </TabsTrigger>
        </TabsList>

        <TabsContent value="input">
          <SalesInputForm
            onSave={handleSaveTransaction}
            transactions={transactions}
          />
        </TabsContent>

        <TabsContent value="history">
          <SalesHistoryTable transactions={transactions} />
        </TabsContent>

        <TabsContent value="trends">
          <SalesTrendChart transactions={transactions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
