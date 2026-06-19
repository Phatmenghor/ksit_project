"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PAGE_SIZE_OPTIONS } from "@/hooks/use-pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function getPaginationItems(
  currentPage: number,
  totalPages: number
): (number | "ellipsis")[] {
  const items: (number | "ellipsis")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) items.push(i);
  } else {
    items.push(1);
    let start = Math.max(2, currentPage - 2);
    let end = Math.min(totalPages - 1, currentPage + 2);
    if (currentPage <= 3) { start = 2; end = 5; }
    if (currentPage >= totalPages - 3) { start = totalPages - 4; end = totalPages - 1; }
    if (start > 2) items.push("ellipsis");
    for (let i = start; i <= end; i++) items.push(i);
    if (end < totalPages - 1) items.push("ellipsis");
    items.push(totalPages);
  }
  return items;
}

interface DataTablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements?: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  className?: string;
}

export function DataTablePagination({
  currentPage,
  totalPages,
  totalElements = 0,
  onPageChange,
  pageSize,
  onPageSizeChange,
  className,
}: DataTablePaginationProps) {
  const showPaginationButtons = totalPages > 1;

  if (!onPageSizeChange && !showPaginationButtons) return null;

  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-1 pt-4 pb-1", className)}>
      <div className="flex items-center gap-3">
        {onPageSizeChange && pageSize !== undefined && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Rows per page</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => onPageSizeChange(Number(v))}
            >
              <SelectTrigger className="h-7 w-[64px] text-xs px-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)} className="text-xs">
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {showPaginationButtons && (
          <div className="text-xs text-muted-foreground">
            Page <span className="font-medium text-foreground">{currentPage}</span> of{" "}
            <span className="font-medium text-foreground">{totalPages}</span>
          </div>
        )}
      </div>

      {showPaginationButtons && <div className="flex items-center gap-1">
        <button
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 px-2.5 flex items-center gap-1 rounded-md border text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed border-border bg-background hover:bg-primary/10 hover:border-primary hover:text-primary"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        <div className="flex items-center gap-0.5">
          {getPaginationItems(currentPage, totalPages).map((item, i) =>
            item === "ellipsis" ? (
              <span key={`e-${i}`} className="px-1.5 text-xs text-muted-foreground">…</span>
            ) : (
              <button
                key={item}
                onClick={() => onPageChange(item)}
                className={cn(
                  "h-8 min-w-[32px] px-2 rounded-md text-xs font-medium transition-all border",
                  currentPage === item
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background border-border hover:bg-primary/10 hover:border-primary hover:text-primary"
                )}
              >
                {item}
              </button>
            )
          )}
        </div>

        <button
          onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 px-2.5 flex items-center gap-1 rounded-md border text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed border-border bg-background hover:bg-primary/10 hover:border-primary hover:text-primary"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>}
    </div>
  );
}
