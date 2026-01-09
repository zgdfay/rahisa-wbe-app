"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Transaction } from "./components/types";
import { SalesInputForm } from "./components/SalesInputForm";
import { SalesHistoryTable } from "./components/SalesHistoryTable";
import { SalesTrendChart } from "./components/SalesTrendChart";

export default function SalesPage() {
  const [activeTab, setActiveTab] = useState("input");
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Load transactions from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("sales_transactions");
    if (saved) {
      try {
        setTransactions(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse transactions", e);
      }
    } else {
      // Seed dummy data if empty
      const dummyData: Transaction[] = [];
      const products = [
        { id: "roti-tawar", name: "Roti Tawar Spesial", price: 15000 },
        { id: "croissant", name: "Butter Croissant", price: 12000 },
        { id: "bolu-pandan", name: "Bolu Pandan", price: 35000 },
        { id: "donat", name: "Donat Kentang", price: 5000 },
        { id: "sourdough", name: "Sourdough Bread", price: 25000 },
      ];

      // Helper to generate random transactions
      const generateRandomTrx = (date: string, count: number) => {
        for (let i = 0; i < count; i++) {
          const prod = products[Math.floor(Math.random() * products.length)];
          const qty = Math.floor(Math.random() * 5) + 1;
          dummyData.push({
            id: `TRX-${Date.now()}-${dummyData.length}`,
            date: date,
            time: "10:00", // placeholder time
            productId: prod.id,
            productName: prod.name,
            quantity: qty,
            totalPrice: prod.price * qty,
            status: "completed",
          });
        }
      };

      // Generate for Dec 2025 (1st to 31st)
      for (let d = 1; d <= 31; d++) {
        // Randomly skip some days to generate realistic trends
        if (Math.random() > 0.2) {
          const day = d < 10 ? `0${d}` : d;
          // Random number of transactions per day (1-5)
          generateRandomTrx(
            `2025-12-${day}`,
            Math.floor(Math.random() * 5) + 1
          );
        }
      }

      // Generate for Jan 2026 (1st to 8th)
      for (let d = 1; d <= 8; d++) {
        const day = d < 10 ? `0${d}` : d;
        generateRandomTrx(`2026-01-${day}`, Math.floor(Math.random() * 6) + 2);
      }

      setTransactions(dummyData);
      localStorage.setItem("sales_transactions", JSON.stringify(dummyData));
    }
  }, []);

  const handleSaveTransaction = (newTransaction: Transaction) => {
    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);
    localStorage.setItem(
      "sales_transactions",
      JSON.stringify(updatedTransactions)
    );
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
