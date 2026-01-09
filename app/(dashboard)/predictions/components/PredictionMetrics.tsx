import { Calendar, TrendingUp, Package } from "lucide-react";

interface PredictionMetricsProps {
  tomorrowPrediction: number;
  weeklyPrediction: number;
  recommendedProduction: number;
}

export function PredictionMetrics({
  tomorrowPrediction,
  weeklyPrediction,
  recommendedProduction,
}: PredictionMetricsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
        <Calendar className="w-5 h-5 text-blue-600 mx-auto mb-2" />
        <p className="text-[11px] text-blue-700 font-semibold">
          Prediksi Besok
        </p>
        <p className="text-xl font-bold text-blue-900 mt-1">
          {tomorrowPrediction}
        </p>
        <p className="text-[10px] text-blue-600 mt-0.5">pcs terjual</p>
      </div>

      <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-100">
        <TrendingUp className="w-5 h-5 text-purple-600 mx-auto mb-2" />
        <p className="text-[11px] text-purple-700 font-semibold">
          Proyeksi 7 Hari
        </p>
        <p className="text-xl font-bold text-purple-900 mt-1">
          {weeklyPrediction}
        </p>
        <p className="text-[10px] text-purple-600 mt-0.5">pcs total</p>
      </div>

      <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
        <Package className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
        <p className="text-[11px] text-emerald-700 font-semibold">
          Produksi Hari Ini
        </p>
        <p className="text-xl font-bold text-emerald-900 mt-1">
          {recommendedProduction}
        </p>
        <p className="text-[10px] text-emerald-600 mt-0.5">pcs (untuk besok)</p>
      </div>
    </div>
  );
}
