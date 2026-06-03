import {
  AllDepartmentFilterModel,
  CreateDepartmentModel,
  UpdateDepartmentModel,
} from "@/model/master-data/department/type-department-model";
import { axiosClientWithAuth } from "@/utils/axios";

export async function getAllDepartmentService(data: AllDepartmentFilterModel) {
  try {
    const response = await axiosClientWithAuth.post(
      `/v1/departments/all`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    return null;
  }
}

export async function getDepartmentByIdService(id: number) {
  try {
    const response = await axiosClientWithAuth.get(`/v1/departments/${id}`);
    return response.data.data;
  } catch (error: any) {
    return null;
  }
}

export async function createDepartmentService(data: CreateDepartmentModel) {
  try {
    const response = await axiosClientWithAuth.post(`/v1/departments`, data);
    return response.data.data;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
}

export async function updateDepartmentService(
  departmentId: number,
  data: UpdateDepartmentModel
) {
  try {
    const response = await axiosClientWithAuth.post(
      `/v1/departments/updateById/${departmentId}`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }

    throw error;
  }
}

export async function deletedDepartmentService(departmentId: number) {
  try {
    const response = await axiosClientWithAuth.delete(
      `/v1/departments/${departmentId}`
    );
    return response.data.data;
  } catch (error: any) {
    return null;
  }
}

export async function getMyDepartmentService(data: AllDepartmentFilterModel) {
  try {
    const response = await axiosClientWithAuth.post(
      `/v1/departments/my-departments`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    return null;
  }
}
