// Double Exponential Smoothing Implementation
export function doubleExponentialSmoothing(
  data: number[], 
  alpha: number = 0.3, 
  beta: number = 0.3
): number[] {
  if (data.length === 0) return [];
  
  const result: number[] = [];
  let level = data[0];
  let trend = data.length > 1 ? data[1] - data[0] : 0;
  
  result.push(level);
  
  for (let i = 1; i < data.length; i++) {
    const prevLevel = level;
    level = alpha * data[i] + (1 - alpha) * (prevLevel + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
    result.push(level + trend);
  }
  
  return result;
}

export interface PredictionResult {
  productId: string;
  productName: string;
  tomorrowPrediction: number;
  weeklyPrediction: number;
  recommendedProduction: number;
  historicalData: Array<{ date: string; sales: number }>;
  predictionData: Array<{ date: string; sales: number; predicted?: boolean }>;
}
