"use client";

import { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TableColumn<T = unknown> {
  key: string;
  label: string;
  className?: string;
  render?: (item: T, index: number) => ReactNode;
  truncate?: boolean;
  width?: string;
  maxWidth?: string;
  minWidth?: string;
}

interface DataTableProps<T = unknown> {
  data: T[] | null;
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (item: T) => void;
  getRowKey?: (item: T, index: number) => string | number;

  currentPage: number;
  totalPages: number;
  totalElements?: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  showPagination?: boolean;
}

const SKELETON_ROWS = 8;

function getPaginationItems(currentPage: number, totalPages: number): (number | "ellipsis")[] {
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

export function DataTable<T = unknown>({
  data,
  columns,
  loading = false,
  emptyMessage = "No data found",
  className = "",
  onRowClick,
  getRowKey = (_, i) => i,
  currentPage,
  totalPages,
  totalElements = 0,
  onPageChange,
  pageSize = 10,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showPageSizeSelector = true,
  showPagination = true,
}: DataTableProps<T>) {
  const rows: T[] = Array.isArray(data) ? data : [];

  const thStyle = (col: TableColumn<T>) => ({
    ...(col.width && { width: col.width }),
    ...(col.maxWidth && { maxWidth: col.maxWidth }),
    ...(col.minWidth && { minWidth: col.minWidth }),
  });

  return (
    <div className="space-y-0">
      <div className={cn("rounded-md border border-border overflow-x-auto bg-card", className)}>
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={thStyle(col)}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap",
                    col.className
                  )}
                >
                  {col.label || (col.key === "actions" ? "Actions" : "")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {loading ? (
              [...Array(SKELETON_ROWS)].map((_, i) => (
                <tr key={i} className="bg-card">
                  {columns.map((col) => (
                    <td key={col.key} style={thStyle(col)} className="px-4 py-3">
                      <div className="h-5 bg-muted animate-pulse rounded-md" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((item, index) => (
                <tr
                  key={getRowKey(item, index)}
                  className={cn(
                    "bg-card transition-colors hover:bg-muted/30",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((col) => {
                    const cell = col.render
                      ? col.render(item, index)
                      : String((item as Record<string, unknown>)[col.key] ?? "—");
                    return (
                      <td
                        key={col.key}
                        style={thStyle(col)}
                        className={cn("px-4 py-3 text-sm text-foreground", col.className)}
                      >
                        <div className={cn("whitespace-nowrap", col.truncate && "overflow-hidden text-ellipsis")}>
                          {cell}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showPagination && totalPages > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-1 pt-4 pb-1">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {totalPages > 1 && (
              <span>
                Page <span className="font-medium text-foreground">{currentPage}</span> of <span className="font-medium text-foreground">{totalPages}</span>
              </span>
            )}
            {showPageSizeSelector && onPageSizeChange && (
              <div className="flex items-center gap-1.5">
                <span>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
                  className="h-8 rounded-md border border-input px-2 text-xs bg-background hover:border-primary/50 focus:outline-none focus:border-primary transition-colors"
                >
                  {pageSizeOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}
