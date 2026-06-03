"use client";

import { useState, useEffect } from "react";
import { X, ChevronDown, ChevronUp, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import {
  AllMenuModel,
  MenuModel,
  SidebarRoute,
} from "@/model/menu/menu-respond";
import { AppSidebarIcons } from "@/constants/icons/icon";
import { getAccessibleMenuService } from "@/service/menu/menu.service";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarMenu, setSidebarMenu] = useState<AllMenuModel[]>([]);
  const [transformedRoutes, setTransformedRoutes] = useState<SidebarRoute[]>(
    []
  );
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    masterData: false, // Default expanded section
  });

  // Default fallback icon as base64 SVG
  const defaultIcon =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjNjY2NjY2Ii8+Cjwvc3ZnPgo=";

  // Map API icon codes to your existing sidebar icons
  const getIconFromCode = (code: string, title: string): string => {
    const iconMapping: Record<string, string> = {
      // Map by code
      dashboard: AppSidebarIcons.Home,
      "master-data": AppSidebarIcons.Master_Data,
      users: AppSidebarIcons.Users,
      students: AppSidebarIcons.Students,
      attendance: AppSidebarIcons.Attendance,
      courses: AppSidebarIcons.Courses,
      "student-scores": AppSidebarIcons.Student_Scores,
      "scores-submitted": AppSidebarIcons.Scores_Submitted,
      request: AppSidebarIcons.Request,
      schedule: AppSidebarIcons.Schedule,
      "manage-schedule": AppSidebarIcons.Manage_Schedule,
      payment: AppSidebarIcons.Payment,
      survey: AppSidebarIcons.Survey,
      "role-permission": AppSidebarIcons.Role_Permission,
      permissions: AppSidebarIcons.Role_Permission,
    };

    // Try to match by code first
    if (iconMapping[code.toLowerCase()]) {
      return iconMapping[code.toLowerCase()];
    }

    // Try to match by title if code doesn't match
    const titleMapping: Record<string, string> = {
      dashboard: AppSidebarIcons.Home,
      "master data": AppSidebarIcons.Master_Data,
      users: AppSidebarIcons.Users,
      students: AppSidebarIcons.Students,
      attendance: AppSidebarIcons.Attendance,
      courses: AppSidebarIcons.Courses,
      "student score": AppSidebarIcons.Student_Scores,
      "student scores": AppSidebarIcons.Student_Scores,
      "score submitted": AppSidebarIcons.Scores_Submitted,
      "scores submitted": AppSidebarIcons.Scores_Submitted,
      request: AppSidebarIcons.Request,
      schedule: AppSidebarIcons.Schedule,
      "manage schedule": AppSidebarIcons.Manage_Schedule,
      payment: AppSidebarIcons.Payment,
      survey: AppSidebarIcons.Survey,
      "role&user permission": AppSidebarIcons.Role_Permission,
      permissions: AppSidebarIcons.Role_Permission,
    };

    return titleMapping[title.toLowerCase()] || defaultIcon;
  };

  const fetchMenu = async () => {
    try {
      const response = await getAccessibleMenuService();
      // Assuming the service returns the data array directly
      // If it returns the full Root object, use response.data instead
      const menuData = Array.isArray(response) ? response : response.data;
      setSidebarMenu(menuData);

      // Transform API response to sidebar routes format
      const routes = transformMenuToRoutes(menuData);
      setTransformedRoutes(routes);

      // Initialize open sections state for parent menus
      const initialOpenSections: Record<string, boolean> = {};
      routes.forEach((route) => {
        if (route.section) {
          initialOpenSections[route.section] = false;
        }
      });
      setOpenSections(initialOpenSections);
    } catch (error) {
      console.log("fail to fetch menu: ", error);
    }
  };

  // Transform API menu data to sidebar routes format
  const transformMenuToRoutes = (menuData: AllMenuModel[]): SidebarRoute[] => {
    const routes: SidebarRoute[] = [];

    menuData.forEach((menu: AllMenuModel) => {
      // Only show menus that user can view
      if (!menu.canView) return;

      const route: SidebarRoute = {
        title: menu.title,
        image: getIconFromCode(menu.code, menu.title),
      };

      // Check if this menu has children
      if (menu.children && menu.children.length > 0) {
        route.section = menu.code; // Use code as section identifier
        route.subroutes = menu.children
          .filter((child: MenuModel) => child.canView) // Only show accessible children
          .sort((a, b) => a.displayOrder - b.displayOrder) // Sort children by display order
          .map((child: MenuModel) => ({
            title: child.title,
            href: child.route || "#",
          }));
      } else {
        // No children, direct route
        route.href = menu.route || "#";
      }

      routes.push(route);
    });

    // Sort by display order
    return routes.sort((a, b) => {
      const aMenu = menuData.find((m) => m.title === a.title);
      const bMenu = menuData.find((m) => m.title === b.title);
      return (aMenu?.displayOrder || 0) - (bMenu?.displayOrder || 0);
    });
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  useEffect(() => {
    // Prevent body scrolling when sidebar is open
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col h-screen w-70 overflow-hidden">
      <div
        className={`relative flex flex-col h-full bg-white transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-4">
            <Menu className="h-5 w-5 stroke-[2.5]" />
            <span className="font-semibold text-xl">Menu</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="stroke-[2.5]" />
          </Button>
        </div>

        <Separator className="mx-4 w-[calc(100%-2rem)] bg-gray-300" />

        {/* Scrollable content */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {transformedRoutes.map((route) => {
              const isActive = route.href
                ? pathname === route.href
                : route.subroutes?.some((sub) => pathname === sub.href);

              const isOpen = route.section
                ? openSections[route.section as keyof typeof openSections]
                : false;

              return (
                <div key={route.title} className="mb-1">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-gray-900 hover:bg-primary/10 hover:text-primary rounded",
                      isActive &&
                        "bg-primary/15 text-primary font-medium border-l-2 border-primary"
                    )}
                    onClick={() => {
                      if (route.subroutes) {
                        route.section &&
                          toggleSection(
                            route.section as keyof typeof openSections
                          );
                      } else if (route.href) {
                        router.push(route.href);
                        onClose();
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={route.image}
                        alt={`${route.title} Icon`}
                        className="h-5 w-5"
                      />{" "}
                      <span>{route.title}</span>
                    </div>
                    {route.subroutes && (
                      <div>
                        {isOpen ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    )}
                  </Button>

                  {route.subroutes && isOpen && (
                    <div className="ml-10 mt-1 space-y-1 border-l pl-2 border-gray-200">
                      {route.subroutes.map((subroute) => (
                        <Button
                          key={subroute.title}
                          variant="ghost"
                          asChild
                          className={cn(
                            "w-full justify-start text-gray-900 hover:bg-gray-100 rounded py-2",
                            pathname === subroute.href &&
                              "bg-gray-100 font-medium"
                          )}
                        >
                          <Link
                            href={{
                              pathname:
                                typeof subroute.href === "string"
                                  ? subroute.href
                                  : "",
                            }}
                            onClick={onClose}
                          >
                            <span>{subroute.title}</span>
                          </Link>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
