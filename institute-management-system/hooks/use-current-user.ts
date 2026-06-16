"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  subscribeUser,
  getCurrentUser,
  loadUser,
} from "@/utils/stores/user-store";

export function useCurrentUser() {
  // Trigger a single shared fetch on first use — subsequent calls are no-ops
  useEffect(() => {
    loadUser();
  }, []);

  return useSyncExternalStore(subscribeUser, getCurrentUser, () => undefined);
}
