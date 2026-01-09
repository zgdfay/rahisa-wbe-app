export interface Ingredient {
  id: string;
  name: string;
  unit: string; // kg, pcs, liter, etc
  currentStock: number;
  minStock: number; // safety stock threshold
  maxStock: number;
}

export const INGREDIENTS: Ingredient[] = [
  {
    id: "tepung",
    name: "Tepung Terigu",
    unit: "kg",
    currentStock: 50,
    minStock: 20,
    maxStock: 100,
  },
  {
    id: "telur",
    name: "Telur",
    unit: "butir",
    currentStock: 120,
    minStock: 50,
    maxStock: 200,
  },
  {
    id: "gula",
    name: "Gula Pasir",
    unit: "kg",
    currentStock: 25,
    minStock: 15,
    maxStock: 50,
  },
  {
    id: "butter",
    name: "Butter/Margarin",
    unit: "kg",
    currentStock: 8,
    minStock: 10,
    maxStock: 30,
  },
  {
    id: "ragi",
    name: "Ragi Instan",
    unit: "gram",
    currentStock: 300,
    minStock: 200,
    maxStock: 1000,
  },
  {
    id: "susu",
    name: "Susu Cair",
    unit: "liter",
    currentStock: 15,
    minStock: 10,
    maxStock: 30,
  },
];

export type StockStatus = "safe" | "warning" | "critical";

export function getStockStatus(current: number, min: number): StockStatus {
  const percentage = (current / min) * 100;
  
  if (percentage >= 100) return "safe";
  if (percentage >= 50) return "warning";
  return "critical";
}

export function getStatusColor(status: StockStatus): {
  bg: string;
  border: string;
  text: string;
  badge: string;
} {
  switch (status) {
    case "safe":
      return {
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        text: "text-emerald-900",
        badge: "bg-emerald-100 text-emerald-700 border-emerald-300",
      };
    case "warning":
      return {
        bg: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-900",
        badge: "bg-amber-100 text-amber-700 border-amber-300",
      };
    case "critical":
      return {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-900",
        badge: "bg-red-100 text-red-700 border-red-300",
      };
  }
}

export function getStatusLabel(status: StockStatus): string {
  switch (status) {
    case "safe":
      return "Aman";
    case "warning":
      return "Perlu Diisi";
    case "critical":
      return "Kritis";
  }
}
