"use client";

import { useEffect, useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Trophy, LayoutGrid } from "lucide-react";
import { Transaction } from "../sales/components/types";
import { PredictionCard } from "./components/PredictionCard";
import {
  doubleExponentialSmoothing,
  PredictionResult,
} from "./components/predictionUtils";

function buildPrediction(
  productId: string,
  productName: string,
  rank: number,
  total: number,
  salesByDate: Record<string, number>,
): PredictionResult | null {
  const datesList = Object.keys(salesByDate).sort();
  if (datesList.length === 0) return null;

  const firstDate = new Date(datesList[0]);
  const lastDate = new Date(datesList[datesList.length - 1]);

  const continuousDates: string[] = [];
  for (
    let d = new Date(firstDate);
    d <= lastDate;
    d.setDate(d.getDate() + 1)
  ) {
    continuousDates.push(d.toLocaleDateString("en-CA"));
  }

  const salesData = continuousDates.map((date) => salesByDate[date] || 0);
  const desResult = doubleExponentialSmoothing(salesData);

  const tomorrowPrediction = desResult.nextForecast;
  const weeklyPrediction = desResult.weeklyForecasts.reduce((a, b) => a + b, 0);

  const historicalData = continuousDates.map((date, i) => ({
    date,
    sales: salesData[i],
  }));

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toLocaleDateString("en-CA");

  const chartHistory = historicalData.slice(-60);
  const predictionData = [
    ...chartHistory,
    { date: tomorrowStr, sales: tomorrowPrediction, predicted: true },
  ];

  const calculationDetails = continuousDates.map((date, index) => {
    const actual = salesData[index];
    const forecast = desResult.forecasts[index];
    const error = forecast !== null ? actual - forecast : null;
    const absError = error !== null ? Math.abs(error) : null;
    const pctError =
      error !== null && actual !== 0
        ? (Math.abs(error) / actual) * 100
        : null;
    return {
      date,
      actual,
      level: desResult.levels[index],
      trend: desResult.trends[index],
      forecast,
      error,
      absError,
      pctError,
    };
  });

  return {
    productId,
    productName,
    rank,
    totalSales: total,
    tomorrowPrediction,
    weeklyPrediction,
    weeklyForecasts: desResult.weeklyForecasts,
    recommendedProduction: Math.round(tomorrowPrediction * 1.2),
    bestAlpha: desResult.bestAlpha,
    bestBeta: desResult.bestBeta,
    mape: desResult.mape,
    mad: desResult.mad,
    mse: desResult.mse,
    historicalData,
    predictionData,
    calculationDetails,
  };
}

export default function PredictionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allPredictions, setAllPredictions] = useState<PredictionResult[]>([]);
  const [isCalculating, startTransition] = useTransition();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/sales");
        if (!res.ok) return;
        const loadedTransactions: Transaction[] = await res.json();
        setTransactions(loadedTransactions);

        startTransition(() => {
          const salesBuckets = new Map<string, Record<string, number>>();
          const productNames = new Map<string, string>();
          const totalSales = new Map<string, number>();

          for (const trx of loadedTransactions) {
            if (trx.status !== "completed") continue;
            const bucket = salesBuckets.get(trx.productId) ?? {};
            bucket[trx.date] = (bucket[trx.date] || 0) + trx.quantity;
            salesBuckets.set(trx.productId, bucket);
            if (!productNames.has(trx.productId)) {
              productNames.set(trx.productId, trx.productName);
            }
            totalSales.set(
              trx.productId,
              (totalSales.get(trx.productId) || 0) + trx.quantity,
            );
          }

          // Sort all products by total sales descending
          const sortedIds = [...totalSales.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([id]) => id);

          const results: PredictionResult[] = [];
          for (let i = 0; i < sortedIds.length; i++) {
            const pid = sortedIds[i];
            const pred = buildPrediction(
              pid,
              productNames.get(pid) || pid,
              i + 1,
              totalSales.get(pid) || 0,
              salesBuckets.get(pid)!,
            );
            if (pred) results.push(pred);
          }

          setAllPredictions(results);
        });
      } catch (e) {
        console.error("Failed to load transactions for predictions", e);
      }
    };

    load();
  }, []);

  const top10 = allPredictions.slice(0, 10);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-primary-900">
          Prediksi Penjualan
        </h1>
        <p className="text-muted mt-1">
          Hasil perhitungan Double Exponential Smoothing
        </p>
      </div>

      {transactions.length < 7 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-900">
                  Data transaksi masih terbatas
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Prediksi akan lebih akurat setelah memiliki lebih banyak data
                  historis (minimal 7 hari).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isCalculating && (
        <Card>
          <CardContent className="p-8 text-center text-muted">
            Menghitung prediksi...
          </CardContent>
        </Card>
      )}

      {!isCalculating && allPredictions.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted">
              Belum ada data transaksi untuk membuat prediksi.
              <br />
              Silakan input transaksi di halaman Penjualan terlebih dahulu.
            </p>
          </CardContent>
        </Card>
      )}

      {allPredictions.length > 0 && (
        <Tabs defaultValue="top10">
          <TabsList>
            <TabsTrigger value="top10" className="gap-1.5">
              <Trophy className="w-3.5 h-3.5" />
              10 Terlaris
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-1.5">
              <LayoutGrid className="w-3.5 h-3.5" />
              Semua Produk ({allPredictions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="top10" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {top10.map((prediction) => (
                <PredictionCard
                  key={prediction.productId}
                  prediction={prediction}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {allPredictions.map((prediction) => (
                <PredictionCard
                  key={prediction.productId}
                  prediction={prediction}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
