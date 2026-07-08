"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PRODUCTS, Transaction } from "./types";

interface SalesInputFormProps {
  onSave: (transaction: Transaction) => void;
  transactions: Transaction[];
}

export function SalesInputForm({ onSave, transactions }: SalesInputFormProps) {
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const selectedProduct = PRODUCTS.find((p) => p.id === selectedProductId);
  const totalPrice =
    selectedProduct && quantity
      ? selectedProduct.price * parseInt(quantity)
      : 0;

  const handleSaveTransaction = async () => {
    if (!selectedProductId || !quantity || parseInt(quantity) <= 0) {
      toast.error("Mohon lengkapi data produk dan jumlah yang valid.");
      return;
    }

    const product = PRODUCTS.find((p) => p.id === selectedProductId);
    if (!product) return;

    const newTransaction: Transaction = {
      // ... same object creation
      id: `TRX-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString("en-CA"),
      time: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      productId: product.id,
      productName: product.name,
      quantity: parseInt(quantity),
      totalPrice: product.price * parseInt(quantity),
      status: "completed",
    };

    onSave(newTransaction);

    // Reset Form
    setSelectedProductId("");
    setQuantity("");

    // Persist to server-side storage
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTransaction),
      });
      if (!res.ok) {
        const errText = await res.text();
        toast.error(`Gagal menyimpan ke server: ${errText}`);
      } else {
        toast.success("Transaksi berhasil disimpan!", {
          description: `${product.name} - ${quantity} pcs`,
        });
      }
    } catch (e) {
      console.error(e);
      toast.error("Gagal terhubung ke server saat menyimpan transaksi.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Input Penjualan Harian</CardTitle>
          <CardDescription>
            Masukkan data transaksi penjualan baru.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Tanggal</Label>
            <Input
              type="date"
              value={new Date().toLocaleDateString("en-CA")}
              readOnly
              className="bg-primary-50/50 cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <Label>Produk</Label>
            <Select
              onValueChange={setSelectedProductId}
              value={selectedProductId === "" ? undefined : selectedProductId}
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Pilih Produk" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCTS.map((product) => (
                  <SelectItem
                    key={product.id}
                    value={product.id}
                    className="cursor-pointer"
                  >
                    {product.name} - {formatCurrency(product.price)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Jumlah (Pcs)</Label>
              <Input
                type="number"
                placeholder="0"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Total Harga</Label>
              <Input
                type="text"
                value={formatCurrency(totalPrice)}
                readOnly
                className="bg-primary-50/50 font-bold text-primary-900"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Catatan (Opsional)</Label>
            <Input placeholder="Contoh: Pesanan khusus Bu Ani" />
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              disabled={
                !selectedProductId || !quantity || parseInt(quantity) <= 0
              }
              variant="default"
              className="flex-1 gap-2 shadow-lg shadow-primary-900/20 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all text-white"
              onClick={handleSaveTransaction}
            >
              Simpan Transaksi
            </Button>
            <Button
              variant="outline"
              disabled={
                !selectedProductId || !quantity || parseInt(quantity) <= 0
              }
              className="flex-1 cursor-pointer text-primary-900"
              onClick={() => {
                setSelectedProductId("");
                setQuantity("");
              }}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="bg-primary-900 text-white border-none">
          <CardHeader>
            <CardTitle className="text-white text-lg">
              Ringkasan Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-primary-200 text-sm">Total Omset</p>
              <h3 className="text-3xl font-bold mt-1">
                {formatCurrency(
                  transactions.reduce((acc, curr) => acc + curr.totalPrice, 0)
                )}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <p className="text-primary-200 text-xs">Transaksi</p>
                <p className="text-xl font-bold mt-1">{transactions.length}</p>
              </div>
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <p className="text-primary-200 text-xs">Terlaris</p>
                <p className="text-lg font-bold mt-1 truncate">
                  {transactions.length > 0 ? transactions[0].productName : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Transaksi Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.slice(0, 3).map((trx, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-700">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-primary-900">
                      {trx.productName}
                    </p>
                    <p className="text-xs text-muted">{trx.quantity} Pcs</p>
                  </div>
                  <p className="text-sm font-bold text-primary-600">
                    {formatCurrency(trx.totalPrice)}
                  </p>
                </div>
              ))}
              {transactions.length === 0 && (
                <p className="text-sm text-muted text-center py-4">
                  Belum ada transaksi.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
