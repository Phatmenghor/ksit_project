import {
  HistoryReqFilterModel,
  RequestFilterModel,
} from "@/model/request/request-filter";
import {
  CreateRequestModel,
  UpdateRequestModel,
} from "@/model/request/request-model";
import { axiosClientWithAuth } from "@/utils/axios";

export async function getAllRequestService(data: RequestFilterModel) {
  try {
    const response = await axiosClientWithAuth.post(`/v1/requests/all`, data);
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching requests:", error);
    return null;
  }
}

export async function getDetailRequestService(id: string) {
  try {
    const response = await axiosClientWithAuth.get(`/v1/requests/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching request detail:", error);
    return null;
  }
}

export async function createRequestService(data: CreateRequestModel) {
  try {
    const response = await axiosClientWithAuth.post(`/v1/requests`, data);
    return response.data.data;
  } catch (error: any) {
    // Extract error message from response if available
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error creating request:", error);
    throw error;
  }
}

export async function updateRequestService(
  id: number,
  data: UpdateRequestModel
) {
  try {
    const response = await axiosClientWithAuth.put(`/v1/requests/${id}`, data);
    return response.data.data;
  } catch (error: any) {
    // Extract error message from response if available
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error updating request:", error);
    throw error;
  }
}

// History
export async function getAllHistoryReqService(data: HistoryReqFilterModel) {
  try {
    const response = await axiosClientWithAuth.post(
      `/v1/requests/history`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching history requests:", error);
    return null;
  }
}

// transcript
export async function getDetailRequestTranscriptService(studentId: number) {
  try {
    const response = await axiosClientWithAuth.get(
      `/v1/transcript/student/${studentId}`
    );
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching transcript detail:", error);
    return null;
  }
}
