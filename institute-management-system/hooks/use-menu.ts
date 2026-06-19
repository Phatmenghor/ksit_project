"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  subscribeMenu,
  getMenuRoutes,
  isMenuLoaded,
  loadMenu,
} from "@/utils/stores/menu-store";
import { SidebarRoute } from "@/model/menu/menu-respond";

const EMPTY_ROUTES: SidebarRoute[] = [];

export function useMenu() {
  useEffect(() => {
    loadMenu();
  }, []);

  const transformedRoutes = useSyncExternalStore(
    subscribeMenu,
    getMenuRoutes,
    () => EMPTY_ROUTES
  );

  const isLoaded = useSyncExternalStore(
    subscribeMenu,
    isMenuLoaded,
    () => false
  );

  return { transformedRoutes, isLoading: !isLoaded };
}
