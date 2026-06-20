import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { markListLoaded, invalidateList } from "@/store/slices/list-cache-slice";

/**
 * Runs `fetcher` only when `queryKey` differs from the key last loaded for
 * `cacheId`. The loaded key lives in Redux (a singleton store), so this
 * survives client-side navigation:
 *
 *  - Return to a list with unchanged filters  -> cache hit, NO refetch.
 *  - Change any filter / page (queryKey moves) -> fetch.
 *
 * `fetcher` is read through a ref so callers can pass an inline closure without
 * causing extra runs.
 */
export function useCachedList(
  cacheId: string,
  queryKey: string,
  fetcher: () => void,
) {
  const dispatch = useAppDispatch();
  const loadedKey = useAppSelector((s) => s.listCache.keys[cacheId]);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    if (loadedKey === queryKey) return; // fresh — skip
    dispatch(markListLoaded({ id: cacheId, key: queryKey }));
    fetcherRef.current();
  }, [cacheId, queryKey, loadedKey, dispatch]);
}

/**
 * Drop-in replacement for a data-fetching `useEffect`: same `(effect, deps)`
 * shape, but the effect runs only when `deps` change versus what was last
 * loaded for `cacheId` (persisted in Redux), so returning to the page with the
 * same deps does NOT refetch. `dispatch` in the deps is fine — it's stable.
 */
export function useCachedEffect(
  cacheId: string,
  effect: () => void,
  deps: unknown[],
) {
  useCachedList(cacheId, JSON.stringify(deps), effect);
}

/**
 * Returns a function that marks one or more cached lists stale so they refetch
 * the next time they are shown — call after a create/update/delete.
 */
export function useInvalidateList() {
  const dispatch = useAppDispatch();
  return (...cacheIds: string[]) => {
    cacheIds.forEach((id) => dispatch(invalidateList(id)));
  };
}
