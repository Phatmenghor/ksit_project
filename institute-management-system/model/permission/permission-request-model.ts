export interface UpdateUserRoles {
  roles: string[];
}

export interface UserPermissionRequest {
  menuPermissions: MenuPermission[];
}

interface MenuPermission {
  menuId: number;
  canView: boolean;
}
