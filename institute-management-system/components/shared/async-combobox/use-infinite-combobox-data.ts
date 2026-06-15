"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useDebounce } from "@/utils/debounce/debounce";
import type { UseInfiniteComboboxOptions, UseInfiniteComboboxResult } from "./types";

const DEFAULT_PAGE_SIZE = 15;
const DEFAULT_DEBOUNCE_MS = 400;

export function useInfiniteComboboxData<T>(
  options: UseInfiniteComboboxOptions<T>
): UseInfiniteComboboxResult<T> {
  const {
    fetcher,
    enabled = true,
    pageSize = DEFAULT_PAGE_SIZE,
    debounceMs = DEFAULT_DEBOUNCE_MS,
    getId,
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearch = useDebounce(searchTerm, debounceMs);
  const { ref: sentinelRef, inView } = useInView({ threshold: 0.5 });

  const loadingRef = useRef(false);
  const lastPageRef = useRef(false);
  useEffect(() => {
    loadingRef.current = loading;
    lastPageRef.current = lastPage;
  }, [loading, lastPage]);

  const fetcherRef = useRef(fetcher);
  const getIdRef = useRef(getId);
  useEffect(() => {
    fetcherRef.current = fetcher;
    getIdRef.current = getId;
  });

  const dedupe = useCallback((items: T[]): T[] => {
    const seen = new Set<string | number>();
    return items.filter((item) => {
      const id = getIdRef.current(item);
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, []);

  const requestIdRef = useRef(0);

  const fetchPage = useCallback(
    async (search: string, newPage: number) => {
      if (!enabled || loadingRef.current) return;
      if (lastPageRef.current && newPage > 1) return;

      const reqId = ++requestIdRef.current;
      setLoading(true);

      try {
        const result = await fetcherRef.current({ search, pageNo: newPage, pageSize });
        if (reqId !== requestIdRef.current || !result) return;

        if (newPage === 1) {
          setData(dedupe(result.content));
        } else {
          setData((prev) => dedupe([...prev, ...result.content]));
        }
        setPage(result.pageNo);
        setLastPage(result.last);
      } catch {
        // swallow
      } finally {
        if (reqId === requestIdRef.current) setLoading(false);
      }
    },
    [enabled, pageSize, dedupe]
  );

  useEffect(() => {
    setPage(1);
    setLastPage(false);
    setData([]);
    if (enabled) fetchPage(debouncedSearch, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, enabled]);

  useEffect(() => {
    if (inView && enabled && !loadingRef.current && !lastPageRef.current && data.length > 0) {
      fetchPage(debouncedSearch, page + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, page, data.length, enabled]);

  const reset = useCallback(() => {
    setSearchTerm("");
    setPage(1);
    setLastPage(false);
    setData([]);
  }, []);

  return { data, loading, lastPage, searchTerm, setSearchTerm, reset, sentinelRef };
}
