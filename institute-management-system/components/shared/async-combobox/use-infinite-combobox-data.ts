"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useDebounce } from "@/utils/debounce/debounce";
import type { UseInfiniteComboboxOptions, UseInfiniteComboboxResult } from "./types";
import { useAppDispatch, useAppSelector } from "@/store";
import { setEntry, appendEntry, clearEntry } from "@/store/slices/combobox-cache-slice";

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
    cacheKey,
  } = options;

  const dispatch = useAppDispatch();
  const cached = useAppSelector((state: { comboboxCache: { entries: Record<string, { data: T[]; page: number; lastPage: boolean; search: string }> } }) =>
    cacheKey ? state.comboboxCache.entries[cacheKey] : undefined
  );

  // Local state (used when no cacheKey, or as working copy during active session)
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

        const deduped = dedupe(result.content);

        if (newPage === 1) {
          setData(deduped);
          if (cacheKey) {
            dispatch(setEntry({ key: cacheKey, entry: { data: deduped, page: result.pageNo, lastPage: result.last, search } }));
          }
        } else {
          setData((prev: T[]) => {
            const next = dedupe([...prev, ...deduped]);
            if (cacheKey) {
              dispatch(appendEntry({ key: cacheKey, data: deduped, page: result.pageNo, lastPage: result.last }));
            }
            return next;
          });
        }
        setPage(result.pageNo);
        setLastPage(result.last);
      } catch {
        // swallow
      } finally {
        if (reqId === requestIdRef.current) setLoading(false);
      }
    },
    [enabled, pageSize, dedupe, cacheKey, dispatch]
  );

  // Hydrate local state from Redux cache when combobox opens (enabled switches true)
  const prevEnabledRef = useRef(false);
  useEffect(() => {
    const justOpened = enabled && !prevEnabledRef.current;
    prevEnabledRef.current = enabled;

    if (!enabled) return;

    if (justOpened && cacheKey && cached && cached.search === debouncedSearch) {
      // Restore from cache — no fetch needed
      setData(cached.data as T[]);
      setPage(cached.page);
      setLastPage(cached.lastPage);
      return;
    }

    // No cache or search changed: start fresh
    setPage(1);
    setLastPage(false);
    setData([]);
    fetchPage(debouncedSearch, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // Refetch when search changes (clear cache for this key too)
  const prevSearchRef = useRef(debouncedSearch);
  useEffect(() => {
    if (prevSearchRef.current === debouncedSearch) return;
    prevSearchRef.current = debouncedSearch;

    if (cacheKey) dispatch(clearEntry(cacheKey));

    if (!enabled) return;
    setPage(1);
    setLastPage(false);
    setData([]);
    fetchPage(debouncedSearch, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

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
    if (cacheKey) dispatch(clearEntry(cacheKey));
  }, [cacheKey, dispatch]);

  return { data, loading, lastPage, searchTerm, setSearchTerm, reset, sentinelRef };
}
