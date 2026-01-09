"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product, ProductCategory, CATEGORY_LABELS } from "./types";
import { Recipe, RECIPES_MOCK } from "../../recipe/components/types";
import { toast } from "sonner";
import { ChefHat } from "lucide-react";

interface ProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  product: Product | null;
  onSave: (product: Product) => void;
}

export function ProductModal({
  open,
  onOpenChange,
  mode,
  product,
  onSave,
}: ProductModalProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    id: "",
    name: "",
    price: 0,
    category: "roti_manis",
    status: "active",
    description: "",
    image: "",
  });

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>("");

  // Sync form data with product prop
  useEffect(() => {
    // Load recipes for dropdown
    const savedRecipes = localStorage.getItem("product_recipes");
    if (savedRecipes) {
      setRecipes(JSON.parse(savedRecipes));
    } else {
      setRecipes(RECIPES_MOCK);
    }

    if (product) {
      setFormData(product);
      // Try to find matching recipe if name matches (reverse lookup hack since we don't store recipeId in product yet)
      // In a real app we'd store recipeId on the product
    } else {
      setFormData({
        id: "",
        name: "",
        price: 0,
        category: "roti_manis",
        status: "active",
        description: "",
        image: "",
      });
      setSelectedRecipeId("");
    }
  }, [product, open]);

  const handleRecipeSelect = (recipeId: string) => {
    setSelectedRecipeId(recipeId);
    const recipe = recipes.find((r) => r.id === recipeId);
    if (recipe) {
      setFormData({
        ...formData,
        name: recipe.name,
        // We could also try to auto-guess category or price logic here if needed
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.category) {
      toast.error("Nama, harga, dan kategori harus diisi");
      return;
    }

    if (formData.price < 0) {
      toast.error("Harga tidak boleh negatif");
      return;
    }

    // Auto-generate ID if adding
    const productId =
      mode === "add"
        ? formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") +
          "-" +
          Date.now().toString().slice(-4)
        : product?.id || "";

    const productToSave: Product = {
      id: productId,
      name: formData.name,
      price: Number(formData.price),
      category: formData.category as ProductCategory,
      status: formData.status || "active",
      description: formData.description || "",
      image:
        formData.image ||
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80", // Default placeholder
    };

    onSave(productToSave);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Tambah Produk Baru" : "Edit Produk"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Pilih resep untuk menambahkan produk ke katalog"
              : "Perbarui informasi produk"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Recipe Selection (Only for Add Mode?) */}
            {mode === "add" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right flex items-center justify-end gap-2">
                  <ChefHat className="w-4 h-4 text-primary-600" />
                  Pilih Resep
                </Label>
                <Select
                  value={selectedRecipeId}
                  onValueChange={handleRecipeSelect}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Pilih dari daftar resep..." />
                  </SelectTrigger>
                  <SelectContent>
                    {recipes.map((r) => (
                      <SelectItem
                        key={r.id}
                        value={r.id}
                        className="cursor-pointer"
                      >
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nama Produk
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="col-span-3"
                placeholder={
                  mode === "add"
                    ? "Otomatis terisi dari resep..."
                    : "Nama produk"
                }
                readOnly={mode === "add"} // Readonly if adding via recipe
              />
            </div>

            {/* Image URL (Simple input for now) */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image" className="text-right">
                URL Gambar
              </Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                className="col-span-3"
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Harga (Rp)
              </Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Kategori
              </Label>
              <Select
                value={formData.category}
                onValueChange={(val: ProductCategory) =>
                  setFormData({ ...formData, category: val })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem
                      key={key}
                      value={key}
                      className="cursor-pointer"
                    >
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(val: "active" | "inactive") =>
                  setFormData({ ...formData, status: val })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active" className="cursor-pointer">
                    Aktif (Dijual)
                  </SelectItem>
                  <SelectItem value="inactive" className="cursor-pointer">
                    Tidak Aktif (Disembunyikan)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Deskripsi
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="col-span-3 h-20"
                placeholder="Deskripsi singkat produk..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" className="text-white cursor-pointer">
              {mode === "add" ? "Tambah Produk" : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
