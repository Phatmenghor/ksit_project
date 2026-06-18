import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export const PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100];
export const DEFAULT_PAGE_SIZE = 30;

interface UsePaginationOptions {
  baseRoute: string;
  defaultPageSize?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

interface UsePaginationReturn {
  currentPage: number;
  currentPageSize: number;
  updateUrlWithPage: (newPage: number, replace?: boolean) => void;
  handlePageChange: (newPage: number) => void;
  handlePageSizeChange: (newSize: number) => void;
  getDisplayIndex: (index: number, pageSize?: number) => number;
}

export function usePagination({
  baseRoute,
  defaultPageSize = DEFAULT_PAGE_SIZE,
  totalPages,
  onPageChange,
}: UsePaginationOptions): UsePaginationReturn {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentPage = useMemo(() => {
    const pageParam = searchParams.get("pageNo");
    const parsed = pageParam ? parseInt(pageParam, 10) : 1;
    return isNaN(parsed) || parsed < 1 ? 1 : parsed;
  }, [searchParams]);

  const currentPageSize = useMemo(() => {
    const sizeParam = searchParams.get("pageSize");
    const parsed = sizeParam ? parseInt(sizeParam, 10) : defaultPageSize;
    return PAGE_SIZE_OPTIONS.includes(parsed) ? parsed : defaultPageSize;
  }, [searchParams, defaultPageSize]);

  const updateUrlWithPage = useCallback(
    (newPage: number, replace: boolean = false) => {
      const params = new URLSearchParams(searchParams);
      params.set("pageNo", newPage.toString());
      const url = `${baseRoute}?${params.toString()}`;
      if (replace) {
        router.replace(url);
      } else {
        router.push(url);
      }
    },
    [searchParams, router, baseRoute]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (totalPages) {
        if (newPage < 1 || newPage > totalPages) return;
      } else {
        if (newPage < 1) return;
      }
      if (newPage === currentPage) return;
      updateUrlWithPage(newPage);
      if (onPageChange) onPageChange(newPage);
    },
    [currentPage, updateUrlWithPage, onPageChange, totalPages]
  );

  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      if (newSize === currentPageSize) return;
      const params = new URLSearchParams(searchParams);
      params.set("pageSize", newSize.toString());
      params.set("pageNo", "1");
      router.push(`${baseRoute}?${params.toString()}`);
    },
    [currentPageSize, searchParams, router, baseRoute]
  );

  const getDisplayIndex = useCallback(
    (index: number, pageSize: number = currentPageSize) => {
      return (currentPage - 1) * pageSize + index + 1;
    },
    [currentPage, currentPageSize]
  );

  return {
    currentPage,
    currentPageSize,
    updateUrlWithPage,
    handlePageChange,
    handlePageSizeChange,
    getDisplayIndex,
  };
}
