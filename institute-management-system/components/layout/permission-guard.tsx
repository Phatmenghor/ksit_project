"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useMenu } from "@/hooks/use-menu";
import { SidebarRoute } from "@/model/menu/menu-respond";
import Loading from "@/components/shared/loading";
import { AccessDenied } from "@/components/shared/access-denied";

// Pages every authenticated user can reach regardless of their menu permissions
// (account-level pages, not feature pages governed by the sidebar).
const ALWAYS_ALLOWED_PREFIXES = ["/profile", "/change-password", "/unauthorized"];

function flattenAccessibleHrefs(routes: SidebarRoute[]): string[] {
  const hrefs: string[] = [];
  for (const route of routes) {
    if (route.href && route.href !== "#") hrefs.push(route.href);
    for (const sub of route.subroutes ?? []) {
      if (sub.href && sub.href !== "#") hrefs.push(sub.href);
    }
  }
  return hrefs;
}

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function isPathAllowed(pathname: string, accessibleHrefs: string[]): boolean {
  if (pathname === "/") return true;
  if (ALWAYS_ALLOWED_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix))) return true;
  return accessibleHrefs.some((href) => matchesPrefix(pathname, href));
}

export function PermissionGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { transformedRoutes, isLoading } = useMenu();

  const accessibleHrefs = useMemo(
    () => flattenAccessibleHrefs(transformedRoutes),
    [transformedRoutes]
  );

  if (isLoading) {
    return <Loading />;
  }

  if (!isPathAllowed(pathname, accessibleHrefs)) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
