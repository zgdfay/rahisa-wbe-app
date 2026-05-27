"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PredictionTable } from "../components/PredictionTable";
import {
  doubleExponentialSmoothing,
  DESStepDetail,
} from "../components/predictionUtils";
import { Transaction } from "../../sales/components/types";

export default function PredictionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;

  const [productName, setProductName] = useState<string>("");
  const [details, setDetails] = useState<DESStepDetail[]>([]);
  const [mape, setMape] = useState<number | null>(null);
  const [mad, setMad] = useState<number | null>(null);
  const [mse, setMse] = useState<number | null>(null);
  const [bestAlpha, setBestAlpha] = useState<number>(0);
  const [bestBeta, setBestBeta] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/sales");
        if (!res.ok) {
          setIsLoading(false);
          return;
        }
        const loadedTransactions: Transaction[] = await res.json();

        // Find product name from transaction data
        const matchingTrx = loadedTransactions.find((t) => t.productId === productId);
        if (!matchingTrx) {
          router.push("/predictions");
          return;
        }
        setProductName(matchingTrx.productName);

        // Group sales by date for this product
        const salesByDate: { [date: string]: number } = {};
        loadedTransactions
          .filter((t) => t.productId === productId && t.status === "completed")
          .forEach((t) => {
            salesByDate[t.date] = (salesByDate[t.date] || 0) + t.quantity;
          });

      const datesList = Object.keys(salesByDate).sort();
      if (datesList.length === 0) {
        setIsLoading(false);
        return;
      }

      const firstDate = new Date(datesList[0]);
      const lastDate = new Date(datesList[datesList.length - 1]);

      const continuousDates: string[] = [];
      for (
        let d = new Date(firstDate);
        d <= lastDate;
        d.setDate(d.getDate() + 1)
      ) {
        const dateStr = d.toLocaleDateString("en-CA");
        continuousDates.push(dateStr);
      }

      const salesData = continuousDates.map((date) => salesByDate[date] || 0);

      // Calculate DES
      const desResult = doubleExponentialSmoothing(salesData);

      // Map to table details
      const calculationDetails: DESStepDetail[] = continuousDates.map(
        (date, index) => {
          const actual = salesData[index];
          const forecast = desResult.forecasts[index];
          const error = forecast !== null ? actual - forecast : null;
          const absError = error !== null ? Math.abs(error) : null;
          const pctError = error !== null && actual !== 0
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
        },
      );

      setDetails(calculationDetails);
      setMape(desResult.mape);
      setMad(desResult.mad);
      setMse(desResult.mse);
      setBestAlpha(desResult.bestAlpha);
      setBestBeta(desResult.bestBeta);
      } catch (e) {
        console.error("Failed to parse transactions", e);
      }

      setIsLoading(false);
    };

    load();
  }, [productId, router]);

  const handleExportCSV = () => {
    if (details.length === 0) return;

    // Header parameters
    const mapeStr = mape !== null ? `${mape}%` : "N/A";
    const madStr = mad !== null ? `${mad}` : "N/A";
    const mseStr = mse !== null ? `${mse}` : "N/A";
    const paramsRow = `Parameter Alpha (α): ${bestAlpha}, Parameter Beta (β): ${bestBeta}, MAPE: ${mapeStr}, MAD: ${madStr}, MSE: ${mseStr}\n\n`;

    // Header columns
    const headers = ["Tanggal", "Aktual", "Level", "Trend", "Forecast", "Error", "|Error|", "% Error"];

    // Data rows
    const rows = details.map((d) => [
      d.date,
      d.actual,
      d.level !== null ? d.level.toFixed(2) : "-",
      d.trend !== null ? d.trend.toFixed(2) : "-",
      d.forecast !== null ? d.forecast.toFixed(2) : "-",
      d.error !== null ? d.error.toFixed(2) : "-",
      d.absError !== null ? d.absError.toFixed(2) : "-",
      d.pctError !== null ? d.pctError.toFixed(2) + "%" : "-",
    ]);

    // Construct CSV
    const csvContent =
      "data:text/csv;charset=utf-8," +
      paramsRow +
      headers.join(",") +
      "\n" +
      rows.map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Prediksi_DES_${productName.replace(/\s+/g, "_")}_${new Date().toLocaleDateString("id-ID").replace(/\//g, "-")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Determine MAPE badge color
  let mapeInfo = {
    label: "N/A",
    color: "bg-gray-100 text-gray-700",
  };
  if (mape !== null) {
    if (mape <= 10) {
      mapeInfo = { label: "Sangat Akurat", color: "bg-green-100 text-green-700" };
    } else if (mape <= 20) {
      mapeInfo = { label: "Baik", color: "bg-blue-100 text-blue-700" };
    } else if (mape <= 50) {
      mapeInfo = { label: "Cukup", color: "bg-yellow-100 text-yellow-700" };
    } else {
      mapeInfo = { label: "Kurang Akurat", color: "bg-red-100 text-red-700" };
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0"
            onClick={() => router.push("/predictions")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Detail Perhitungan
            </h1>
            <p className="text-muted text-sm mt-0.5">
              Tabel Double Exponential Smoothing
            </p>
          </div>
        </div>

        {details.length > 0 && (
          <Button
            onClick={handleExportCSV}
            className="bg-primary-600 hover:bg-primary-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="bg-primary-50/30 border-b border-primary-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl text-primary-900">
                {productName}
              </CardTitle>
              <CardDescription className="mt-1">
                Data ditarik dari transaksi pertama hingga hari ini
              </CardDescription>
            </div>
            {details.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={`${mapeInfo.color} border-0 text-xs py-1 px-3`}
                >
                  {mapeInfo.label}
                </Badge>
                <div className="text-xs font-mono bg-white px-3 py-1.5 rounded-lg border border-primary-100 text-gray-600 shadow-sm">
                  MAPE: <span className="font-bold text-gray-900">{mape !== null ? `${mape}%` : "N/A"}</span>
                </div>
                <div className="text-xs font-mono bg-white px-3 py-1.5 rounded-lg border border-primary-100 text-gray-600 shadow-sm">
                  MAD: <span className="font-bold text-gray-900">{mad !== null ? mad : "N/A"}</span>
                </div>
                <div className="text-xs font-mono bg-white px-3 py-1.5 rounded-lg border border-primary-100 text-gray-600 shadow-sm">
                  MSE: <span className="font-bold text-gray-900">{mse !== null ? mse : "N/A"}</span>
                </div>
                <div className="text-xs font-mono bg-white px-3 py-1.5 rounded-lg border border-primary-100 text-gray-600 shadow-sm">
                  α:{" "}
                  <span className="font-bold text-gray-900">
                    {bestAlpha}
                  </span>
                  {" | "}
                  β:{" "}
                  <span className="font-bold text-gray-900">
                    {bestBeta}
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-6">
          {details.length > 0 ? (
            <PredictionTable details={details} />
          ) : (
            <div className="p-10 text-center text-gray-500">
              Belum ada data transaksi yang valid untuk dihitung.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
