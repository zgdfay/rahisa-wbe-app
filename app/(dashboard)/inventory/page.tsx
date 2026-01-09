"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Package,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  Search,
} from "lucide-react";
import {
  Ingredient,
  INGREDIENTS,
  getStockStatus,
  getStatusColor,
  getStatusLabel,
  StockStatus,
} from "./components/types";
import { InventoryModal } from "./components/InventoryModal";
import { toast } from "sonner";

export default function InventoryPage() {
  const [inventory, setInventory] = useState<Ingredient[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedIngredient, setSelectedIngredient] =
    useState<Ingredient | null>(null);

  // Delete Dialog State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Search, Filter, Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | StockStatus>("all");
  const [unitFilter, setUnitFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState("10");

  useEffect(() => {
    const saved = localStorage.getItem("inventory_stock");
    if (saved) {
      try {
        setInventory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse inventory", e);
        setInventory(INGREDIENTS);
        localStorage.setItem("inventory_stock", JSON.stringify(INGREDIENTS));
      }
    } else {
      setInventory(INGREDIENTS);
      localStorage.setItem("inventory_stock", JSON.stringify(INGREDIENTS));
    }
  }, []);

  const saveToLocalStorage = (data: Ingredient[]) => {
    localStorage.setItem("inventory_stock", JSON.stringify(data));
    setInventory(data);
  };

  const handleAdd = () => {
    setModalMode("add");
    setSelectedIngredient(null);
    setModalOpen(true);
  };

  const handleEdit = (ingredient: Ingredient) => {
    setModalMode("edit");
    setSelectedIngredient(ingredient);
    setModalOpen(true);
  };

  const handleSave = (ingredient: Ingredient) => {
    if (modalMode === "add") {
      if (inventory.find((i) => i.id === ingredient.id)) {
        toast.error("Bahan dengan nama tersebut sudah ada");
        return;
      }
      const updated = [...inventory, ingredient];
      saveToLocalStorage(updated);
      toast.success("Bahan berhasil ditambahkan");
    } else {
      const updated = inventory.map((i) =>
        i.id === ingredient.id ? ingredient : i
      );
      saveToLocalStorage(updated);
      toast.success("Stok berhasil diperbarui");
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      const updated = inventory.filter((i) => i.id !== deleteId);
      saveToLocalStorage(updated);
      toast.success("Bahan berhasil dihapus");
      setDeleteId(null);
    }
  };

  // Unique units for filter
  const uniqueUnits = Array.from(new Set(inventory.map((item) => item.unit)));

  // Filter and Search Logic
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.unit.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      getStockStatus(item.currentStock, item.minStock) === statusFilter;
    const matchesUnit = unitFilter === "all" || item.unit === unitFilter;

    return matchesSearch && matchesStatus && matchesUnit;
  });

  // Pagination
  const totalPages = Math.ceil(
    filteredInventory.length / parseInt(itemsPerPage)
  );
  const paginatedInventory = filteredInventory.slice(
    (currentPage - 1) * parseInt(itemsPerPage),
    currentPage * parseInt(itemsPerPage)
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const criticalCount = inventory.filter(
    (item) => getStockStatus(item.currentStock, item.minStock) === "critical"
  ).length;

  const warningCount = inventory.filter(
    (item) => getStockStatus(item.currentStock, item.minStock) === "warning"
  ).length;

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-900">
            Inventori Bahan Baku
          </h1>
          <p className="text-muted mt-1">
            Kelola stok bahan baku dan pantau ketersediaan gudang
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2 text-white cursor-pointer">
          <Plus className="w-4 h-4" />
          Tambah Bahan
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-100 rounded-xl">
                <Package className="w-6 h-6 text-primary-700" />
              </div>
              <div>
                <p className="text-sm text-muted">Total Bahan</p>
                <p className="text-2xl font-bold text-primary-900">
                  {inventory.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <p className="text-sm text-muted">Perlu Diisi</p>
                <p className="text-2xl font-bold text-amber-900">
                  {warningCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-700" />
              </div>
              <div>
                <p className="text-sm text-muted">Stok Kritis</p>
                <p className="text-2xl font-bold text-red-900">
                  {criticalCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex gap-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari bahan..."
                className="pl-9 h-10"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <Select
              value={unitFilter}
              onValueChange={(value: string) => {
                setUnitFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[140px] h-10 cursor-pointer">
                <SelectValue placeholder="Satuan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="cursor-pointer">
                  Semua Satuan
                </SelectItem>
                {uniqueUnits.map((unit) => (
                  <SelectItem
                    key={unit}
                    value={unit}
                    className="cursor-pointer"
                  >
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(value: any) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[160px] h-10 cursor-pointer">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="cursor-pointer">
                  Semua Status
                </SelectItem>
                <SelectItem value="safe" className="cursor-pointer">
                  Aman
                </SelectItem>
                <SelectItem value="warning" className="cursor-pointer">
                  Perlu Diisi
                </SelectItem>
                <SelectItem value="critical" className="cursor-pointer">
                  Kritis
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-50 border-y border-primary-100">
                <tr>
                  <th className="text-left p-4 font-semibold text-primary-900">
                    Nama Bahan
                  </th>
                  <th className="text-center p-4 font-semibold text-primary-900">
                    Satuan
                  </th>
                  <th className="text-right p-4 font-semibold text-primary-900">
                    Stok Saat Ini
                  </th>
                  <th className="text-right p-4 font-semibold text-primary-900">
                    Min
                  </th>
                  <th className="text-right p-4 font-semibold text-primary-900">
                    Max
                  </th>
                  <th className="text-center p-4 font-semibold text-primary-900">
                    Status
                  </th>
                  <th className="text-center p-4 font-semibold text-primary-900">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-50">
                {paginatedInventory.length > 0 ? (
                  paginatedInventory.map((ingredient) => {
                    const status = getStockStatus(
                      ingredient.currentStock,
                      ingredient.minStock
                    );
                    const colors = getStatusColor(status);

                    return (
                      <tr
                        key={ingredient.id}
                        className="hover:bg-primary-50/30 transition-colors"
                      >
                        <td className="p-4">
                          <span className="font-medium text-primary-900">
                            {ingredient.name}
                          </span>
                        </td>
                        <td className="p-4 text-center text-muted">
                          {ingredient.unit}
                        </td>
                        <td className="p-4 text-right">
                          <span className={`font-bold ${colors.text}`}>
                            {ingredient.currentStock}
                          </span>
                        </td>
                        <td className="p-4 text-right text-muted">
                          {ingredient.minStock}
                        </td>
                        <td className="p-4 text-right text-muted">
                          {ingredient.maxStock}
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center">
                            <span
                              className={`px-3 py-1 rounded-lg text-xs font-bold border ${colors.badge}`}
                            >
                              {getStatusLabel(status)}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(ingredient)}
                              className="h-8 w-8 p-0 hover:bg-primary-100 hover:text-primary-700 cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(ingredient.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted">
                      {searchQuery ||
                      statusFilter !== "all" ||
                      unitFilter !== "all"
                        ? "Tidak ada hasil yang sesuai filter"
                        : "Belum ada data bahan baku"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {paginatedInventory.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t border-primary-100">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <p>Baris per halaman:</p>
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
                    <SelectItem value="5" className="cursor-pointer">
                      5
                    </SelectItem>
                    <SelectItem value="10" className="cursor-pointer">
                      10
                    </SelectItem>
                    <SelectItem value="20" className="cursor-pointer">
                      20
                    </SelectItem>
                    <SelectItem value="50" className="cursor-pointer">
                      50
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
                            : "cursor-pointer border-primary-200 hover:bg-primary-50 hover:border-primary-300"
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
                                ? "bg-primary-500 text-white border-primary-500 hover:bg-primary-600"
                                : "border-primary-200 hover:bg-primary-50 hover:border-primary-300"
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
                            : "cursor-pointer border-primary-200 hover:bg-primary-50 hover:border-primary-300"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal - Edit/Add */}
      <InventoryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        ingredient={selectedIngredient}
        onSave={handleSave}
      />

      {/* Alert Dialog - Delete Confirmation */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data bahan baku yang dihapus
              akan hilang dari inventori secara permanen.
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
