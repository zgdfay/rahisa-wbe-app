"use client";

import { useEffect, useState } from "react";
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Plus, Search, Package } from "lucide-react";
import {
  Product,
  PRODUCTS_MOCK,
  CATEGORY_LABELS,
  ProductCategory,
} from "./components/types";
import { ProductModal } from "./components/ProductModal";
import { ProductCard } from "./components/ProductCard";
import { toast } from "sonner";

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | ProductCategory>(
    "all"
  );
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState("8");

  // Load persistence
  useEffect(() => {
    const saved = localStorage.getItem("product_catalog");
    if (saved) {
      try {
        setProducts(JSON.parse(saved));
      } catch (e) {
        setProducts(PRODUCTS_MOCK);
        localStorage.setItem("product_catalog", JSON.stringify(PRODUCTS_MOCK));
      }
    } else {
      setProducts(PRODUCTS_MOCK);
      localStorage.setItem("product_catalog", JSON.stringify(PRODUCTS_MOCK));
    }
  }, []);

  const saveToLocalStorage = (data: Product[]) => {
    localStorage.setItem("product_catalog", JSON.stringify(data));
    setProducts(data);
  };

  // Handlers
  const handleAdd = () => {
    setModalMode("add");
    setSelectedProduct(null);
    setModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setModalMode("edit");
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleSave = (product: Product) => {
    if (modalMode === "add") {
      const updated = [product, ...products]; // Add new to top
      saveToLocalStorage(updated);
      toast.success("Produk berhasil ditambahkan");
    } else {
      const updated = products.map((p) => (p.id === product.id ? product : p));
      saveToLocalStorage(updated);
      toast.success("Produk berhasil diperbarui");
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      const updated = products.filter((p) => p.id !== deleteId);
      saveToLocalStorage(updated);
      toast.success("Produk berhasil dihapus");
      setDeleteId(null);
    }
  };

  // Filter Logic
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" || product.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalPages = Math.ceil(
    filteredProducts.length / parseInt(itemsPerPage)
  );
  const paginatedProducts = filteredProducts.slice(
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
          <h1 className="text-3xl font-bold text-primary-900">
            Manajemen Produk
          </h1>
          <p className="text-muted mt-1">
            Kelola katalog produk roti dan kue yang dijual
          </p>
        </div>
        <Button
          onClick={handleAdd}
          className="gap-2 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          Tambah Produk
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-primary-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama produk..."
            className="pl-9 bg-primary-50/50 border-primary-100 focus:bg-white transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          value={categoryFilter}
          onValueChange={(val: any) => setCategoryFilter(val)}
        >
          <SelectTrigger className="w-full md:w-[180px] cursor-pointer">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">
              Semua Kategori
            </SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key} className="cursor-pointer">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(val: any) => setStatusFilter(val)}
        >
          <SelectTrigger className="w-full md:w-[150px] cursor-pointer">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">
              Semua Status
            </SelectItem>
            <SelectItem value="active" className="cursor-pointer">
              Aktif
            </SelectItem>
            <SelectItem value="inactive" className="cursor-pointer">
              Tidak Aktif
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Product Grid */}
      {paginatedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-primary-50/30 rounded-2xl border border-dashed border-primary-200">
          <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-primary-900">
            Tidak ada produk ditemukan
          </h3>
          <p className="text-muted">
            Coba ubah kata kunci pencarian atau filter Anda
          </p>
        </div>
      )}

      {/* Pagination */}
      {paginatedProducts.length > 0 && (
        <div className="flex items-center justify-between p-4 border-t border-primary-100 bg-white rounded-xl shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <p>Produk per halaman:</p>
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
                <SelectItem value="4" className="cursor-pointer">
                  4
                </SelectItem>
                <SelectItem value="8" className="cursor-pointer">
                  8
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

      {/* Modals */}
      <ProductModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        product={selectedProduct}
        onSave={handleSave}
      />

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Produk?</AlertDialogTitle>
            <AlertDialogDescription>
              Produk yang dihapus tidak dapat dikembalikan. Pastikan produk ini
              sudah tidak dijual lagi.
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
