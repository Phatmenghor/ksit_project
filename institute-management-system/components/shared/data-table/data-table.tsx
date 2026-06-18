"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { DataTablePagination } from "./data-table-pagination";

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
  pageSize = 30,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 30, 50, 100],
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
          {showPageSizeSelector && onPageSizeChange && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
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

          <DataTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            className="px-0 pt-0 pb-0 flex-1"
          />
        </div>
      )}
    </div>
  );
}
