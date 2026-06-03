import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { AppResource, AppSidebarIcons } from "@/constants/icons/icon";
import { getAccessibleMenuService } from "@/service/menu/menu.service";
import {
  AllMenuModel,
  MenuModel,
  SidebarRoute,
} from "@/model/menu/menu-respond";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarMenu, setSidebarMenu] = useState<AllMenuModel[]>([]);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [transformedRoutes, setTransformedRoutes] = useState<SidebarRoute[]>(
    []
  );

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
                  "w-full justify-start text-gray-900 hover:bg-primary/10 hover:text-primary rounded",
                  isActive &&
                    "bg-primary/15 text-primary font-medium border-l-2 border-primary"
                )}
                onClick={() => route.section && toggleSection(route.section)}
                aria-expanded={isOpen}
              >
                <div className="flex w-full items-center">
                  <img
                    src={route.image}
                    alt={`${route.title} Icon`}
                    className="h-5 w-5"
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
              "w-full justify-start text-gray-900 hover:bg-primary/10 hover:text-primary rounded",
              pathname === route.href &&
                "bg-primary/15 text-primary font-medium border-l-2 border-primary"
            )}
          >
            <Link
              href={route.href || "#"}
              className="flex items-center gap-3 px-3 py-2"
            >
              <img
                src={route.image}
                alt={`${route.title} Icon`}
                className="h-5 w-5"
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
          collapsed ? "w-40" : "w-64"
        )}
      >
        <div className="flex h-16 items-center bg-primary justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-10 w-10">
              <Image
                src={AppResource.Logo}
                alt="KSIT Logo"
                fill
                className="rounded-full object-contain"
                priority
              />
            </div>
            <span className="font-bold text-white text-lg">KSIT</span>
          </Link>
        </div>

        <ScrollArea className="flex-1 px-2 py-4">
          {renderNavItems(collapsed)}
        </ScrollArea>
      </div>
    </>
  );
}
