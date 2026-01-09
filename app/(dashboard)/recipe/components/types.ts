export interface RecipeItem {
  ingredientId: string;
  ingredientName: string; // Cached for display
  unit: string; // Cached for display
  quantity: number;
}

export interface Recipe {
  id: string;
  name: string; // Changed from productName
  // productId is now optional or removed, as Recipe comes first
  items: RecipeItem[];
  yield: number;
  notes?: string;
}

// Mock data
export const RECIPES_MOCK: Recipe[] = [
  {
    id: "recipe-donat-premium",
    name: "Adonan Donat Premium",
    yield: 12,
    items: [
      { ingredientId: "tepung-terigu", ingredientName: "Tepung Terigu", unit: "kg", quantity: 1 },
      { ingredientId: "gula-pasir", ingredientName: "Gula Pasir", unit: "kg", quantity: 0.2 },
      { ingredientId: "telur-ayam", ingredientName: "Telur Ayam", unit: "butir", quantity: 4 },
      { ingredientId: "susu-cair", ingredientName: "Susu Cair", unit: "liter", quantity: 0.3 },
      { ingredientId: "mentega", ingredientName: "Mentega", unit: "kg", quantity: 0.15 },
    ],
    notes: "Aduk rata bahan kering terlebih dahulu sebelum menambahkan bahan basah. Diamkan adonan 30 menit sebelum digoreng."
  },
  {
    id: "recipe-roti-tawar-klasik",
    name: "Roti Tawar Klasik",
    yield: 2,
    items: [
      { ingredientId: "tepung-terigu", ingredientName: "Tepung Terigu", unit: "kg", quantity: 0.5 },
      { ingredientId: "gula-pasir", ingredientName: "Gula Pasir", unit: "kg", quantity: 0.05 },
      { ingredientId: "garam", ingredientName: "Garam", unit: "gram", quantity: 10 },
      { ingredientId: "susu-cair", ingredientName: "Susu Cair", unit: "liter", quantity: 0.25 },
      { ingredientId: "ragi-instan", ingredientName: "Ragi Instan", unit: "gram", quantity: 5 },
    ],
    notes: "Proofing pertama 45 menit, proofing kedua 30 menit. Panggang 180°C selama 35 menit."
  },
  {
    id: "recipe-croissant-butter",
    name: "Croissant Butter Perancis",
    yield: 8,
    items: [
      { ingredientId: "tepung-terigu", ingredientName: "Tepung Terigu", unit: "kg", quantity: 0.5 },
      { ingredientId: "mentega", ingredientName: "Mentega", unit: "kg", quantity: 0.25 },
      { ingredientId: "susu-cair", ingredientName: "Susu Cair", unit: "liter", quantity: 0.15 },
      { ingredientId: "gula-pasir", ingredientName: "Gula Pasir", unit: "kg", quantity: 0.05 },
      { ingredientId: "telur-ayam", ingredientName: "Telur Ayam", unit: "butir", quantity: 1 },
    ],
    notes: "Gunakan teknik laminating untuk mendapatkan layer yang sempurna. Simpan adonan di kulkas minimal 2 jam sebelum dipanggang."
  },
  {
    id: "recipe-kue-bolu-pandan",
    name: "Bolu Pandan Lembut",
    yield: 1,
    items: [
      { ingredientId: "tepung-terigu", ingredientName: "Tepung Terigu", unit: "kg", quantity: 0.25 },
      { ingredientId: "telur-ayam", ingredientName: "Telur Ayam", unit: "butir", quantity: 6 },
      { ingredientId: "gula-pasir", ingredientName: "Gula Pasir", unit: "kg", quantity: 0.15 },
      { ingredientId: "santan", ingredientName: "Santan", unit: "liter", quantity: 0.1 },
      { ingredientId: "pasta-pandan", ingredientName: "Pasta Pandan", unit: "ml", quantity: 10 },
    ],
    notes: "Kocok telur dan gula hingga mengembang sempurna untuk hasil yang maksimal. Panggang dengan teknik au bain marie."
  },
  {
    id: "recipe-brownies-coklat",
    name: "Brownies Coklat Fudgy",
    yield: 20,
    items: [
      { ingredientId: "tepung-terigu", ingredientName: "Tepung Terigu", unit: "kg", quantity: 0.2 },
      { ingredientId: "coklat-bubuk", ingredientName: "Coklat Bubuk", unit: "gram", quantity: 100 },
      { ingredientId: "telur-ayam", ingredientName: "Telur Ayam", unit: "butir", quantity: 4 },
      { ingredientId: "gula-pasir", ingredientName: "Gula Pasir", unit: "kg", quantity: 0.25 },
      { ingredientId: "mentega", ingredientName: "Mentega", unit: "kg", quantity: 0.2 },
      { ingredientId: "dark-chocolate", ingredientName: "Dark Chocolate", unit: "gram", quantity: 150 },
    ],
    notes: "Jangan overmix adonan agar tekstur fudgy tetap terjaga. Panggang 170°C selama 25-30 menit."
  },
  {
    id: "recipe-roti-pisang-coklat",
    name: "Roti Manis Pisang Coklat",
    yield: 10,
    items: [
      { ingredientId: "tepung-terigu", ingredientName: "Tepung Terigu", unit: "kg", quantity: 0.5 },
      { ingredientId: "pisang", ingredientName: "Pisang", unit: "buah", quantity: 3 },
      { ingredientId: "coklat-batang", ingredientName: "Coklat Batang", unit: "gram", quantity: 100 },
      { ingredientId: "gula-pasir", ingredientName: "Gula Pasir", unit: "kg", quantity: 0.1 },
      { ingredientId: "telur-ayam", ingredientName: "Telur Ayam", unit: "butir", quantity: 2 },
      { ingredientId: "susu-cair", ingredientName: "Susu Cair", unit: "liter", quantity: 0.15 },
    ],
    notes: "Potong pisang dan coklat menjadi ukuran kecil. Proofing 45 menit sebelum dipanggang."
  },
];
