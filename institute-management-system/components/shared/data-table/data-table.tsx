"use client";

import { ReactNode, useRef } from "react";
import { cn } from "@/lib/utils";
import { DataTablePagination } from "./data-table-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollTable = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -240 : 240, behavior: "smooth" });
  };

  const thStyle = (col: TableColumn<T>) => ({
    ...(col.width && { width: col.width }),
    ...(col.maxWidth && { maxWidth: col.maxWidth }),
    ...(col.minWidth && { minWidth: col.minWidth }),
  });

  return (
    <div className="space-y-0">
      <div className={cn("rounded-md border border-border bg-card", className)}>

        {/* Scroll arrows — sticky, offset matches main's p-2 sm:p-4 so it pins flush under the navbar */}
        <div className="sticky -top-2 sm:-top-4 z-10 flex items-center justify-between px-2 py-1.5 border-b border-border/50 bg-card">
          <button
            type="button"
            onClick={() => scrollTable("left")}
            aria-label="Scroll table left"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-background border border-border shadow-sm hover:bg-muted transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-foreground" />
          </button>
          <button
            type="button"
            onClick={() => scrollTable("right")}
            aria-label="Scroll table right"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-background border border-border shadow-sm hover:bg-muted transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-foreground" />
          </button>
        </div>

        <div ref={scrollRef} className="overflow-x-auto">
          <table className="w-full min-w-max text-sm">
            <thead>
              <tr className="border-b border-border bg-primary/10 shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    style={thStyle(col)}
                    className={cn(
                      "px-4 py-3 text-left text-xs font-semibold text-foreground/75 whitespace-nowrap",
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
                  <td colSpan={columns.length}>
                    <EmptyState message={emptyMessage} />
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

      </div>

      {showPagination && totalPages > 0 && (
        <DataTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          onPageChange={onPageChange}
          pageSize={showPageSizeSelector ? pageSize : undefined}
          onPageSizeChange={showPageSizeSelector ? onPageSizeChange : undefined}
          pageSizeOptions={pageSizeOptions}
        />
      )}
    </div>
  );
}
