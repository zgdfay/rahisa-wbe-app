import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import dynamic from "next/dynamic";
import { PredictionMetrics } from "./PredictionMetrics";
import { PredictionResult } from "./predictionUtils";
import { Button } from "@/components/ui/button";

const PredictionChart = dynamic(() => import("./PredictionChart").then((mod) => mod.PredictionChart), {
  ssr: false,
  loading: () => (
    <div className="h-[200px] rounded-xl bg-primary-50/70 animate-pulse flex items-center justify-center text-xs text-muted">
      Memuat grafik...
    </div>
  ),
});

interface PredictionCardProps {
  prediction: PredictionResult;
}

export function PredictionCard({ prediction }: PredictionCardProps) {
  const getMapeLabel = (mape: number | null) => {
    if (mape === null)
      return { label: "Belum Cukup Data", color: "bg-gray-100 text-gray-700" };
    if (mape <= 10)
      return {
        label: "Sangat Akurat",
        color: "bg-emerald-100 text-emerald-700",
      };
    if (mape <= 20)
      return { label: "Akurat", color: "bg-blue-100 text-blue-700" };
    if (mape <= 50)
      return { label: "Cukup Akurat", color: "bg-amber-100 text-amber-700" };
    return { label: "Kurang Akurat", color: "bg-red-100 text-red-700" };
  };

  const mapeInfo = getMapeLabel(prediction.mape);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary-50 border-b border-primary-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary-600 text-white text-xs font-bold shrink-0">
              {prediction.rank}
            </span>
            <CardTitle className="text-lg">{prediction.productName}</CardTitle>
          </div>
          <Badge
            variant="outline"
            className={`${mapeInfo.color} border-0 text-[11px] font-semibold`}
          >
            {mapeInfo.label}
          </Badge>
        </div>
        <CardDescription>
          Total terjual: <span className="font-semibold text-gray-900">{prediction.totalSales} pcs</span> — Data {prediction.historicalData.length} hari
        </CardDescription>
        <div className="flex gap-3 mt-1">
          <span className="text-[11px] text-muted font-mono">
            α = {prediction.bestAlpha}
          </span>
          <span className="text-[11px] text-muted font-mono">
            β = {prediction.bestBeta}
          </span>
          <span className="text-[11px] text-muted font-mono">
            MAPE = {prediction.mape !== null ? `${prediction.mape}%` : "N/A"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <PredictionMetrics
          tomorrowPrediction={prediction.tomorrowPrediction}
          weeklyPrediction={prediction.weeklyPrediction}
          recommendedProduction={prediction.recommendedProduction}
        />
        <PredictionChart
          productId={prediction.productId}
          predictionData={prediction.predictionData}
        />
        <div className="pt-2">
          <Link href={`/predictions/${prediction.productId}`}>
            <Button
              variant="outline"
              className="w-full bg-white hover:bg-primary-50 text-primary-700 border-primary-200"
            >
              Lihat Tabel Perhitungan Detail
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
