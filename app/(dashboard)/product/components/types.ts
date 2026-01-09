export type ProductCategory = "roti_manis" | "roti_tawar" | "cake" | "pastry" | "other";
export type ProductStatus = "active" | "inactive";

export interface Product {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  status: ProductStatus;
  description: string;
  image?: string; // Optional image URL
}

export const PRODUCTS_MOCK: Product[] = [
  {
    id: "donat-coklat",
    name: "Donat Coklat",
    price: 5000,
    category: "roti_manis",
    status: "active",
    description: "Donat lembut dengan topping coklat premium",
    image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&q=80",
  },
  {
    id: "roti-tawar-kup",
    name: "Roti Tawar Kupas",
    price: 15000,
    category: "roti_tawar",
    status: "active",
    description: "Roti tawar lembut tanpa kulit, cocok untuk sarapan",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80",
  },
  {
    id: "croissant-butter",
    name: "Butter Croissant",
    price: 18000,
    category: "pastry",
    status: "active",
    description: "Croissant flaky dengan butter premium perancis",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&q=80",
  },
  {
    id: "cheese-cake-slice",
    name: "Cheese Cake Slice",
    price: 25000,
    category: "cake",
    status: "active",
    description: "Potongan cheese cake lembut yang lumer di mulut",
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&q=80",
  },
  {
    id: "roti-pisang-coklat",
    name: "Roti Pisang Coklat",
    price: 8000,
    category: "roti_manis",
    status: "active",
    description: "Roti manis isi pisang dan coklat lumer",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80", // Placeholder reused
  },
];

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  roti_manis: "Roti Manis",
  roti_tawar: "Roti Tawar",
  cake: "Cake & Bolu",
  pastry: "Pastry",
  other: "Lainnya",
};

export const STATUS_LABELS: Record<ProductStatus, string> = {
  active: "Aktif",
  inactive: "Tidak Aktif",
};

export const CATEGORY_COLORS: Record<ProductCategory, string> = {
  roti_manis: "bg-orange-100 text-orange-700 border-orange-200",
  roti_tawar: "bg-blue-100 text-blue-700 border-blue-200",
  cake: "bg-pink-100 text-pink-700 border-pink-200",
  pastry: "bg-amber-100 text-amber-700 border-amber-200",
  other: "bg-gray-100 text-gray-700 border-gray-200",
};
