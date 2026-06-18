import { createApiThunk } from "@/utils/axios/api-wrapper";
import { axiosClientWithAuth } from "@/utils/axios";
import {
  AllSemesterFilterModel,
  CreateSemesterModel,
  UpdateSemesterModel,
} from "@/model/master-data/semester/type-semester-model";
import {
  AllSemesterModel,
  SemesterModel,
} from "@/model/master-data/semester/semester-model";

export const fetchAllSemesterService = createApiThunk<
  AllSemesterModel,
  AllSemesterFilterModel
>("semesters/fetchAll", async (params) => {
  const response = await axiosClientWithAuth.post<{ data: AllSemesterModel }>(
    "/v1/semesters/all",
    params
  );
  return response.data.data;
});

export const createSemesterService = createApiThunk<
  SemesterModel,
  CreateSemesterModel
>("semesters/create", async (data) => {
  const response = await axiosClientWithAuth.post<{ data: SemesterModel }>(
    "/v1/semesters",
    data
  );
  return response.data.data;
});

export const updateSemesterService = createApiThunk<
  SemesterModel,
  { id: number; data: UpdateSemesterModel }
>("semesters/update", async ({ id, data }) => {
  const response = await axiosClientWithAuth.post<{ data: SemesterModel }>(
    `/v1/semesters/updateSemesterById/${id}`,
    data
  );
  return response.data.data;
});

export const deleteSemesterService = createApiThunk<SemesterModel, number>(
  "semesters/delete",
  async (id) => {
    const response = await axiosClientWithAuth.delete<{ data: SemesterModel }>(
      `/v1/semesters/${id}`
    );
    return response.data.data;
  }
);

export const fetchSemesterComboboxService = createApiThunk<
  AllSemesterModel,
  AllSemesterFilterModel
>("semesters/combobox", async (params) => {
  const response = await axiosClientWithAuth.post<{ data: AllSemesterModel }>(
    "/v1/semesters/all",
    params
  );
  return response.data.data;
});
