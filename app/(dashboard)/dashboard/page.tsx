"use client";

import { useState, useEffect } from "react";
import { DashboardBanner } from "./components/DashboardBanner";
import { DashboardStats } from "./components/DashboardStats";
import { DashboardChart } from "./components/DashboardChart";
import { CheckCircle2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Transaction {
  id: string;
  date: string;
  totalPrice: number;
  status: string;
}

export default function DashboardPage() {
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
    }
  }, []);

  const currentHour = new Date().getHours();
  let greeting = "Selamat Malam";
  if (currentHour < 12) greeting = "Selamat Pagi";
  else if (currentHour < 15) greeting = "Selamat Siang";
  else if (currentHour < 18) greeting = "Selamat Sore";

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Alert Notification / Banner */}
      <DashboardBanner />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-primary-900">
            {greeting}, Admin!
          </h1>
          <p className="text-muted mt-1">
            Pantau performa Rahisa Bakery & Cafe hari ini.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <DashboardStats transactions={transactions} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Overview Chart */}
        <DashboardChart transactions={transactions} />

        {/* Recent Tasks / Notifications (Static for now, can be modularized later) */}
        <div className="p-8 bg-white/70 backdrop-blur-md rounded-[2.5rem] border border-white/60 shadow-xl shadow-primary-900/5 flex flex-col">
          <h2 className="text-xl font-bold text-primary-900 mb-8">
            Aktivitas Terbaru
          </h2>
          <div className="space-y-2 mb-2">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-emerald-900">
                  Penjualan Stabil
                </p>
                <p className="text-[11px] text-emerald-700 font-medium">
                  Performa penjualan hari ini sesuai target
                </p>
              </div>
            </div>
            <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-primary-900">
                  Prediksi Besok Tinggi
                </p>
                <p className="text-[11px] text-primary-700 font-medium">
                  Persiapkan stok produk +20% dari biasa
                </p>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            className="mt-auto text-primary-600 hover:text-primary-900 hover:bg-primary-100 rounded-xl transition-all duration-300"
          >
            Lihat Semua
          </Button>
        </div>
      </div>
    </div>
  );
}
