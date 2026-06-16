"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  subscribeMenu,
  getMenuRoutes,
  loadMenu,
} from "@/utils/stores/menu-store";

export function useMenu() {
  useEffect(() => {
    loadMenu();
  }, []);

  const transformedRoutes = useSyncExternalStore(
    subscribeMenu,
    getMenuRoutes,
    () => []
  );

  return { transformedRoutes };
}
