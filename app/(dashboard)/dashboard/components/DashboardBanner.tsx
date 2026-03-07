"use client";

import { useState } from "react";
import { TrendingUp, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function DashboardBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-3xl p-4 flex items-center justify-between animate-slide-down relative group">
      <div className="flex items-center gap-3 pr-8">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-900">
            Prediksi Penjualan Tersedia
          </p>
          <p className="text-xs text-blue-700 mt-0.5">
            Lihat prediksi penjualan besok untuk mempersiapkan stok produk.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/predictions">
          <Button
            size="sm"
            variant="outline"
            className="h-8 bg-white/50 hover:bg-white text-blue-900 border-blue-200 text-xs font-semibold rounded-xl cursor-pointer"
          >
            Lihat Prediksi <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
        <button
          onClick={() => setIsVisible(false)}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-100 text-blue-500 hover:text-blue-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
