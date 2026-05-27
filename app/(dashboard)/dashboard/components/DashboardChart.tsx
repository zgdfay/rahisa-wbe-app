"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface Transaction {
  id: string;
  date: string;
  totalPrice: number;
  status: string;
}

interface DashboardChartProps {
  transactions: Transaction[];
}

export function DashboardChart({ transactions }: DashboardChartProps) {
  const [activeFilter, setActiveFilter] = React.useState<"range" | "month">(
    "range"
  );
  const [selectedRange, setSelectedRange] = React.useState("7d");
  const [selectedMonth, setSelectedMonth] = React.useState<string>("");

  // Generate available month options from transactions
  const monthOptions = React.useMemo(() => {
    const months = new Set<string>();
    transactions.forEach((trx) => {
      if (trx.date && trx.date.length >= 7) {
        months.add(trx.date.substring(0, 7));
      }
    });
    return Array.from(months).sort().reverse();
  }, [transactions]);

  // Set default selected month if available and none selected
  React.useEffect(() => {
    if (monthOptions.length > 0 && !selectedMonth) {
      setSelectedMonth(monthOptions[0]);
    }
  }, [monthOptions, selectedMonth]);

  const chartData = React.useMemo(() => {
    const daysMap: Record<string, number> = {};
    const result = [];

    transactions.forEach((trx) => {
      if (trx.status === "completed") {
        daysMap[trx.date] = (daysMap[trx.date] || 0) + trx.totalPrice;
      }
    });

    if (activeFilter === "range") {
      const today = new Date();
      let daysToSubtract = 7;
      if (selectedRange === "14d") daysToSubtract = 14;
      if (selectedRange === "30d") daysToSubtract = 30;

      for (let i = daysToSubtract - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateString = d.toLocaleDateString("en-CA");
        result.push({
          date: dateString,
          revenue: daysMap[dateString] || 0,
        });
      }
    } else if (activeFilter === "month" && selectedMonth) {
      const [year, month] = selectedMonth.split("-").map(Number);
      const daysCount = new Date(year, month, 0).getDate();

      for (let d = 1; d <= daysCount; d++) {
        const dayStr = d < 10 ? `0${d}` : `${d}`;
        const dateString = `${selectedMonth}-${dayStr}`;
        result.push({
          date: dateString,
          revenue: daysMap[dateString] || 0,
        });
      }
    }

    return result;
  }, [transactions, activeFilter, selectedRange, selectedMonth]);

  const chartConfig = {
    revenue: {
      label: "Pendapatan",
      color: "var(--primary-500)",
    },
  } satisfies ChartConfig;

  const formatMonth = (yyyy_mm: string) => {
    const date = new Date(`${yyyy_mm}-01`);
    return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  };

  return (
    <div className="lg:col-span-2 p-8 bg-white/70 backdrop-blur-md rounded-[2.5rem] border border-white/60 shadow-xl shadow-primary-900/5 h-[500px] flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h2 className="text-xl font-bold text-primary-900">Grafik Penjualan</h2>

        <div className="flex flex-wrap items-center gap-2">
          {/* Range Select */}
          <Select
            value={activeFilter === "range" ? selectedRange : undefined}
            onValueChange={(val) => {
              setActiveFilter("range");
              setSelectedRange(val);
            }}
          >
            <SelectTrigger
              className={`w-[140px] rounded-xl border-none bg-white/50 shadow-sm focus:ring-0 focus:ring-offset-0 ${
                activeFilter === "range"
                  ? "text-primary-900 font-medium"
                  : "text-muted-foreground"
              }`}
            >
              <SelectValue placeholder="Hari Terakhir">
                {activeFilter === "range"
                  ? selectedRange === "7d"
                    ? "7 Hari Terakhir"
                    : selectedRange === "14d"
                    ? "14 Hari Terakhir"
                    : "30 Hari Terakhir"
                  : "Pilih Rentang"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-none shadow-xl">
              <SelectItem value="7d" className="cursor-pointer rounded-lg">
                7 Hari Terakhir
              </SelectItem>
              <SelectItem value="14d" className="cursor-pointer rounded-lg">
                14 Hari Terakhir
              </SelectItem>
              <SelectItem value="30d" className="cursor-pointer rounded-lg">
                30 Hari Terakhir
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Month Select */}
          {monthOptions.length > 0 && (
            <Select
              value={activeFilter === "month" ? selectedMonth : undefined}
              onValueChange={(val) => {
                setActiveFilter("month");
                setSelectedMonth(val);
              }}
            >
              <SelectTrigger
                className={`w-[160px] rounded-xl border-none bg-white/50 shadow-sm focus:ring-0 focus:ring-offset-0 ${
                  activeFilter === "month"
                    ? "text-primary-900 font-medium"
                    : "text-muted-foreground"
                }`}
              >
                <SelectValue placeholder="Pilih Bulan">
                  {activeFilter === "month" && selectedMonth
                    ? formatMonth(selectedMonth)
                    : "Pilih Bulan"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="rounded-xl max-h-[200px] border-none shadow-xl">
                {monthOptions.map((month) => (
                  <SelectItem
                    key={month}
                    value={month}
                    className="cursor-pointer rounded-lg"
                  >
                    {formatMonth(month)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-full w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient
                id="fillRevenueDashboard"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("id-ID", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("id-ID", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="revenue"
              type="monotone"
              fill="url(#fillRevenueDashboard)"
              stroke="var(--color-revenue)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </div>
  );
}
