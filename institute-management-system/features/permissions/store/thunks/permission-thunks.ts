import { createApiThunk } from "@/utils/axios/api-wrapper";
import { axiosClientWithAuth } from "@/utils/axios";
import { MenuModel } from "@/model/menu/menu-respond";
import { UserPermissionModel } from "@/model/permission/permission-response-model";
import { UserPermissionRequest, UpdateUserRoles } from "@/model/permission/permission-request-model";

export const fetchUserMenuThunk = createApiThunk<MenuModel[], number>(
  "permissions/fetchUserMenu",
  async (userId) => {
    const response = await axiosClientWithAuth.get<{ data: MenuModel[] }>(
      `/v1/menus/users/${userId}`
    );
    return response.data.data;
  }
);

export const fetchUserRolesThunk = createApiThunk<UserPermissionModel[], number>(
  "permissions/fetchUserRoles",
  async (userId) => {
    const response = await axiosClientWithAuth.get<{ data: UserPermissionModel[] }>(
      `/v1/staff-teacher-roles/users/${userId}`
    );
    return response.data.data;
  }
);

export const updateUserRolesThunk = createApiThunk<
  UserPermissionModel[],
  { userId: number; data: UpdateUserRoles }
>("permissions/updateRoles", async ({ userId, data }) => {
  const response = await axiosClientWithAuth.put<{ data: UserPermissionModel[] }>(
    `/v1/staff-teacher-roles/users/${userId}/roles`,
    data
  );
  return response.data.data;
});

export const updateUserPermissionsThunk = createApiThunk<
  MenuModel[],
  { userId: number; data: UserPermissionRequest }
>("permissions/updatePermissions", async ({ userId, data }) => {
  await axiosClientWithAuth.put(
    `/v1/menus/users/${userId}/permissions`,
    data
  );
  const response = await axiosClientWithAuth.get<{ data: MenuModel[] }>(
    `/v1/menus/users/${userId}`
  );
  return response.data.data;
});
