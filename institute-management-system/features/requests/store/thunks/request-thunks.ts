import { createApiThunk } from "@/utils/axios/api-wrapper";
import { axiosClientWithAuth } from "@/utils/axios";
import { AllRequestModel, CreateRequestModel, RequestModel, UpdateRequestModel, AllHistoryReqModel } from "@/model/request/request-model";
import { RequestFilterModel, HistoryReqFilterModel } from "@/model/request/request-filter";
import { TranscriptModel } from "@/model/request/request-transcript";

export const fetchAllRequestsService = createApiThunk<
  AllRequestModel,
  RequestFilterModel
>("requests/fetchAll", async (params) => {
  const response = await axiosClientWithAuth.post<{ data: AllRequestModel }>(
    "/v1/requests/all",
    params
  );
  return response.data.data;
});

export const createRequestThunk = createApiThunk<RequestModel, CreateRequestModel>(
  "requests/create",
  async (data) => {
    const response = await axiosClientWithAuth.post<{ data: RequestModel }>(
      "/v1/requests",
      data
    );
    return response.data.data;
  }
);

export const fetchRequestByIdThunk = createApiThunk<RequestModel, string>(
  "requests/fetchById",
  async (id) => {
    const response = await axiosClientWithAuth.get<{ data: RequestModel }>(
      `/v1/requests/${id}`
    );
    return response.data.data;
  }
);

export const updateRequestThunk = createApiThunk<
  RequestModel,
  { id: number; data: UpdateRequestModel }
>("requests/update", async ({ id, data }) => {
  const response = await axiosClientWithAuth.put<{ data: RequestModel }>(
    `/v1/requests/${id}`,
    data
  );
  return response.data.data;
});

export const deleteRequestThunk = createApiThunk<
  RequestModel,
  number
>("requests/delete", async (id) => {
  const response = await axiosClientWithAuth.delete<{ data: RequestModel }>(
    `/v1/requests/${id}`
  );
  return response.data.data;
});

export const fetchRequestTranscriptThunk = createApiThunk<TranscriptModel, number>(
  "requests/fetchTranscript",
  async (studentId) => {
    const response = await axiosClientWithAuth.get(
      `/v1/transcript/student/${studentId}`
    );
    return response.data.data;
  }
);

export const fetchRequestHistoryThunk = createApiThunk<AllHistoryReqModel, HistoryReqFilterModel>(
  "requests/fetchHistory",
  async (filters) => {
    const response = await axiosClientWithAuth.post(
      `/v1/requests/history`,
      filters
    );
    return response.data.data;
  }
);

