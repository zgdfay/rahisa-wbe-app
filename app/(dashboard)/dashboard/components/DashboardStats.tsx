"use client";

import {
  ShoppingBag,
  TrendingUp,
  Package,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  date: string;
  totalPrice: number;
  quantity?: number;
  status: string;
}

interface DashboardStatsProps {
  transactions: Transaction[];
}

export function DashboardStats({ transactions }: DashboardStatsProps) {
  // Determine the latest transaction date to use as "Today" for demo purposes
  let todayStr = new Date().toLocaleDateString("en-CA");
  if (transactions.length > 0) {
    const latestDateStr = [...transactions]
      .map((t) => t.date)
      .filter(Boolean)
      .sort()
      .pop();
    if (latestDateStr) {
      todayStr = latestDateStr;
    }
  }

  const completedTransactions = transactions.filter((t) => t.status === "completed");

  const todaysTransactions = completedTransactions.filter(
    (t) => t.date === todayStr
  );
  
  const todaysRevenue = todaysTransactions.reduce(
    (acc, curr) => acc + curr.totalPrice,
    0
  );

  const totalProductsSold = completedTransactions.reduce(
    (acc, curr) => acc + (curr.quantity || 0),
    0
  );

  const avgTransactionValue =
    completedTransactions.length > 0
      ? completedTransactions.reduce((acc, curr) => acc + curr.totalPrice, 0) /
        completedTransactions.length
      : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("id-ID").format(num);
  };

  // Convert the todayStr to a readable string like "30 Jan"
  const formattedToday = new Date(todayStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

  const stats = [
    {
      label: "Penjualan Hari Ini",
      value: formatCurrency(todaysRevenue),
      description: `${todaysTransactions.length} transaksi tgl ${formattedToday}`,
      icon: ShoppingBag,
      trend: "+12%",
      trendUp: true,
    },
    {
      label: "Total Transaksi",
      value: `${formatNumber(completedTransactions.length)} Trx`,
      description: "Transaksi Selesai",
      icon: TrendingUp,
      trend: "+5%",
      trendUp: true,
    },
    {
      label: "Total Produk Terjual",
      value: `${formatNumber(totalProductsSold)} Pcs`,
      description: "Berdasarkan riwayat",
      icon: Package,
      trend: "+8%",
      trendUp: true,
    },
    {
      label: "Rata-rata Transaksi",
      value: formatCurrency(avgTransactionValue),
      description: "Nilai rata-rata order",
      icon: Receipt,
      trend: "+2%",
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
