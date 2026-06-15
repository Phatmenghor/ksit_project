import type { ReactNode, RefCallback } from "react";

export interface PaginatedResult<T> {
  content: T[];
  pageNo: number;
  last: boolean;
}

export interface UseInfiniteComboboxOptions<T> {
  fetcher: (params: { search: string; pageNo: number; pageSize: number }) => Promise<PaginatedResult<T> | null | undefined>;
  enabled?: boolean;
  pageSize?: number;
  debounceMs?: number;
  getId: (item: T) => string | number;
}

export interface UseInfiniteComboboxResult<T> {
  data: T[];
  loading: boolean;
  lastPage: boolean;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  reset: () => void;
  sentinelRef: RefCallback<Element>;
}

export interface AsyncComboboxProps<T> {
  value: T | null;
  onChange: (item: T | null) => void;
  controller: UseInfiniteComboboxResult<T>;
  getId: (item: T) => string | number;
  getLabel: (item: T) => string;
  renderItem?: (item: T) => ReactNode;
  isItemSelected?: (item: T, value: T | null) => boolean;
  label?: string;
  required?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}
