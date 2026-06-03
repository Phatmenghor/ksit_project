"use client";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import React from "react";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
}

interface CustomTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
}

export function CustomTable<T>({
  data,
  columns,
  isLoading = false,
}: CustomTableProps<T>) {
  return (
    <div
      className="relative overflow-x-auto border border-gray-300 rounded-2xl overflow-hidden"
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "#000000 #d1d5db",
      }}
    >
      <Table className="w-full border-collapse">
        <TableHeader>
          <TableRow className="bg-black text-white">
            {columns.map((col, index) => (
              <TableHead
                key={index}
                className="p-3 border-r border-gray-400 text-white font-medium whitespace-nowrap last:border-r-0"
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow className="border-t border-gray-300 bg-white">
              <TableCell
                colSpan={columns.length}
                className="text-center py-4 p-3"
              >
                Loading...
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow className="border-t border-gray-300 bg-white">
              {columns.map((_, colIndex) => (
                <TableCell
                  key={colIndex}
                  className="text-center text-muted-foreground p-3 border-r border-gray-300 whitespace-nowrap last:border-r-0"
                >
                  ---
                </TableCell>
              ))}
            </TableRow>
          ) : (
            data.map((item, index) => (
              <TableRow
                key={index}
                className="border-t border-gray-300 bg-white hover:bg-gray-50"
              >
                {columns.map((col, colIndex) => (
                  <TableCell
                    key={colIndex}
                    className="p-3 border-r border-gray-300 whitespace-nowrap last:border-r-0"
                  >
                    {col.render
                      ? col.render(item, index)
                      : (item as any)[col.key] || "---"}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
