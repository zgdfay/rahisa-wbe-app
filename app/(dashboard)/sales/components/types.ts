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
  { id: "donat", name: "Donat", price: 5000 },
  { id: "donat-box-1-2-dz", name: "Donat Box 1/2 Dz", price: 25000 },
  { id: "bomboloni-nutella", name: "Bomboloni Nutella", price: 12000 },
  { id: "floss-roll-abon", name: "Floss Roll Abon", price: 15000 },
  { id: "sisir-besar", name: "Sisir Besar", price: 9000 },
  { id: "sisir-meses", name: "Sisir Meses", price: 9000 },
  { id: "sisir-besar-pandan", name: "Sisir Besar Pandan", price: 9500 },
  { id: "pizza", name: "Pizza", price: 30000 },
  { id: "cheese-cake", name: "Cheese Cake", price: 45000 },
  { id: "cheers-besar", name: "Cheers Besar", price: 18000 },
];
