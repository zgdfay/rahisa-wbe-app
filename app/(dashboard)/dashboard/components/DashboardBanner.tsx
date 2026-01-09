"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, AlertCircle, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Ingredient,
  getStockStatus,
  INGREDIENTS,
} from "../../inventory/components/types";

export function DashboardBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [criticalItems, setCriticalItems] = useState<Ingredient[]>([]);
  const [warningItems, setWarningItems] = useState<Ingredient[]>([]);

  useEffect(() => {
    // Load inventory from localStorage
    const savedInventory = localStorage.getItem("inventory_stock");
    const inventory: Ingredient[] = savedInventory
      ? JSON.parse(savedInventory)
      : INGREDIENTS;

    // Filter critical and warning items
    const critical = inventory.filter(
      (item) => getStockStatus(item.currentStock, item.minStock) === "critical"
    );
    const warning = inventory.filter(
      (item) => getStockStatus(item.currentStock, item.minStock) === "warning"
    );

    setCriticalItems(critical);
    setWarningItems(warning);
  }, []);

  if (!isVisible) return null;

  // Determine what to show: Critical takes priority over Warning
  const showCritical = criticalItems.length > 0;
  const showWarning = !showCritical && warningItems.length > 0;

  // If no warnings or critical items, don't show banner
  if (!showCritical && !showWarning) return null;

  // Define colors and content based on severity
  const bannerConfig = showCritical
    ? {
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        iconBgColor: "bg-red-100",
        iconColor: "text-red-600",
        textPrimaryColor: "text-red-900",
        textSecondaryColor: "text-red-700",
        buttonBgColor: "bg-white/50 hover:bg-white",
        buttonTextColor: "text-red-900",
        buttonBorderColor: "border-red-200",
        hoverBgColor: "hover:bg-red-100",
        hoverTextColor: "text-red-500 hover:text-red-700",
        Icon: AlertCircle,
        title: `${criticalItems.length} Bahan Stok Kritis!`,
        description: `${criticalItems[0]?.name} dan ${
          criticalItems.length > 1
            ? `${criticalItems.length - 1} bahan lainnya`
            : ""
        } hampir habis. Segera restock!`,
      }
    : {
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
        iconBgColor: "bg-amber-100",
        iconColor: "text-amber-600",
        textPrimaryColor: "text-amber-900",
        textSecondaryColor: "text-amber-700",
        buttonBgColor: "bg-white/50 hover:bg-white",
        buttonTextColor: "text-amber-900",
        buttonBorderColor: "border-amber-200",
        hoverBgColor: "hover:bg-amber-100",
        hoverTextColor: "text-amber-500 hover:text-amber-700",
        Icon: AlertTriangle,
        title: `${warningItems.length} Bahan Perlu Diisi`,
        description: `${warningItems[0]?.name} ${
          warningItems.length > 1
            ? `dan ${warningItems.length - 1} bahan lainnya`
            : ""
        } stoknya menipis.`,
      };

  const { Icon } = bannerConfig;

  return (
    <div
      className={`${bannerConfig.bgColor} border ${bannerConfig.borderColor} rounded-3xl p-4 flex items-center justify-between animate-slide-down relative group cursor-pointer`}
    >
      <div className="flex items-center gap-3 pr-8">
        <div
          className={`w-10 h-10 rounded-full ${bannerConfig.iconBgColor} flex items-center justify-center flex-shrink-0`}
        >
          <Icon className={`w-5 h-5 ${bannerConfig.iconColor}`} />
        </div>
        <div>
          <p
            className={`text-sm font-semibold ${bannerConfig.textPrimaryColor}`}
          >
            {bannerConfig.title}
          </p>
          <p className={`text-xs ${bannerConfig.textSecondaryColor} mt-0.5`}>
            {bannerConfig.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/inventory">
          <Button
            size="sm"
            variant="outline"
            className={`h-8 ${bannerConfig.buttonBgColor} ${bannerConfig.buttonTextColor} ${bannerConfig.buttonBorderColor} text-xs font-semibold rounded-xl cursor-pointer`}
          >
            Cek Stok Bahan <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
        <button
          onClick={() => setIsVisible(false)}
          className={`w-8 h-8 flex items-center justify-center rounded-full ${bannerConfig.hoverBgColor} ${bannerConfig.hoverTextColor} transition-colors`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
