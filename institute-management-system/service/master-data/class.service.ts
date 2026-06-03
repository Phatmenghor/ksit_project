import {
  AllClassFilterModel,
  CreateClassModel,
  UpdateClassModel,
} from "@/model/master-data/class/type-class-model";

import { axiosClientWithAuth } from "@/utils/axios";

export async function getAllClassService(data: AllClassFilterModel) {
  try {
    const response = await axiosClientWithAuth.post(`/v1/classes/all`, data);
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching all class:", error);
    return null;
  }
}

export async function getMyClassService(data: AllClassFilterModel) {
  try {
    const response = await axiosClientWithAuth.post(
      `/v1/classes/my-classes`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching all class:", error);
    return null;
  }
}

export async function createClassService(data: CreateClassModel) {
  try {
    const response = await axiosClientWithAuth.post(`/v1/classes`, data);
    return response.data.data;
  } catch (error: any) {
    // Extract error message from response if available
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error creating class:", error);
    throw error;
  }
}

export async function updateClassService(
  classId: number,
  data: UpdateClassModel
) {
  try {
    const response = await axiosClientWithAuth.post(
      `/v1/classes/updateById/${classId}`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    // Extract error message from response if available
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }

    console.error("Error updating class:", error);
    throw error;
  }
}

export async function deleteClassService(classId: number) {
  try {
    const response = await axiosClientWithAuth.delete(`/v1/classes/${classId}`);
    return response.data.data;
  } catch (error: any) {
    return null;
  }
}

export async function getClassByIdService(classId: number) {
  try {
    const response = await axiosClientWithAuth.get(`/v1/classes/${classId}`);
    console.log("#", response.data.data);
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching get class by id:", error);
    return null;
  }
}
