
import { AllMajorFilterModel } from "@/model/master-data/major/type-major-model";
import { AllRoomFilterModel, CreateRoomModel, UpdateRoomModel } from "@/model/master-data/room/type-room-model";
import { AllSubjectFilterModel, CreateSubjectModel, UpdateSubjectModel } from "@/model/master-data/subject/type-subject-mode";
import { axiosClientWithAuth } from "@/utils/axios";

export async function getAllSubjectService(data: AllSubjectFilterModel) {
  try {
    const response = await axiosClientWithAuth.post(
      `/v1/subjects/all`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching all subject:", error);
    return null;
  }
}

export async function createSubjectService(data: CreateSubjectModel) {
  try {
    const response = await axiosClientWithAuth.post(`/v1/subjects`, data);
    return response.data.data;
  } catch (error: any) {
    // Extract error message from response if available
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error creating subject:", error);
    throw error;
  }
}

export async function updateSubjectService(
  subjectId: number,
  data: UpdateSubjectModel
) {
  try {
    const response = await axiosClientWithAuth.post(
      `/v1/subjects/updateById/${subjectId}`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    // Extract error message from response if available
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }

    console.error("Error updating subject:", error);
    throw error;
  }
}

export async function deletedSubjectService(subjectId: number) {
  try {
    const response = await axiosClientWithAuth.delete(
      `/v1/subjects/${subjectId}`
    );
    return response.data.data;
  } catch (error: any) {
    return null;
  }
}
