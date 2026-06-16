"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  subscribeUser,
  getCurrentUser,
  loadUser,
} from "@/utils/stores/user-store";

export function useCurrentUser() {
  useEffect(() => {
    loadUser();
  }, []);

  const user = useSyncExternalStore(subscribeUser, getCurrentUser, () => undefined);

  return { user };
}
