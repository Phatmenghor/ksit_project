import { createApiThunk } from "@/utils/axios/api-wrapper";
import { axiosClientWithAuth } from "@/utils/axios";
import {
  AllMajorFilterModel,
  CreateMajorModel,
  UpdateMajorModel,
} from "@/model/master-data/major/type-major-model";
import {
  AllMajorModel,
  MajorModel,
} from "@/model/master-data/major/all-major-model";

export const fetchAllMajorService = createApiThunk<
  AllMajorModel,
  AllMajorFilterModel
>("majors/fetchAll", async (params) => {
  const response = await axiosClientWithAuth.post<{ data: AllMajorModel }>(
    "/v1/majors/all",
    params
  );
  return response.data.data;
});

export const fetchMajorByIdService = createApiThunk<MajorModel, number>(
  "majors/fetchById",
  async (id) => {
    const response = await axiosClientWithAuth.get<{ data: MajorModel }>(
      `/v1/majors/${id}`
    );
    return response.data.data;
  }
);

export const createMajorService = createApiThunk<MajorModel, CreateMajorModel>(
  "majors/create",
  async (data) => {
    const response = await axiosClientWithAuth.post<{ data: MajorModel }>(
      "/v1/majors",
      data
    );
    return response.data.data;
  }
);

export const updateMajorService = createApiThunk<
  MajorModel,
  { id: number; data: UpdateMajorModel }
>("majors/update", async ({ id, data }) => {
  const response = await axiosClientWithAuth.post<{ data: MajorModel }>(
    `/v1/majors/updateById/${id}`,
    data
  );
  return response.data.data;
});

export const deleteMajorService = createApiThunk<MajorModel, number>(
  "majors/delete",
  async (id) => {
    const response = await axiosClientWithAuth.delete<{ data: MajorModel }>(
      `/v1/majors/${id}`
    );
    return response.data.data;
  }
);

export const fetchMajorComboboxService = createApiThunk<
  AllMajorModel,
  AllMajorFilterModel
>("majors/combobox", async (params) => {
  const response = await axiosClientWithAuth.post<{ data: AllMajorModel }>(
    "/v1/majors/all",
    params
  );
  return response.data.data;
});
