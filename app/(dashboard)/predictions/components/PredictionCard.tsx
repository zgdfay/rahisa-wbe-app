import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PredictionMetrics } from "./PredictionMetrics";
import { PredictionChart } from "./PredictionChart";
import { PredictionResult } from "./predictionUtils";

interface PredictionCardProps {
  prediction: PredictionResult;
}

export function PredictionCard({ prediction }: PredictionCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary-50 border-b border-primary-100">
        <CardTitle className="text-lg">{prediction.productName}</CardTitle>
        <CardDescription>
          Prediksi berdasarkan {prediction.historicalData.length} hari terakhir
        </CardDescription>
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
      </CardContent>
    </Card>
  );
}
