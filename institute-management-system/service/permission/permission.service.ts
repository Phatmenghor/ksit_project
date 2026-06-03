import {
  UpdateUserRoles,
  UserPermissionRequest,
} from "@/model/permission/permission-request-model";
import { axiosClientWithAuth } from "@/utils/axios";

export async function getUserForPermissionService(userId: number) {
  try {
    const response = await axiosClientWithAuth.get(
      `/v1/staff-teacher-roles/users/${userId}`
    );
    return response.data.data;
  } catch (error: any) {
    return null;
  }
}

export async function updateUserRolesService(
  userId: number,
  data: UpdateUserRoles
) {
  try {
    const response = await axiosClientWithAuth.put(
      `/v1/staff-teacher-roles/users/${userId}/roles`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    return null;
  }
}

export async function updateUserPermissionService(
  userId: number,
  data: UserPermissionRequest
) {
  try {
    const response = await axiosClientWithAuth.put(
      `/v1/menus/users/${userId}/permissions`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    return null;
  }
}

export async function getMenuByUserIdService(userId: number) {
  try {
    const response = await axiosClientWithAuth.get(`/v1/menus/users/${userId}`);
    return response.data.data;
  } catch (error: any) {
    return null;
  }
}
