import {
  RequestStudentScoreModel,
  SubmitScoreModel,
  UpdateScoreModel,
} from "@/model/score/student-score/student-score.request";
import {
  ConfigureScoreModel,
  SubmittedScoreParam,
} from "@/model/score/submitted-score/submitted-score.request.model";
import { axiosClientWithAuth } from "@/utils/axios";

export async function intiStudentsScoreService(data: RequestStudentScoreModel) {
  try {
    const response = await axiosClientWithAuth.post(`/v1/score/initialize`, data);
    return response.data.data;
  } catch (error: any) {
    if (error.response?.data?.message) throw new Error(error.response.data.message);
    throw error;
  }
}

export async function updateStudentsScoreService(data: UpdateScoreModel) {
  try {
    const response = await axiosClientWithAuth.put(`/v1/score/score-update`, data);
    return response.data.data;
  } catch (error: any) {
    if (error.response?.data?.message) throw new Error(error.response.data.message);
    throw error;
  }
}

export async function getAllSubmittedScoreService(data: SubmittedScoreParam) {
  try {
    const response = await axiosClientWithAuth.post(`/v1/score/all`, data);
    return response.data.data;
  } catch (error: any) {
    if (error.response?.data?.message) throw new Error(error.response.data.message);
    throw error;
  }
}

export async function submittedScoreService(data: SubmitScoreModel) {
  try {
    const response = await axiosClientWithAuth.put(`/v1/score/submission-update`, data);
    return response.data.data;
  } catch (error: any) {
    if (error.response?.data?.message) throw new Error(error.response.data.message);
    throw error;
  }
}

export async function getSubmissionScoreByIdService(id: number) {
  try {
    const response = await axiosClientWithAuth.get(`/v1/score/session/${id}`);
    return response.data.data;
  } catch (error: any) {
    if (error.response?.data?.message) throw new Error(error.response.data.message);
    throw error;
  }
}

export async function getConfigurationScoreService() {
  try {
    const response = await axiosClientWithAuth.get(`/v1/score/configuration`);
    return response.data.data;
  } catch (error: any) {
    if (error.response?.data?.message) throw new Error(error.response.data.message);
    throw error;
  }
}

export async function configureScoreService(config: ConfigureScoreModel) {
  try {
    const response = await axiosClientWithAuth.post(`/v1/score/configuration`, config);
    return response.data.data;
  } catch (error: any) {
    if (error.response?.data?.message) throw new Error(error.response.data.message);
    throw error;
  }
}
