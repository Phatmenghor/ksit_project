"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, ChevronRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { AppResource } from "@/constants/icons/icon";
import { useMenu } from "@/hooks/use-menu";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const { transformedRoutes } = useMenu();

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const renderSkeletonItems = (isCollapsed = false) => (
    <nav className="flex flex-col gap-1 px-2">
      {[...Array(7)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg h-9">
          <div className="h-5 w-5 rounded bg-gray-200 animate-pulse flex-shrink-0" />
          {!isCollapsed && (
            <div
              className="h-4 rounded bg-gray-200 animate-pulse"
              style={{ width: `${50 + (i % 4) * 15}%` }}
            />
          )}
        </div>
      ))}
    </nav>
  );

  const renderNavItems = (isCollapsed = false) => (
    <nav className="flex flex-col gap-0.5">
      {transformedRoutes.map((route) => {
        const isActive = route.href ? pathname === route.href : false;

        if (route.subroutes) {
          const isOpen = route.section ? openSections[route.section] : false;
          const isChildActive = route.subroutes.some((s) => pathname === s.href);

          return (
            <div key={route.title} className="w-full">
              {/* Parent section button */}
              <div className="relative">
                {/* Left active bar — shown when any child is active */}
                {isChildActive && !isCollapsed && (
                  <span className="absolute left-0 top-1 bottom-1 w-[3px] bg-primary rounded-r-full z-10" />
                )}
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full text-gray-600 hover:bg-primary/10 hover:text-primary rounded-lg h-10",
                    isCollapsed ? "justify-center px-0" : "justify-start px-3",
                    isChildActive && "bg-primary/10 text-primary font-medium"
                  )}
                  onClick={() => route.section && toggleSection(route.section)}
                  aria-expanded={isOpen}
                  title={isCollapsed ? route.title : undefined}
                >
                  <div className={cn("flex w-full items-center gap-3", isCollapsed && "justify-center")}>
                    <img
                      src={route.image}
                      alt={`${route.title} Icon`}
                      className={cn("h-5 w-5 flex-shrink-0", isChildActive && "icon-active")}
                    />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left text-sm">{route.title}</span>
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 flex-shrink-0" />
                        )}
                      </>
                    )}
                  </div>
                </Button>
              </div>

              {/* Subroutes */}
              {!isCollapsed && isOpen && (
                <div className="relative ml-5 mt-0.5 mb-1 space-y-0.5">
                  {/* Vertical connector line */}
                  <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-200" />

                  {route.subroutes.map((subroute) => {
                    const isSubActive = pathname === subroute.href;
                    return (
                      <div key={subroute.title} className="relative pl-5">
                        {/* Horizontal connector tick */}
                        <div className="absolute left-2 top-1/2 w-3 h-px bg-gray-200" />

                        {/* Left active bar for subroute */}
                        {isSubActive && (
                          <span className="absolute left-4 top-1 bottom-1 w-[3px] bg-primary rounded-r-full z-10" />
                        )}

                        <Button
                          variant="ghost"
                          asChild
                          className={cn(
                            "w-full justify-start text-gray-600 hover:bg-primary/10 hover:text-primary rounded-lg h-9 text-sm px-3",
                            isSubActive && "bg-primary/10 text-primary font-medium"
                          )}
                        >
                          <Link href={subroute.href}>
                            {subroute.title}
                          </Link>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }

        return (
          <div key={route.title} className="relative">
            {/* Left active bar for top-level items */}
            {isActive && (
              <span className="absolute left-0 top-1 bottom-1 w-[3px] bg-primary rounded-r-full z-10" />
            )}
            <Button
              variant="ghost"
              asChild
              className={cn(
                "w-full text-gray-600 hover:bg-primary/10 hover:text-primary rounded-lg h-10",
                isCollapsed ? "justify-center px-0" : "justify-start px-3",
                isActive && "bg-primary/10 text-primary font-medium"
              )}
              title={isCollapsed ? route.title : undefined}
            >
              <Link
                href={route.href || "#"}
                className={cn(
                  "flex items-center gap-3",
                  isCollapsed && "justify-center"
                )}
              >
                <img
                  src={route.image}
                  alt={`${route.title} Icon`}
                  className={cn("h-5 w-5 flex-shrink-0", isActive && "icon-active")}
                />
                {!isCollapsed && <span className="text-sm">{route.title}</span>}
              </Link>
            </Button>
          </div>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden md:flex shadow-xl h-full flex-col z-50 text-gray-900 transition-all duration-300",
          collapsed ? "w-14" : "w-64"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center bg-primary justify-between px-3 flex-shrink-0">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2 min-w-0">
              <div className="relative h-10 w-10 flex-shrink-0">
                <Image
                  src={AppResource.Logo}
                  alt="KSIT Logo"
                  fill
                  className="rounded-full object-contain"
                  priority
                />
              </div>
              <span className="font-bold text-white text-lg truncate">KSIT</span>
            </Link>
          )}
          {collapsed && (
            <Link href="/" className="flex items-center justify-center w-full">
              <div className="relative h-8 w-8">
                <Image
                  src={AppResource.Logo}
                  alt="KSIT Logo"
                  fill
                  className="rounded-full object-contain"
                  priority
                />
              </div>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed((c) => !c)}
            className="text-white hover:bg-white/10 flex-shrink-0 h-8 w-8"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>

        <ScrollArea className="flex-1 py-3 px-2">
          {transformedRoutes.length === 0
            ? renderSkeletonItems(collapsed)
            : renderNavItems(collapsed)}
        </ScrollArea>
      </div>
    </>
  );
}
