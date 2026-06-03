import { deleteCookie, getCookie, setCookie } from "cookies-next";

/**
 * Store userId in a cookie with 30-day expiration (remember me).
 */
export function storeUserIdRemember(userId: number): void {
  if (typeof window === "undefined") return;
  setCookie("auth-userId", userId, { maxAge: 30 * 24 * 60 * 60 });
}

/**
 * Store userId in a session cookie (expires when browser closes).
 */
export function storeUserId(userId: number): void {
  if (typeof window === "undefined") return;
  setCookie("auth-userId", userId);
}

/**
 * Get userId from cookie.
 */
export function getUserId(): string | undefined {
  return getCookie("auth-userId") as string | undefined;
}

/**
 * Remove stored userId.
 */
export function clearUserId(): void {
  deleteCookie("auth-userId");
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth-userId");
  }
}

/**
 * Check if userId exists (i.e., user is considered authenticated).
 */
export function isUserIdStored(): boolean {
  return !!getCookie("auth-userId");
}
