"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, Trash2 } from "lucide-react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    try {
      const res = await fetch("/api/sales", { method: "DELETE" });
      if (res.ok) {
        await handleRefresh();
        alert("Data penjualan berhasil direset.");
      } else {
        const errorText = await res.text();
        alert(`Gagal mereset data: ${errorText} (Status: ${res.status})`);
      }
    } catch (e) {
      alert("Error: " + String(e));
    }
  };


  return (
    <div className="space-y-8 animate-fade-in">
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
            onChange={async (e) => {
              const input = e.currentTarget;
              const f = input.files?.[0];
              if (!f) return;
              const fd = new FormData();
              fd.append("file", f);
              try {
                const res = await fetch("/api/import-sales", { method: "POST", body: fd });
                if (res.ok) {
                  // refresh
                  await handleRefresh();
                  alert("Import sukses");
                } else {
                  const txt = await res.json();
                  alert("Import gagal: " + JSON.stringify(txt));
                }
              } catch (err) {
                alert("Import error: " + String(err));
              } finally {
                input.value = "";
              }
            }}
          />
          {userRole === "admin" && (
            <Button
              type="button"
              onClick={handleResetData}
              variant="outline"
              className="gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Reset Data
            </Button>
          )}
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="gap-2 text-white bg-primary-600 hover:bg-primary-700"
          >
            <Upload className="h-4 w-4" />
            Import Excel
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
