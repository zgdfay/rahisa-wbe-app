// Double Exponential Smoothing Implementation
// Sesuai flowchart: Grid search α & β (0.1–0.9), MAPE, dan pengecekan hasil negatif

/** Detail perhitungan per periode */
export interface DESStepDetail {
  date: string;
  actual: number;
  level: number | null;
  trend: number | null;
  forecast: number | null;
}

/**
 * Hitung DES untuk satu kombinasi α dan β
 * Lt = α·Yt + (1-α)·(L(t-1) + T(t-1))
 * Tt = β·(Lt - L(t-1)) + (1-β)·T(t-1)
 * Ft = Lt + Tt
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

  // Period 1 (Bulan 1) -> Kosong
  levels.push(null);
  trends.push(null);
  forecasts.push(null);

  if (data.length === 1) return { forecasts, levels, trends };

  // Period 2 (Bulan 2) -> Inisialisasi
  let level = data[1];
  let trend = data[1] - data[0];
  
  levels.push(level);
  trends.push(trend);
  forecasts.push(null);

  // Period 3+ seterusnya
  for (let i = 2; i < data.length; i++) {
    const prevLevel = level;
    const prevTrend = trend;
    
    // Forecast Ft = Lt-1 + Tt-1
    const forecast = prevLevel + prevTrend;
    forecasts.push(forecast);

    // Smoothed Level Lt = a*Yt + (1-a)*(Lt-1 + Tt-1)
    level = alpha * data[i] + (1 - alpha) * forecast;
    
    // Smoothed Trend Tt = b*(Lt - Lt-1) + (1-b)*Tt-1
    trend = beta * (level - prevLevel) + (1 - beta) * prevTrend;
    
    levels.push(level);
    trends.push(trend);
  }

  return { forecasts, levels, trends };
}

/**
 * Hitung MAPE (Mean Absolute Percentage Error)
 * MAPE = (Σ |Yt - Ft| / Yt × 100%) / n
 */
function calculateMAPE(actual: number[], forecast: (number | null)[]): number {
  let sumAPE = 0;
  let count = 0;

  for (let i = 0; i < actual.length; i++) {
    if (forecast[i] !== null && actual[i] !== 0) {
      sumAPE += Math.abs((actual[i] - forecast[i]!) / actual[i]) * 100;
      count++;
    }
  }

  if (count === 0) return Infinity;
  return sumAPE / count;
}

/**
 * Grid Search: cari kombinasi α dan β terbaik (MAPE terendah)
 * α dari 0.1 sampai 0.9 (step 0.1)
 * β dari 0.1 sampai 0.9 (step 0.1)
 */
export interface DESResult {
  forecasts: (number | null)[];
  levels: (number | null)[];
  trends: (number | null)[];
  bestAlpha: number;
  bestBeta: number;
  mape: number;
  nextForecast: number;
}

export function doubleExponentialSmoothing(data: number[]): DESResult {
  if (data.length === 0) {
    return { forecasts: [], levels: [], trends: [], bestAlpha: 0.1, bestBeta: 0.1, mape: 0, nextForecast: 0 };
  }

  if (data.length === 1) {
    return { forecasts: [null], levels: [null], trends: [null], bestAlpha: 0.1, bestBeta: 0.1, mape: 0, nextForecast: 0 };
  }

  let bestAlpha = 0.1;
  let bestBeta = 0.1;
  let bestMAPE = Infinity;
  let bestForecasts: (number | null)[] = [];
  let bestLevels: (number | null)[] = [];
  let bestTrends: (number | null)[] = [];

  // Grid search α = 0.1 to 0.9, β = 0.1 to 0.9
  for (let a = 1; a <= 9; a++) {
    const alpha = a / 10;
    for (let b = 1; b <= 9; b++) {
      const beta = b / 10;

      // Hitung DES
      const { forecasts, levels, trends } = computeDES(data, alpha, beta);

      // Hitung MAPE (Hanya menghitung yang ada forecastnya)
      const mape = calculateMAPE(data, forecasts);

      // Simpan jika MAPE lebih rendah
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

  // Hitung forecast untuk periode berikutnya (besok)
  // Berdasarkan nilai Level dan Trend terakhir
  const lastLevel = bestLevels[bestLevels.length - 1];
  const lastTrend = bestTrends[bestTrends.length - 1];
  
  let nextForecast = 0;
  if (lastLevel !== null && lastTrend !== null) {
    nextForecast = Math.round(lastLevel + lastTrend);
  }

  // Jika hasil peramalan < 0, set ke 0
  if (nextForecast < 0) {
    nextForecast = 0;
  }

  return {
    forecasts: bestForecasts,
    levels: bestLevels,
    trends: bestTrends,
    bestAlpha,
    bestBeta,
    mape: bestMAPE === Infinity ? 0 : Math.round(bestMAPE * 100) / 100,
    nextForecast,
  };
}

export interface PredictionResult {
  productId: string;
  productName: string;
  tomorrowPrediction: number;
  weeklyPrediction: number;
  recommendedProduction: number;
  bestAlpha: number;
  bestBeta: number;
  mape: number;
  historicalData: Array<{ date: string; sales: number }>;
  predictionData: Array<{ date: string; sales: number; predicted?: boolean }>;
  /** Detail perhitungan step-by-step */
  calculationDetails: DESStepDetail[];
}
