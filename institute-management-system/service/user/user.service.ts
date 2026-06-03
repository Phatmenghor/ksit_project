import { axiosClientWithAuth } from "@/utils/axios";
import {
  AddStaffModel,
  EditStaffModel,
  StaffListRequest,
} from "@/model/user/staff/staff.request.model";

export async function getAllStaffService(data: StaffListRequest) {
  try {
    const response = await axiosClientWithAuth.post(`/v1/staff/all`, data);
    return response.data.data;
  } catch (error: any) {
    if (error.response?.data?.message) throw new Error(error.response.data.message);
    throw error;
  }
}

export async function getStaffByIdService(id: string) {
  try {
    const response = await axiosClientWithAuth.get(`/v1/staff/${id}`);
    return response.data.data;
  } catch (error: any) {
    if (error.response?.data?.message) throw new Error(error.response.data.message);
    throw error;
  }
}

export async function getStaffByTokenService() {
  try {
    const response = await axiosClientWithAuth.post(`/v1/auth/staff/token`);
    return response.data.data;
  } catch (error: any) {
    if (error.response?.data?.message) throw new Error(error.response.data.message);
    throw error;
  }
}

export async function getStudentByTokenService() {
  try {
    const response = await axiosClientWithAuth.post(`/v1/auth/student/token`);
    return response.data.data;
  } catch (error: any) {
    if (error.response?.data?.message) throw new Error(error.response.data.message);
    throw error;
  }
}

export async function addStaffService(data: AddStaffModel) {
  try {
    const response = await axiosClientWithAuth.post(`/v1/staff/register`, data);
    return response.data.data;
  } catch (error: any) {
    if (error.response?.data?.message) throw new Error(error.response.data.message);
    throw error;
  }
}

export async function updateStaffService(staffId: number, data: EditStaffModel) {
  try {
    const response = await axiosClientWithAuth.put(`/v1/staff/${staffId}`, data);
    return response.data.data;
  } catch (error: any) {
    if (error.response?.data?.message) throw new Error(error.response.data.message);
    throw error;
  }
}

export async function deletedStaffService(id: number) {
  try {
    const response = await axiosClientWithAuth.delete(`/v1/staff/${id}`);
    return response.data.data;
  } catch (error: any) {
    if (error.response?.data?.message) throw new Error(error.response.data.message);
    throw error;
  }
}
