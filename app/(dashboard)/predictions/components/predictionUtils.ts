// Double Exponential Smoothing Implementation
// Sesuai flowchart: Grid search α & β (0.1–0.9), MAPE, dan pengecekan hasil negatif

/** Detail perhitungan per periode */
export interface DESStepDetail {
  date: string;
  actual: number;
  level: number | null;
  trend: number | null;
  forecast: number | null;
  error: number | null;
  absError: number | null;
  pctError: number | null;
}

/**
 * Hitung DES untuk satu kombinasi α dan β
 * Inisialisasi (Holt's Linear):
 *   L₁ = Y₁
 *   T₁ = Y₂ - Y₁
 *
 * Periode t ≥ 2:
 *   Ft   = L(t-1) + T(t-1)
 *   Lt   = α·Yt + (1-α)·Ft
 *   Tt   = β·(Lt - L(t-1)) + (1-β)·T(t-1)
 *
 * Forecast m langkah ke depan:
 *   F(t+m) = Lt + m·Tt
 */
function computeDES(
  data: number[],
  alpha: number,
  beta: number
): { forecasts: (number | null)[]; levels: (number | null)[]; trends: (number | null)[] } {
  const forecasts: (number | null)[] = [];
  const levels: (number | null)[] = [];
  const trends: (number | null)[] = [];

  if (data.length === 0) return { forecasts, levels, trends };

  // Period 1 — inisialisasi: L₁ = Y₁, T₁ = Y₂ - Y₁, forecast = null
  if (data.length === 1) {
    levels.push(data[0]);
    trends.push(0);
    forecasts.push(null);
    return { forecasts, levels, trends };
  }

  let level = data[0];               // L₁ = Y₁
  let trend = data[1] - data[0];     // T₁ = Y₂ - Y₁

  levels.push(level);
  trends.push(trend);
  forecasts.push(null); // Tidak ada forecast untuk periode 1

  // Period 2+ — hitung forecast, lalu update level & trend
  for (let i = 1; i < data.length; i++) {
    const prevLevel = level;
    const prevTrend = trend;

    // Forecast: Ft = L(t-1) + T(t-1)
    const forecast = prevLevel + prevTrend;
    forecasts.push(forecast);

    // Smoothed Level: Lt = α·Yt + (1-α)·Ft
    level = alpha * data[i] + (1 - alpha) * forecast;

    // Smoothed Trend: Tt = β·(Lt - L(t-1)) + (1-β)·T(t-1)
    trend = beta * (level - prevLevel) + (1 - beta) * prevTrend;

    levels.push(level);
    trends.push(trend);
  }

  return { forecasts, levels, trends };
}

interface ErrorMetrics {
  mape: number;
  mad: number;
  mse: number;
}

function calculateMetrics(actual: number[], forecast: (number | null)[]): ErrorMetrics {
  let sumAPE = 0;
  let sumAE = 0;
  let sumSE = 0;
  let mapeCount = 0;
  let errorCount = 0;

  for (let i = 0; i < actual.length; i++) {
    if (forecast[i] === null) continue;

    const error = actual[i] - forecast[i]!;
    const absError = Math.abs(error);

    sumAE += absError;
    sumSE += error * error;
    errorCount++;

    if (actual[i] !== 0) {
      sumAPE += (absError / actual[i]) * 100;
      mapeCount++;
    }
  }

  return {
    mape: mapeCount === 0 ? Infinity : sumAPE / mapeCount,
    mad: errorCount === 0 ? Infinity : sumAE / errorCount,
    mse: errorCount === 0 ? Infinity : sumSE / errorCount,
  };
}

/**
 * Grid Search: cari kombinasi α dan β terbaik (MAPE terendah)
 * α dari 0.05 sampai 0.95 (step 0.05)
 * β dari 0.05 sampai 0.95 (step 0.05)
 */
export interface DESResult {
  forecasts: (number | null)[];
  levels: (number | null)[];
  trends: (number | null)[];
  bestAlpha: number;
  bestBeta: number;
  mape: number | null;
  mad: number | null;
  mse: number | null;
  nextForecast: number;
  weeklyForecasts: number[];
}

