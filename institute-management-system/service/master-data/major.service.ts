import {
  AllMajorFilterModel,
  CreateMajorModel,
  UpdateMajorModel,
} from "@/model/master-data/major/type-major-model";
import { axiosClientWithAuth } from "@/utils/axios";

export async function getAllMajorService(data: AllMajorFilterModel) {
  try {
    const response = await axiosClientWithAuth.post(`/v1/majors/all`, data);
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching all major:", error);
    return null;
  }
}

//NOTED : for replace in /v1/majors/all
export async function getScheduleAllListService(data: AllMajorFilterModel) {
  try {
    const response = await axiosClientWithAuth.post(
      `/v1/schedules/all-list`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching all major:", error);
    return null;
  }
}

export async function createMajorService(data: CreateMajorModel) {
  try {
    const response = await axiosClientWithAuth.post(`/v1/majors`, data);
    return response.data.data;
  } catch (error: any) {
    // Extract error message from response if available
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error creating major:", error);
    throw error;
  }
}

export async function updateMajorService(
  majorId: number,
  data: UpdateMajorModel
) {
  try {
    const response = await axiosClientWithAuth.post(
      `/v1/majors/updateById/${majorId}`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    // Extract error message from response if available
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }

    console.error("Error updating major:", error);
    throw error;
  }
}

export async function deletedMajorService(majorId: number) {
  try {
    const response = await axiosClientWithAuth.delete(`/v1/majors/${majorId}`);
    return response.data.data;
  } catch (error: any) {
    return null;
  }
}
