"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Transaction, PRODUCTS } from "../sales/components/types";
import { PredictionCard } from "./components/PredictionCard";
import {
  doubleExponentialSmoothing,
  PredictionResult,
} from "./components/predictionUtils";

export default function PredictionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("sales_transactions");
    if (saved) {
      try {
        const loadedTransactions: Transaction[] = JSON.parse(saved);
        setTransactions(loadedTransactions);

        // Calculate predictions for each product
        const productPredictions = PRODUCTS.map((product) => {
          // Group sales by date for this product
          const salesByDate: { [date: string]: number } = {};

          loadedTransactions
            .filter(
              (t) => t.productId === product.id && t.status === "completed"
            )
            .forEach((t) => {
              salesByDate[t.date] = (salesByDate[t.date] || 0) + t.quantity;
            });

          // Get last 14 days of data
          const dates = Object.keys(salesByDate).sort();
          const last14Days = dates.slice(-14);
          const salesData = last14Days.map((date) => salesByDate[date]);

          // Apply Double Exponential Smoothing
          const smoothed = doubleExponentialSmoothing(salesData);

          // Predict tomorrow (next value)
          const tomorrowPrediction =
            smoothed.length > 0 ? Math.round(smoothed[smoothed.length - 1]) : 0;

          // Predict weekly average (7 days forward)
          const weeklyPrediction = Math.round(tomorrowPrediction * 7);

          // Recommended production = prediction + 20% buffer
          const recommendedProduction = Math.round(tomorrowPrediction * 1.2);

          // Prepare historical data for chart
          const historicalData = last14Days.map((date) => ({
            date,
            sales: salesByDate[date],
          }));

          // Prepare prediction data (historical + tomorrow)
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowStr = tomorrow.toLocaleDateString("en-CA");

          const predictionData = [
            ...historicalData,
            { date: tomorrowStr, sales: tomorrowPrediction, predicted: true },
          ];

          return {
            productId: product.id,
            productName: product.name,
            tomorrowPrediction,
            weeklyPrediction,
            recommendedProduction,
            historicalData,
            predictionData,
          };
        });

        setPredictions(productPredictions);
      } catch (e) {
        console.error("Failed to parse transactions", e);
      }
    }
  }, []);

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary-900">
          Prediksi Penjualan
        </h1>
        <p className="text-muted mt-1">
          Hasil perhitungan sistem menggunakan Double Exponential Smoothing
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

      {/* Predictions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {predictions.map((prediction) => (
          <PredictionCard key={prediction.productId} prediction={prediction} />
        ))}
      </div>

      {predictions.length === 0 && (
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
    </div>
  );
}
