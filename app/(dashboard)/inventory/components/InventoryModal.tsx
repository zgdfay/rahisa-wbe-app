"use client";

import { useState, useEffect } from "react";
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
import { Ingredient } from "./types";
import { toast } from "sonner";

interface InventoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  ingredient: Ingredient | null;
  onSave: (ingredient: Ingredient) => void;
}

export function InventoryModal({
  open,
  onOpenChange,
  mode,
  ingredient,
  onSave,
}: InventoryModalProps) {
  const [formData, setFormData] = useState<Partial<Ingredient>>(
    ingredient || {
      id: "",
      name: "",
      unit: "kg",
      currentStock: 0,
      minStock: 0,
      maxStock: 0,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.unit) {
      toast.error("Nama dan satuan harus diisi");
      return;
    }

    if (
      formData.currentStock === undefined ||
      formData.minStock === undefined ||
      formData.maxStock === undefined
    ) {
      toast.error("Semua nilai stok harus diisi");
      return;
    }

    if (
      formData.currentStock < 0 ||
      formData.minStock < 0 ||
      formData.maxStock < 0
    ) {
      toast.error("Nilai stok tidak boleh negatif");
      return;
    }

    if (formData.minStock > formData.maxStock) {
      toast.error("Stok minimum tidak boleh lebih dari stok maksimum");
      return;
    }

    const ingredientToSave: Ingredient = {
      id:
        mode === "add"
          ? formData.name!.toLowerCase().replace(/\s+/g, "-")
          : ingredient!.id,
      name: formData.name!,
      unit: formData.unit!,
      currentStock: formData.currentStock!,
      minStock: formData.minStock!,
      maxStock: formData.maxStock!,
    };

    onSave(ingredientToSave);
    onOpenChange(false);

    // Reset form
    setFormData({
      id: "",
      name: "",
      unit: "kg",
      currentStock: 0,
      minStock: 0,
      maxStock: 0,
    });
  };

  // Update form when ingredient prop changes
  useEffect(() => {
    if (ingredient) {
      setFormData(ingredient);
    } else {
      // Reset when adding new
      setFormData({
        id: "",
        name: "",
        unit: "kg",
        currentStock: 0,
        minStock: 0,
        maxStock: 0,
      });
    }
  }, [ingredient]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Tambah Bahan Baru" : "Edit Stok Bahan"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Masukkan informasi bahan baru ke inventori"
              : "Perbarui informasi stok bahan"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nama Bahan
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="col-span-3"
                placeholder="Tepung Terigu"
                disabled={mode === "edit"}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit" className="text-right">
                Satuan
              </Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                className="col-span-3"
                placeholder="kg, liter, butir"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currentStock" className="text-right">
                Stok Saat Ini
              </Label>
              <Input
                id="currentStock"
                type="number"
                value={formData.currentStock}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    currentStock: parseFloat(e.target.value) || 0,
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="minStock" className="text-right">
                Stok Minimum
              </Label>
              <Input
                id="minStock"
                type="number"
                value={formData.minStock}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minStock: parseFloat(e.target.value) || 0,
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="maxStock" className="text-right">
                Stok Maksimum
              </Label>
              <Input
                id="maxStock"
                type="number"
                value={formData.maxStock}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxStock: parseFloat(e.target.value) || 0,
                  })
                }
                className="col-span-3"
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
              {mode === "add" ? "Tambah" : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