export function doubleExponentialSmoothing(data: number[]): DESResult {
  const empty: DESResult = {
    forecasts: [],
    levels: [],
    trends: [],
    bestAlpha: 0.1,
    bestBeta: 0.1,
    mape: null,
    mad: null,
    mse: null,
    nextForecast: 0,
    weeklyForecasts: [],
  };

  if (data.length === 0) return empty;

  if (data.length === 1) {
    return {
      ...empty,
      forecasts: [null],
      levels: [data[0]],
      trends: [0],
      nextForecast: data[0],
      weeklyForecasts: Array(7).fill(data[0]),
    };
  }

  let bestAlpha = 0.1;
  let bestBeta = 0.1;
  let bestMAPE = Infinity;
  let bestForecasts: (number | null)[] = [];
  let bestLevels: (number | null)[] = [];
  let bestTrends: (number | null)[] = [];

  // Two-phase grid search untuk performa optimal:
  // Phase 1: scan kasar step 0.1 (81 kombinasi)
  for (let a = 1; a <= 9; a++) {
    const alpha = a / 10;
    for (let b = 1; b <= 9; b++) {
      const beta = b / 10;
      const { forecasts, levels, trends } = computeDES(data, alpha, beta);
      const { mape } = calculateMetrics(data, forecasts);
      if (mape < bestMAPE) {
        bestMAPE = mape;
        bestAlpha = alpha;
        bestBeta = beta;
        bestForecasts = forecasts;
        bestLevels = levels;
        bestTrends = trends;
      }
    }
  }

  // Phase 2: refine di sekitar best α/β dengan step 0.05 (±0.1 range)
  const aMin = Math.max(1, Math.round(bestAlpha * 20) - 2);
  const aMax = Math.min(19, Math.round(bestAlpha * 20) + 2);
  const bMin = Math.max(1, Math.round(bestBeta * 20) - 2);
  const bMax = Math.min(19, Math.round(bestBeta * 20) + 2);
  for (let a = aMin; a <= aMax; a++) {
    const alpha = a / 20;
    for (let b = bMin; b <= bMax; b++) {
      const beta = b / 20;
      const { forecasts, levels, trends } = computeDES(data, alpha, beta);
      const { mape } = calculateMetrics(data, forecasts);
      if (mape < bestMAPE) {
        bestMAPE = mape;
        bestAlpha = alpha;
        bestBeta = beta;
        bestForecasts = forecasts;
        bestLevels = levels;
        bestTrends = trends;
      }
    }
  }

  // Hitung metrik final dengan parameter terbaik
  const finalMetrics = calculateMetrics(data, bestForecasts);

  // Hitung forecast untuk periode berikutnya menggunakan nilai Level & Trend terakhir
  // F(t+m) = Lt + m·Tt  (Holt's m-step ahead forecast)
  const lastLevel = bestLevels[bestLevels.length - 1];
  const lastTrend = bestTrends[bestTrends.length - 1];

  const weeklyForecasts: number[] = [];
  let nextForecast = 0;

  if (lastLevel !== null && lastTrend !== null) {
    for (let m = 1; m <= 7; m++) {
      const fwd = Math.max(0, Math.round(lastLevel + m * lastTrend));
      weeklyForecasts.push(fwd);
    }
    nextForecast = weeklyForecasts[0];
  }

  const round2 = (v: number) => Math.round(v * 100) / 100;

  return {
    forecasts: bestForecasts,
    levels: bestLevels,
    trends: bestTrends,
    bestAlpha,
    bestBeta,
    mape: isFinite(finalMetrics.mape) ? round2(finalMetrics.mape) : null,
    mad: isFinite(finalMetrics.mad) ? round2(finalMetrics.mad) : null,
    mse: isFinite(finalMetrics.mse) ? round2(finalMetrics.mse) : null,
    nextForecast,
    weeklyForecasts,
  };
}

export interface PredictionResult {
  productId: string;
  productName: string;
  rank: number;
  totalSales: number;
  tomorrowPrediction: number;
  weeklyPrediction: number;
  weeklyForecasts: number[];
  recommendedProduction: number;
  bestAlpha: number;
  bestBeta: number;
  mape: number | null;
  mad: number | null;
  mse: number | null;
  historicalData: Array<{ date: string; sales: number }>;
  predictionData: Array<{ date: string; sales: number; predicted?: boolean }>;
  calculationDetails: DESStepDetail[];
}
