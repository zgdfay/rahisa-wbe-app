"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DESStepDetail } from "./predictionUtils";

interface PredictionTableProps {
  details: DESStepDetail[];
}

export function PredictionTable({ details }: PredictionTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  const totalPages = Math.ceil(details.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = details.slice(startIndex, startIndex + rowsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-100 overflow-hidden shadow-sm bg-white">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="font-semibold text-xs py-3 px-4">
                Tanggal
              </TableHead>
              <TableHead className="text-right font-semibold text-xs py-3 px-4">
                Aktual
              </TableHead>
              <TableHead className="text-right font-semibold text-xs py-3 px-4 border-l border-gray-100">
                Level
              </TableHead>
              <TableHead className="text-right font-semibold text-xs py-3 px-4 border-l border-gray-100">
                Trend
              </TableHead>
              <TableHead className="text-right font-semibold text-xs py-3 px-4 border-l border-gray-100 text-primary-700">
                Forecast
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((row, i) => (
              <TableRow key={i} className="hover:bg-gray-50/30">
                <TableCell className="font-medium text-xs text-gray-600 py-3 px-4">
                  {row.date}
                </TableCell>
                <TableCell className="text-right text-xs text-gray-900 py-3 px-4">
                  {row.actual}
                </TableCell>
                <TableCell className="text-right text-xs text-gray-600 py-3 px-4 border-l border-gray-50">
                  {row.level !== null ? row.level.toFixed(2) : "-"}
                </TableCell>
                <TableCell className="text-right text-xs text-gray-600 py-3 px-4 border-l border-gray-50">
                  {row.trend !== null ? row.trend.toFixed(2) : "-"}
                </TableCell>
                <TableCell className="text-right text-xs font-semibold text-primary-700 py-3 px-4 border-l border-gray-50 bg-primary-50/10">
                  {row.forecast !== null ? row.forecast.toFixed(2) : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>
            Menampilkan halaman{" "}
            <span className="font-semibold text-gray-900">{currentPage}</span>{" "}
            dari{" "}
            <span className="font-semibold text-gray-900">{totalPages}</span> (
            {details.length} Data)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="h-8"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="h-8"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
