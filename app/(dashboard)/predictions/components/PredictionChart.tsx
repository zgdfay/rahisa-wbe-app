import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface PredictionChartProps {
  productId: string;
  predictionData: Array<{ date: string; sales: number; predicted?: boolean }>;
}

export function PredictionChart({
  productId,
  predictionData,
}: PredictionChartProps) {
  const chartConfig = {
    sales: {
      label: "Penjualan",
      color: "var(--primary-500)",
    },
  } satisfies ChartConfig;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", { month: "short", day: "numeric" });
  };

  return (
    <div>
      <h4 className="text-sm font-semibold text-primary-900 mb-3">
        Tren & Prediksi
      </h4>
      <ChartContainer config={chartConfig} className="h-[200px] w-full">
        <AreaChart data={predictionData}>
          <defs>
            <linearGradient
              id={`fill-${productId}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor="var(--color-sales)"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="var(--color-sales)"
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={formatDate}
          />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                labelFormatter={formatDate}
                formatter={(value, name, item) => {
                  const isPredicted = item.payload.predicted;
                  return [
                    `${value} pcs${isPredicted ? " (prediksi)" : ""}`,
                    "Penjualan",
                  ];
                }}
              />
            }
          />
          <Area
            dataKey="sales"
            type="monotone"
            fill={`url(#fill-${productId})`}
            stroke="var(--color-sales)"
            strokeWidth={2}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
