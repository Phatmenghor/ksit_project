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
    const response = await axiosClientWithAuth.post(
      `/v1/score/initialize`,
      data
    );
    console.log("##API data: ", response.data.data);
    return response.data.data;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error init all student score:", error); // Log error for debugging
    throw error; // Re-throw the error for further handling
  }
}

export async function updateStudentsScoreService(data: UpdateScoreModel) {
  try {
    const response = await axiosClientWithAuth.put(
      `/v1/score/score-update`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error update student score:", error); // Log error for debugging
    throw error; // Re-throw the error for further handling
  }
}

export async function getAllSubmittedScoreService(data: SubmittedScoreParam) {
  try {
    const response = await axiosClientWithAuth.post(`/v1/score/all`, data);
    return response.data.data;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error get all submitted score:", error); // Log error for debugging
    throw error; // Re-throw the error for further handling
  }
}

export async function submittedScoreService(data: SubmitScoreModel) {
  try {
    const response = await axiosClientWithAuth.put(
      `/v1/score/submission-update`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error submitted score:", error); // Log error for debugging
    throw error; // Re-throw the error for further handling
  }
}

export async function getSubmissionScoreByIdService(id: number) {
  try {
    const response = await axiosClientWithAuth.get(`/v1/score/session/${id}`);
    return response.data.data;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error get submission score by id:", error); // Log error for debugging
    throw error; // Re-throw the error for further handling
  }
}

export async function getConfigurationScoreService() {
  try {
    const response = await axiosClientWithAuth.get(`/v1/score/configuration`);
    return response.data.data;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error get configuration score:", error); // Log error for debugging
    throw error; // Re-throw the error for further handling
  }
}

export async function configureScoreService(config: ConfigureScoreModel) {
  try {
    const response = await axiosClientWithAuth.post(
      `/v1/score/configuration`,
      config
    );
    return response.data.data;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error config configuration score:", error); // Log error for debugging
    throw error; // Re-throw the error for further handling
  }
}
