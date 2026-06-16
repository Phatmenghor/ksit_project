"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  subscribeMenu,
  getMenuRoutes,
  loadMenu,
} from "@/utils/stores/menu-store";

export function useMenu() {
  // Trigger a single shared fetch on first use — subsequent calls are no-ops
  useEffect(() => {
    loadMenu();
  }, []);

  // useSyncExternalStore ensures consistent reads across server/client:
  // - server snapshot returns [] so SSR renders skeleton immediately
  // - client subscribes to the store and re-renders when data arrives
  return useSyncExternalStore(subscribeMenu, getMenuRoutes, () => []);
}
