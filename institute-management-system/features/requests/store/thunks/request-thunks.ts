import { createApiThunk } from "@/utils/axios/api-wrapper";
import { axiosClientWithAuth } from "@/utils/axios";
import { AllRequestModel } from "@/model/request/request-model";
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
