"use client";

import {
  ShoppingBag,
  TrendingUp,
  Layers,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  date: string;
  totalPrice: number;
  status: string;
}

interface DashboardStatsProps {
  transactions: Transaction[];
}

export function DashboardStats({ transactions }: DashboardStatsProps) {
  // Calculate today's sales
  const today = new Date().toLocaleDateString("en-CA");
  const todaysTransactions = transactions.filter(
    (t) => t.date === today && t.status === "completed"
  );
  const todaysRevenue = todaysTransactions.reduce(
    (acc, curr) => acc + curr.totalPrice,
    0
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const stats = [
    {
      label: "Penjualan Hari Ini",
      value: formatCurrency(todaysRevenue),
      description: `${todaysTransactions.length} transaksi hari ini`,
      icon: ShoppingBag,
      trend: "+12%", // Placeholder for trend logic
      trendUp: true,
    },
    {
      label: "Total Transaksi",
      value: `${transactions.length} Trx`,
      description: "Semua waktu",
      icon: TrendingUp,
      trend: "+5%",
      trendUp: true,
    },
    {
      label: "Status Stok Bahan",
      value: "80% Aman",
      description: "2 bahan perlu restock",
      icon: Layers,
      trend: "Normal",
      trendUp: true,
    },
    {
      label: "Efisiensi Produksi",
      value: "94.2%",
      description: "Minggu ini",
      icon: CheckCircle2,
      trend: "+1.2%",
      trendUp: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="group p-6 bg-white/70 backdrop-blur-md rounded-[2.5rem] border border-white/60 shadow-xl shadow-primary-900/5 hover:scale-[1.02] transition-all duration-300 cursor-default"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary-50 text-primary-700 rounded-2xl transition-colors duration-300">
              <stat.icon className="w-6 h-6" />
            </div>
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full",
                stat.trendUp
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-red-50 text-red-600"
              )}
            >
              {stat.trendUp ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {stat.trend}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted">{stat.label}</p>
            <h3 className="text-2xl font-bold text-primary-900 mt-1">
              {stat.value}
            </h3>
            <p className="text-xs text-muted mt-1">{stat.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
