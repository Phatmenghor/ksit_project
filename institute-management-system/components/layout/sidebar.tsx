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
import { useMenu } from "@/context/menu-context";

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
    <nav className="flex flex-col gap-1">
      {[...Array(7)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-3 py-2 rounded h-9"
        >
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
    <nav className="flex flex-col gap-1">
      {transformedRoutes.map((route) => {
        const isActive = route.href ? pathname === route.href : false;

        if (route.subroutes) {
          const isOpen = route.section ? openSections[route.section] : false;

          return (
            <div key={route.title} className="w-full">
              <Button
                variant="ghost"
                className={cn(
                  "w-full text-gray-900 hover:bg-primary/10 hover:text-primary rounded",
                  isCollapsed ? "justify-center px-0" : "justify-start",
                  isActive &&
                    "bg-primary/15 text-primary font-medium border-l-2 border-primary"
                )}
                onClick={() => route.section && toggleSection(route.section)}
                aria-expanded={isOpen}
                title={isCollapsed ? route.title : undefined}
              >
                <div className={cn("flex w-full items-center", isCollapsed && "justify-center")}>
                  <img
                    src={route.image}
                    alt={`${route.title} Icon`}
                    className="h-5 w-5 flex-shrink-0"
                  />
                  {!isCollapsed && (
                    <>
                      <span className="ml-3">{route.title}</span>
                      <div className="ml-auto">
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    </>
                  )}
                </div>
              </Button>

              {!isCollapsed && isOpen && (
                <div className="relative ml-6 mt-1 space-y-1">
                  {/* Vertical connecting line */}
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300"></div>

                  {route.subroutes.map((subroute, index) => (
                    <div key={subroute.title} className="relative">
                      {/* Horizontal connecting line */}
                      <div className="absolute left-0 top-1/2 w-4 h-px bg-gray-300"></div>

                      {/* Corner connector for last item - stops vertical line */}
                      {index === route.subroutes!.length - 1 && (
                        <div
                          className="absolute left-0 top-1/2 w-px bg-white"
                          style={{ height: "50%" }}
                        ></div>
                      )}

                      <Button
                        variant="ghost"
                        asChild
                        className={cn(
                          "w-full justify-start text-gray-900 hover:bg-primary/10 hover:text-primary pl-6 rounded",
                          pathname === subroute.href &&
                            "bg-primary/15 text-primary font-medium border-l-2 border-primary"
                        )}
                      >
                        <Link
                          href={subroute.href}
                          className="flex items-center gap-2"
                        >
                          <span>{subroute.title}</span>
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        }

        return (
          <Button
            key={route.title}
            variant="ghost"
            asChild
            className={cn(
              "w-full text-gray-900 hover:bg-primary/10 hover:text-primary rounded",
              isCollapsed ? "justify-center px-0" : "justify-start",
              pathname === route.href &&
                "bg-primary/15 text-primary font-medium border-l-2 border-primary"
            )}
            title={isCollapsed ? route.title : undefined}
          >
            <Link
              href={route.href || "#"}
              className={cn("flex items-center gap-3 px-3 py-2", isCollapsed && "justify-center px-2")}
            >
              <img
                src={route.image}
                alt={`${route.title} Icon`}
                className="h-5 w-5 flex-shrink-0"
              />
              {!isCollapsed && <span>{route.title}</span>}
            </Link>
          </Button>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar - Hidden on mobile */}
      <div
        className={cn(
          "hidden md:flex shadow-xl h-full flex-col z-50 text-gray-900 transition-all duration-300",
          collapsed ? "w-14" : "w-64"
        )}
      >
        <div className="flex h-16 items-center bg-primary justify-between px-3">
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

        <ScrollArea className="flex-1 px-2 py-4">
          {transformedRoutes.length === 0
            ? renderSkeletonItems(collapsed)
            : renderNavItems(collapsed)}
        </ScrollArea>
      </div>
    </>
  );
}
