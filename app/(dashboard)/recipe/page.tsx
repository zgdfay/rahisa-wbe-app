"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  ChefHat,
  Edit2,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Recipe, RECIPES_MOCK } from "./components/types";
import { RecipeModal } from "./components/RecipeModal";
import { Ingredient, INGREDIENTS } from "../inventory/components/types";

export default function RecipePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [yieldFilter, setYieldFilter] = useState<
    "all" | "small" | "medium" | "large"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState("6");

  // Load Data
  useEffect(() => {
    // 1. Load Ingredients
    const savedIngredients = localStorage.getItem("inventory_stock");
    const loadedIngredients = savedIngredients
      ? JSON.parse(savedIngredients)
      : INGREDIENTS;
    setIngredients(loadedIngredients);

    // 2. Load Recipes
    const savedRecipes = localStorage.getItem("product_recipes");
    let loadedRecipes: Recipe[] = [];

    if (savedRecipes) {
      try {
        loadedRecipes = JSON.parse(savedRecipes);
        // Force reload if data is old/invalid or if we have fewer recipes than mock
        if (
          !Array.isArray(loadedRecipes) ||
          loadedRecipes.length < RECIPES_MOCK.length
        ) {
          console.log("Updating to new recipe data...");
          loadedRecipes = RECIPES_MOCK;
          localStorage.setItem("product_recipes", JSON.stringify(RECIPES_MOCK));
        }
      } catch (e) {
        loadedRecipes = RECIPES_MOCK;
        localStorage.setItem("product_recipes", JSON.stringify(RECIPES_MOCK));
      }
    } else {
      loadedRecipes = RECIPES_MOCK;
      localStorage.setItem("product_recipes", JSON.stringify(RECIPES_MOCK));
    }

    setRecipes(loadedRecipes);
  }, []);

  const saveRecipes = (data: Recipe[]) => {
    localStorage.setItem("product_recipes", JSON.stringify(data));
    setRecipes(data);
  };

  const handleAdd = () => {
    setModalMode("add");
    setSelectedRecipe(null);
    setModalOpen(true);
  };

  const handleEdit = (recipe: Recipe, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalMode("edit");
    setSelectedRecipe(recipe);
    setModalOpen(true);
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      const updated = recipes.filter((r) => r.id !== deleteId);
      saveRecipes(updated);
      toast.success("Resep berhasil dihapus");
      setDeleteId(null);
    }
  };

  const handleSave = (recipe: Recipe) => {
    const updatedRecipe = {
      ...recipe,
      items: recipe.items.map((item) => {
        const ing = ingredients.find((i) => i.id === item.ingredientId);
        return {
          ...item,
          ingredientName: ing?.name || "Unknown Ingredient",
          unit: ing?.unit || "-",
        };
      }),
    };

    let updatedRecipes: Recipe[];
    if (modalMode === "add") {
      updatedRecipes = [...recipes, updatedRecipe];
      toast.success("Resep berhasil dibuat");
    } else {
      updatedRecipes = recipes.map((r) =>
        r.id === recipe.id ? updatedRecipe : r
      );
      toast.success("Resep berhasil diperbarui");
    }
    saveRecipes(updatedRecipes);
  };

  // Filter Logic
  const filteredRecipes = recipes.filter((r) => {
    const matchesSearch =
      r.name && r.name.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesYield = true;
    if (yieldFilter === "small") matchesYield = r.yield <= 5;
    else if (yieldFilter === "medium")
      matchesYield = r.yield > 5 && r.yield <= 15;
    else if (yieldFilter === "large") matchesYield = r.yield > 15;

    return matchesSearch && matchesYield;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRecipes.length / parseInt(itemsPerPage));
  const paginatedRecipes = filteredRecipes.slice(
    (currentPage - 1) * parseInt(itemsPerPage),
    currentPage * parseInt(itemsPerPage)
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-900">Daftar Resep</h1>
          <p className="text-muted mt-1">
            Kelola resep dan komposisi bahan baku
          </p>
        </div>
        <Button
          onClick={handleAdd}
          className="gap-2 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all shadow-primary-500/20"
        >
          <Plus className="w-5 h-5" />
          Buat Resep Baru
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-primary-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari resep..."
            className="pl-9 bg-primary-50/50 border-primary-100 focus:bg-white transition-colors"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <Select
          value={yieldFilter}
          onValueChange={(val: any) => {
            setYieldFilter(val);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-full md:w-[180px] cursor-pointer">
            <SelectValue placeholder="Filter Yield" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">
              Semua Yield
            </SelectItem>
            <SelectItem value="small" className="cursor-pointer">
              Kecil (≤5 pcs)
            </SelectItem>
            <SelectItem value="medium" className="cursor-pointer">
              Sedang (6-15 pcs)
            </SelectItem>
            <SelectItem value="large" className="cursor-pointer">
              Besar (&gt;15 pcs)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Recipe List (Splitted Cards) */}
      <div className="space-y-4">
        {paginatedRecipes.length > 0 ? (
          paginatedRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white rounded-xl border border-primary-100 shadow-sm overflow-hidden transition-all hover:shadow-md"
            >
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value={recipe.id} className="border-0 px-6">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-4 text-left">
                        <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                          <ChefHat className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-primary-900">
                            {recipe.name}
                          </h3>
                          <p className="text-sm text-muted">
                            Ada {recipe.items.length} Bahan - Yield:{" "}
                            {recipe.yield} pcs
                          </p>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 pt-2 pl-[52px]">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-sm text-primary-900">
                        Komposisi Bahan:
                      </h4>
                      <div className="flex gap-2">
                        <Button
                          onClick={(e) => handleEdit(recipe, e)}
                          variant="ghost"
                          size="sm"
                          className="h-8 text-primary-600 gap-2 hover:text-primary-700 hover:bg-primary-50 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit
                        </Button>
                        <Button
                          onClick={(e) => handleDeleteClick(recipe.id, e)}
                          variant="ghost"
                          size="sm"
                          className="h-8 text-red-600 gap-2 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Hapus
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {recipe.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100"
                        >
                          <span className="text-slate-700 font-medium text-sm">
                            {item.ingredientName}
                          </span>
                          <span className="text-primary-700 font-bold text-sm">
                            {item.quantity}{" "}
                            <span className="text-xs font-normal text-slate-500">
                              {item.unit}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>

                    {recipe.notes && (
                      <div className="mt-4 p-3 bg-amber-50 text-amber-800 text-sm rounded-lg flex gap-2 items-start border border-amber-100">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <p>{recipe.notes}</p>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl border border-primary-100 shadow-sm p-8 text-center text-muted">
            <p>Tidak ada resep yang ditemukan.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {paginatedRecipes.length > 0 && (
        <div className="flex items-center justify-between p-4 border-t border-primary-100 bg-white rounded-xl shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <p>Resep per halaman:</p>
            <Select
              value={itemsPerPage}
              onValueChange={(val) => {
                setItemsPerPage(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-[70px] cursor-pointer">
                <SelectValue placeholder={itemsPerPage} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3" className="cursor-pointer">
                  3
                </SelectItem>
                <SelectItem value="6" className="cursor-pointer">
                  6
                </SelectItem>
                <SelectItem value="12" className="cursor-pointer">
                  12
                </SelectItem>
                <SelectItem value="24" className="cursor-pointer">
                  24
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage - 1);
                    }}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer hover:bg-primary-50 hover:text-primary-600"
                    }
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        isActive={page === currentPage}
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(page);
                        }}
                        className={
                          page === currentPage
                            ? "bg-primary-500 text-white hover:bg-primary-600"
                            : "hover:bg-primary-50 hover:text-primary-600 cursor-pointer"
                        }
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage + 1);
                    }}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer hover:bg-primary-50 hover:text-primary-600"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}

      <RecipeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        recipe={selectedRecipe}
        ingredients={ingredients}
        onSave={handleSave}
      />

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Resep?</AlertDialogTitle>
            <AlertDialogDescription>
              Resep yang dihapus tidak dapat dikembalikan. Produk yang
              menggunakan resep ini mungkin terpengaruh.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
