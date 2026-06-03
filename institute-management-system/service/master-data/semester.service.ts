import {
  AllSemesterFilterModel,
  CreateSemesterModel,
  UpdateSemesterModel,
} from "@/model/master-data/semester/type-semester-model";
import { axiosClientWithAuth } from "@/utils/axios";

export async function getAllSemesterService(data: AllSemesterFilterModel) {
  try {
    const response = await axiosClientWithAuth.post(`/v1/semesters/all`, data);
    return response.data.data;
  } catch (error: any) {
    return null;
  }
}

export async function createSemesterService(data: CreateSemesterModel) {
  try {
    const response = await axiosClientWithAuth.post(`/v1/semesters`, data);
    return response.data.data;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
}

export async function updateSemesterService(
  semesterId: number,
  data: UpdateSemesterModel
) {
  try {
    const response = await axiosClientWithAuth.post(
      `/v1/semesters/updateSemesterById/${semesterId}`,
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

export async function deletedSemesterService(semesterId?: number) {
  try {
    const response = await axiosClientWithAuth.delete(
      `/v1/semesters/${semesterId}`
    );
    return response.data.data;
  } catch (error: any) {
    return null;
  }
}
