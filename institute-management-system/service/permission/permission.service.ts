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
    console.log("Fetch user permission by userId", response);
    return response.data.data;
  } catch (error: any) {
    console.error("Error get user permission by userId:", error);
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
    console.log("Update user roles by userId", response);
    return response.data.data;
  } catch (error: any) {
    console.error("Error update user roles by userId:", error);
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
    console.log("Update user permissions by userId", response);
    return response.data.data;
  } catch (error: any) {
    console.error("Error update user permissions by userId:", error);
    return null;
  }
}

export async function getMenuByUserIdService(userId: number) {
  try {
    const response = await axiosClientWithAuth.get(`/v1/menus/users/${userId}`);
    console.log("get user menu by userId", response);
    return response.data.data;
  } catch (error: any) {
    console.error("Error get user menu by userId:", error);
    return null;
  }
}
