import { RootState } from "@/store";

export const selectPermissionMenuData = (state: RootState) => state.permissionsData.menuData;
export const selectPermissionUserRoles = (state: RootState) => state.permissionsData.userRoles;
export const selectPermissionIsLoadingMenu = (state: RootState) => state.permissionsData.isLoadingMenu;
export const selectPermissionIsLoadingRoles = (state: RootState) => state.permissionsData.isLoadingRoles;
export const selectPermissionIsUpdatingRoles = (state: RootState) => state.permissionsData.isUpdatingRoles;
export const selectPermissionIsUpdatingPermissions = (state: RootState) => state.permissionsData.isUpdatingPermissions;
export const selectPermissionError = (state: RootState) => state.permissionsData.error;
