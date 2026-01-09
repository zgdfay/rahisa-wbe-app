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
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Recipe, RecipeItem } from "./types";
import { Ingredient } from "../../inventory/components/types";

interface RecipeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  recipe: Recipe | null;
  ingredients: Ingredient[];
  onSave: (recipe: Recipe) => void;
}

export function RecipeModal({
  open,
  onOpenChange,
  mode,
  recipe,
  ingredients,
  onSave,
}: RecipeModalProps) {
  const [name, setName] = useState("");
  const [items, setItems] = useState<RecipeItem[]>([]);
  const [notes, setNotes] = useState("");
  const [yieldAmount, setYieldAmount] = useState(1);

  // Sync form data
  useEffect(() => {
    if (open) {
      if (recipe) {
        setName(recipe.name);
        setItems(recipe.items);
        setNotes(recipe.notes || "");
        setYieldAmount(recipe.yield || 1);
      } else {
        // Reset
        setName("");
        setItems([
          { ingredientId: "", ingredientName: "", unit: "", quantity: 0 },
        ]);
        setNotes("");
        setYieldAmount(1);
      }
    }
  }, [recipe, open]);

  const handleAddItem = () => {
    setItems([
      ...items,
      { ingredientId: "", ingredientName: "", unit: "", quantity: 0 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleItemChange = (
    index: number,
    field: keyof RecipeItem,
    value: any
  ) => {
    const newItems = [...items];

    if (field === "ingredientId") {
      const ingredient = ingredients.find((i) => i.id === value);
      if (ingredient) {
        newItems[index] = {
          ...newItems[index],
          ingredientId: ingredient.id,
          ingredientName: ingredient.name,
          unit: ingredient.unit,
        };
      }
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }

    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Nama resep harus diisi");
      return;
    }

    // Validate Items
    const validItems = items.filter((i) => i.ingredientId && i.quantity > 0);
    if (validItems.length === 0) {
      toast.error("Minimal satu bahan baku dengan takaran valid diperlukan");
      return;
    }

    const recipeToSave: Recipe = {
      id:
        recipe?.id ||
        `recipe-${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      name: name,
      items: validItems,
      yield: yieldAmount,
      notes: notes,
    };

    onSave(recipeToSave);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Buat Resep Baru" : "Edit Resep"}
          </DialogTitle>
          <DialogDescription>
            Definisikan nama resep dan komposisi bahan bakunya
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* Recipe Name */}
            <div className="space-y-2">
              <Label>Nama Resep</Label>
              <Input
                placeholder="Contoh: Adonan Donat Premium"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Hasil Produksi (Yield)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  className="w-24"
                  value={yieldAmount}
                  onChange={(e) =>
                    setYieldAmount(parseFloat(e.target.value) || 1)
                  }
                />
                <span className="text-muted">Pcs / Batch</span>
              </div>
            </div>

            {/* Recipe Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Bahan Baku</Label>
              </div>

              <div className="border rounded-lg p-4 space-y-3 bg-slate-50">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-3 items-end">
                    <div className="flex-1 space-y-1">
                      {index === 0 && (
                        <Label className="text-xs text-muted">Bahan</Label>
                      )}
                      <Select
                        value={item.ingredientId}
                        onValueChange={(val) =>
                          handleItemChange(index, "ingredientId", val)
                        }
                      >
                        <SelectTrigger className="bg-white cursor-pointer">
                          <SelectValue placeholder="Pilih Bahan" />
                        </SelectTrigger>
                        <SelectContent>
                          {ingredients.map((ing) => (
                            <SelectItem
                              key={ing.id}
                              value={ing.id}
                              className="cursor-pointer"
                            >
                              {ing.name} ({ing.unit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-24 space-y-1">
                      {index === 0 && (
                        <Label className="text-xs text-muted">Jumlah</Label>
                      )}
                      <Input
                        type="number"
                        step="0.001"
                        placeholder="0"
                        className="bg-white"
                        value={item.quantity === 0 ? "" : item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "quantity",
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </div>

                    <div className="w-16 space-y-1 pt-6 text-sm text-muted">
                      {item.unit || "-"}
                    </div>

                    <div className="pt-6">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:bg-red-50 hover:text-red-600 mb-[2px] cursor-pointer"
                        onClick={() => handleRemoveItem(index)}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  className="w-full mt-2 border-dashed gap-2 hover:bg-white hover:border-primary-300 hover:text-primary-600 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Bahan Lain
                </Button>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Catatan</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan..."
                className="h-20"
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
              Simpan Resep
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
