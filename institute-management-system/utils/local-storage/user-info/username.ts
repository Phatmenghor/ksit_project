import { deleteCookie, getCookie, setCookie } from "cookies-next";

/**
 * Store username in a cookie with 30-day expiration (remember me).
 */
export function storeUsernameRemember(username: string): void {
  if (typeof window === "undefined") return;
  setCookie("auth-username", username, { maxAge: 30 * 24 * 60 * 60 });
}

/**
 * Store username in a session cookie.
 */
export function storeUsername(username: string): void {
  if (typeof window === "undefined") return;
  setCookie("auth-username", username);
}

/**
 * Get username from cookie.
 */
export function getUsername(): string | undefined {
  return getCookie("auth-username") as string | undefined;
}

/**
 * Remove stored username.
 */
export function clearUsername(): void {
  deleteCookie("auth-username");
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth-username");
  }
}

/**
 * Check if username is stored.
 */
export function isUsernameStored(): boolean {
  return !!getCookie("auth-username");
}
