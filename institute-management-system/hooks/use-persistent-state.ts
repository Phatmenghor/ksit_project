"use client";

import { useState, useEffect, Dispatch, SetStateAction } from "react";

/**
 * Like useState, but the value is kept in a module-level store (a singleton
 * that survives client-side navigation) keyed by `key`. Returning to a page
 * restores the last value instead of resetting to `initial`.
 *
 * Use for page-local filters that should persist across navigation without a
 * dedicated Redux slice (e.g. the class-list major/search filters).
 */
const store = new Map<string, unknown>();

export function usePersistentState<T>(
  key: string,
  initial: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() =>
    store.has(key) ? (store.get(key) as T) : initial,
  );

  useEffect(() => {
    store.set(key, value);
  }, [key, value]);

  return [value, setValue];
}
