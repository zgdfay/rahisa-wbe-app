"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Printer, Copy, ShoppingCart, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  Ingredient,
  INGREDIENTS,
  getStockStatus,
  getStatusLabel,
  getStatusColor,
} from "../inventory/components/types";

export default function ShoppingListPage() {
  const [itemsToBuy, setItemsToBuy] = useState<
    {
      ingredient: Ingredient;
      amountToBuy: number;
      status: "critical" | "warning" | "safe";
    }[]
  >([]);

  useEffect(() => {
    // Load inventory
    const savedInventory = localStorage.getItem("inventory_stock");
    const inventory: Ingredient[] = savedInventory
      ? JSON.parse(savedInventory)
      : INGREDIENTS;

    // Filter items that need restocking (not safe, or even safe but not full? Let's stick to warning/critical)
    // User requested "Keputusan restock". Usually means priority items.
    // Let's include anything that is not 100% full? No, that's too much.
    // Let's include Critical and Warning.

    const shoppingList = inventory
      .map((item) => {
        const status = getStockStatus(item.currentStock, item.minStock);
        return {
          ingredient: item,
          amountToBuy: Math.max(0, item.maxStock - item.currentStock),
          status: status,
        };
      })
      .filter((item) => item.status !== "safe" && item.amountToBuy > 0);

    // Sort by priority (Critical first)
    shoppingList.sort((a, b) => {
      if (a.status === "critical" && b.status !== "critical") return -1;
      if (a.status !== "critical" && b.status === "critical") return 1;
      return 0;
    });

    setItemsToBuy(shoppingList);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    if (itemsToBuy.length === 0) {
      toast.info("Tidak ada item di daftar belanja");
      return;
    }

    const text = itemsToBuy
      .map(
        (item) =>
          `- ${item.ingredient.name}: Beli ${item.amountToBuy} ${item.ingredient.unit} (Sisa: ${item.ingredient.currentStock} ${item.ingredient.unit})`
      )
      .join("\n");

    const header = `DAFTAR BELANJA RAHISA BAKERY\nTanggal: ${new Date().toLocaleDateString(
      "id-ID"
    )}\n\n`;

    navigator.clipboard.writeText(header + text).then(() => {
      toast.success("Daftar belanja disalin ke clipboard!");
    });
  };

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
          /* Hide sidebar and other non-printable elements */
          nav,
          aside,
          header,
          .no-print {
            display: none !important;
          }
          /* Ensure content takes full width */
          main,
          .p-4,
          .p-6,
          .p-8 {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          /* Ensure text is black for readability */
          * {
            color: black !important;
          }
          .print\\:text-primary-700 {
            color: inherit !important;
          }
          /* Prevent awkward breaks in table rows */
          tr {
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* Header (Hidden on Print) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-primary-900">
            Rekomendasi Belanja
          </h1>
          <p className="text-muted mt-1">
            Daftar bahan yang perlu di-restock berdasarkan stok saat ini
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCopy}
            className="gap-2 cursor-pointer bg-white"
          >
            <Copy className="w-4 h-4" />
            Salin
          </Button>
          <Button
            onClick={handlePrint}
            className="gap-2 cursor-pointer shadow-lg shadow-primary-500/20 text-white"
          >
            <Printer className="w-4 h-4" />
            Cetak / PDF
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Card className="print:shadow-none print:border-none">
        <div className="hidden print:block mb-8 text-center border-b pb-4">
          <h1 className="text-2xl font-bold">RAHISA BAKERY - SHOPPING LIST</h1>
          <p className="text-sm text-gray-500">
            Tanggal:{" "}
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <CardHeader className="print:hidden">
          <CardTitle className="flex items-center gap-2">Daftar Item</CardTitle>
          <CardDescription>
            Disarankan membeli jumlah ini untuk mencapai Stok Maksimal
          </CardDescription>
        </CardHeader>

        <CardContent>
          {itemsToBuy.length > 0 ? (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader className="bg-primary-50/50">
                  <TableRow>
                    <TableHead className="w-[40%]">Bahan Baku</TableHead>
                    <TableHead>Status Stok</TableHead>
                    <TableHead>Sisa Stok</TableHead>
                    <TableHead className="text-right font-bold text-primary-900">
                      Saran Pembelian
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemsToBuy.map((item) => {
                    const colors = getStatusColor(item.status);
                    return (
                      <TableRow key={item.ingredient.id}>
                        <TableCell>
                          <div className="font-semibold text-primary-900">
                            {item.ingredient.name}
                          </div>
                          <div className="text-xs text-muted print:hidden">
                            Max: {item.ingredient.maxStock}{" "}
                            {item.ingredient.unit}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${colors.badge} capitalize border`}
                          >
                            {getStatusLabel(item.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`${colors.text} font-medium`}>
                            {item.ingredient.currentStock}{" "}
                            {item.ingredient.unit}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-bold text-lg text-primary-700 bg-primary-50 inline-block px-3 py-1 rounded-lg border border-primary-100 print:border-gray-300 print:bg-transparent">
                            + {item.amountToBuy}{" "}
                            <span className="text-sm font-normal text-muted-foreground">
                              {item.ingredient.unit}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-green-50 rounded-xl border border-green-100 border-dashed">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-green-900">
                Semua Stok Aman!
              </h3>
              <p className="text-green-700 mt-1 max-w-sm">
                Tidak ada bahan yang perlu dibeli saat ini. Semua stok berada di
                atas batas minimum.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Print Footer */}
      <div className="hidden print:block mt-8 pt-8 border-t text-sm text-center text-gray-400">
        Dicetak dari Sistem Manajemen Rahisa Bakery
      </div>
    </div>
  );
}
