import { MenuModel } from "@/model/menu/menu-respond";
import { UserPermissionModel } from "@/model/permission/permission-response-model";

export interface PermissionState {
  menuData: MenuModel[];
  userRoles: UserPermissionModel[];
  isLoadingMenu: boolean;
  isLoadingRoles: boolean;
  isUpdatingRoles: boolean;
  isUpdatingPermissions: boolean;
  error: string | null;
}
