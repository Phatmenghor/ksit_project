export interface AllMenuModel {
  id: number;
  code: string;
  title: string;
  route?: string;
  icon: string;
  displayOrder: number;
  isParent: boolean;
  parentId: any;
  parentTitle: any;
  canView: boolean;
  isCustomized: boolean;
  children?: MenuModel[];
  createdAt: string;
}

export interface MenuModel {
  id: number;
  code: string;
  title: string;
  route: string;
  icon: any;
  displayOrder: number;
  isParent: boolean;
  parentId: number;
  parentTitle: string;
  canView: boolean;
  isCustomized: boolean;
  children: any;
  createdAt: string;
}

export interface SidebarRoute {
  title: string;
  href?: string;
  image: string;
  section?: string;
  subroutes?: { title: string; href: string }[];
}
