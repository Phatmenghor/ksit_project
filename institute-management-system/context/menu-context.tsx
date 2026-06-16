"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getAccessibleMenuService } from "@/service/menu/menu.service";
import {
  AllMenuModel,
  MenuModel,
  SidebarRoute,
} from "@/model/menu/menu-respond";
import { AppSidebarIcons } from "@/constants/icons/icon";

const defaultIcon =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjNjY2NjY2Ii8+Cjwvc3ZnPgo=";

const iconMapping: Record<string, string> = {
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

function getIconFromCode(code: string, title: string): string {
  return (
    iconMapping[code.toLowerCase()] ||
    titleMapping[title.toLowerCase()] ||
    defaultIcon
  );
}

function transformMenuToRoutes(menuData: AllMenuModel[]): SidebarRoute[] {
  const routes: SidebarRoute[] = menuData
    .filter((menu) => menu.canView)
    .map((menu) => {
      const route: SidebarRoute = {
        title: menu.title,
        image: getIconFromCode(menu.code, menu.title),
      };

      if (menu.children && menu.children.length > 0) {
        route.section = menu.code;
        route.subroutes = menu.children
          .filter((child: MenuModel) => child.canView)
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((child: MenuModel) => ({
            title: child.title,
            href: child.route || "#",
          }));
      } else {
        route.href = menu.route || "#";
      }

      return route;
    });

  return routes.sort((a, b) => {
    const aMenu = menuData.find((m) => m.title === a.title);
    const bMenu = menuData.find((m) => m.title === b.title);
    return (aMenu?.displayOrder || 0) - (bMenu?.displayOrder || 0);
  });
}

interface MenuContextType {
  transformedRoutes: SidebarRoute[];
}

const MenuContext = createContext<MenuContextType>({ transformedRoutes: [] });

export function MenuProvider({ children }: { children: ReactNode }) {
  const [transformedRoutes, setTransformedRoutes] = useState<SidebarRoute[]>(
    []
  );

  useEffect(() => {
    getAccessibleMenuService()
      .then((response) => {
        const menuData = Array.isArray(response) ? response : response.data;
        setTransformedRoutes(transformMenuToRoutes(menuData));
      })
      .catch(() => {});
  }, []);

  return (
    <MenuContext.Provider value={{ transformedRoutes }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  return useContext(MenuContext);
}
