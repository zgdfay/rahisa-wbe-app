"use client";

import { useState } from "react";
import { Search, Download } from "lucide-react";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Fragment } from "react";
import { Transaction } from "./types";

interface SalesHistoryTableProps {
  transactions: Transaction[];
}

export function SalesHistoryTable({ transactions }: SalesHistoryTableProps) {
  const [sortOrder, setSortOrder] = useState("newest");
  const [itemsPerPage, setItemsPerPage] = useState("5");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Filter transactions by search query
  const filteredTransactions = transactions.filter((trx) => {
    const query = searchQuery.toLowerCase();
    return (
      trx.id.toLowerCase().includes(query) ||
      trx.productName.toLowerCase().includes(query)
    );
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortOrder === "newest")
      return (
        new Date(b.date + " " + b.time).getTime() -
        new Date(a.date + " " + a.time).getTime()
      );
    if (sortOrder === "oldest")
      return (
        new Date(a.date + " " + a.time).getTime() -
        new Date(b.date + " " + b.time).getTime()
      );
    if (sortOrder === "highest") return b.totalPrice - a.totalPrice;
    if (sortOrder === "lowest") return a.totalPrice - b.totalPrice;
    return 0;
  });

  // Pagination Logic
  const totalPages = Math.ceil(
    sortedTransactions.length / parseInt(itemsPerPage)
  );
  const paginatedTransactions = sortedTransactions.slice(
    (currentPage - 1) * parseInt(itemsPerPage),
    currentPage * parseInt(itemsPerPage)
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getVisiblePages = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = new Set<number>();
    pages.add(1);
    pages.add(totalPages);
    pages.add(currentPage);
    pages.add(Math.max(2, currentPage - 1));
    pages.add(Math.min(totalPages - 1, currentPage + 1));

    return Array.from(pages)
      .filter((page) => page >= 1 && page <= totalPages)
      .sort((a, b) => a - b);
  };

  const visiblePages = getVisiblePages();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="mb-2">Riwayat Transaksi</CardTitle>
          <CardDescription>
            Daftar semua transaksi penjualan yang tercatat.
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-64 max-w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari ID atau Produk..."
              className="pl-9 h-10"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="w-[160px] shrink-0">
            <Select defaultValue="newest" onValueChange={setSortOrder}>
              <SelectTrigger className="h-10 cursor-pointer">
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest" className="cursor-pointer">
                  Terbaru
                </SelectItem>
                <SelectItem value="oldest" className="cursor-pointer">
                  Terlama
                </SelectItem>
                <SelectItem value="highest" className="cursor-pointer">
                  Nominal Tertinggi
                </SelectItem>
                <SelectItem value="lowest" className="cursor-pointer">
                  Nominal Terendah
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 cursor-pointer border-primary-200 hover:bg-primary-50 hover:border-primary-300"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-primary-100 overflow-hidden mb-4">
          <table className="w-full text-sm text-left">
            <thead className="bg-primary-50 text-primary-900 font-semibold">
              <tr>
                <th className="p-4">ID Transaksi</th>
                <th className="p-4">Tanggal & Waktu</th>
                <th className="p-4">Produk</th>
                <th className="p-4">Jumlah</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-50">
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((trx) => (
                  <tr
                    key={trx.id}
                    className="hover:bg-primary-50/30 transition-colors"
                  >
                    <td className="p-4 font-medium text-primary-900">
                      #{trx.id}
                    </td>
                    <td className="p-4 text-muted">
                      {trx.date}, {trx.time}
                    </td>
                    <td className="p-4 text-primary-900">{trx.productName}</td>
                    <td className="p-4 text-muted">{trx.quantity} Pcs</td>
                    <td className="p-4 font-bold text-primary-700">
                      {formatCurrency(trx.totalPrice)}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold capitalize">
                        {trx.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted">
                    {searchQuery
                      ? "Tidak ada hasil pencarian."
                      : "Belum ada data transaksi. Silakan input transaksi baru."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <p>Baris per halaman:</p>
            <Select
              value={itemsPerPage}
              onValueChange={(val) => {
                setItemsPerPage(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-[78px]">
                <SelectValue placeholder={itemsPerPage} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {totalPages > 1 && (
            <Pagination className="w-full lg:w-auto overflow-x-auto">
              <PaginationContent className="flex-wrap justify-center lg:justify-end">
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

                {visiblePages.map((page, index) => {
                  const previousPage = visiblePages[index - 1];
                  const hasGap = previousPage && page - previousPage > 1;

                  return (
                    <Fragment key={page}>
                      {hasGap && (
                        <PaginationItem key={`ellipsis-${page}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      <PaginationItem>
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
                    </Fragment>
                  );
                })}

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
      </CardContent>
    </Card>
  );
}
