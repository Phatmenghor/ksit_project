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
    <div className="space-y-3">
      <div className={cn("rounded-md border overflow-x-auto bg-white", className)}>
        <table className="text-xs w-full" style={{ tableLayout: "fixed" }}>
          <thead className="bg-muted/50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={thStyle(col)}
                  className={cn(
                    "px-3 py-2.5 text-left font-semibold text-xs text-muted-foreground border-b border-border",
                    col.className
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(SKELETON_ROWS)].map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key} style={thStyle(col)} className="px-3 py-3.5 border-b border-border/50">
                      <div className="h-7 bg-muted animate-pulse rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-8 text-center text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((item, index) => (
                <tr
                  key={getRowKey(item, index)}
                  className={cn(
                    "transition-colors hover:bg-primary/5",
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
                        className={cn("px-3 py-2.5 border-b border-border/50", col.className)}
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
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {showPageSizeSelector && onPageSizeChange && (
              <div className="flex items-center gap-1.5">
                <span>Rows:</span>
                <select
                  value={pageSize}
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
                  className="h-7 rounded border border-input px-1.5 text-xs bg-background hover:border-primary/50 focus:outline-none focus:border-primary"
                >
                  {pageSizeOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}
            {totalElements > 0 && (
              <span>{totalElements.toLocaleString()} total</span>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-7 px-2 flex items-center gap-1 rounded border text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed border-border hover:bg-primary/10 hover:border-primary hover:text-primary"
              >
                <ChevronLeft className="h-3 w-3" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              <div className="flex items-center gap-0.5">
                {getPaginationItems(currentPage, totalPages).map((item, i) =>
                  item === "ellipsis" ? (
                    <span key={`e-${i}`} className="px-1 text-xs text-muted-foreground">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => onPageChange(item)}
                      className={cn(
                        "h-7 min-w-[28px] px-1 rounded text-xs font-medium transition-all border",
                        currentPage === item
                          ? "bg-primary text-white border-primary shadow-sm font-bold"
                          : "border-border hover:bg-primary/10 hover:border-primary hover:text-primary"
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
                className="h-7 px-2 flex items-center gap-1 rounded border text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed border-border hover:bg-primary/10 hover:border-primary hover:text-primary"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
