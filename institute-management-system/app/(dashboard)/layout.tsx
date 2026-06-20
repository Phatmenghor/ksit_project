"use client";
import type React from "react";
import { useRef } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { PermissionGuard } from "@/components/layout/permission-guard";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const mainRef = useRef<HTMLElement>(null);
  useScrollRestoration(mainRef);

  return (
    <div className="flex w-full h-screen overflow-hidden">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />

        <main ref={mainRef} className="flex-1 overflow-y-auto bg-muted/40 p-2 sm:p-4">
          <PermissionGuard>{children}</PermissionGuard>
          <footer className="mt-6 py-4 px-2 border-t border-border/40">
            <p className="text-center text-xs text-muted-foreground/60">
              &copy; 2026 KSIT Institute Management System. All rights reserved.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
