import { createApiThunk } from "@/utils/axios/api-wrapper";
import { axiosClientWithAuth } from "@/utils/axios";
import { AllRequestModel, CreateRequestModel, RequestModel, UpdateRequestModel } from "@/model/request/request-model";
import { RequestFilterModel } from "@/model/request/request-filter";

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
