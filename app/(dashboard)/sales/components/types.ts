export interface Transaction {
  id: string;
  date: string;
  time: string;
  productId: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  status: "completed" | "pending" | "cancelled";
}

export const PRODUCTS = [
  { id: "roti-tawar", name: "Roti Tawar Spesial", price: 15000 },
  { id: "croissant", name: "Butter Croissant", price: 12000 },
  { id: "bolu-pandan", name: "Bolu Pandan", price: 35000 },
  { id: "donat", name: "Donat Kentang", price: 5000 },
  { id: "sourdough", name: "Sourdough Bread", price: 25000 },
];
