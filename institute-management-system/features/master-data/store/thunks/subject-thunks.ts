import { createApiThunk } from "@/utils/axios/api-wrapper";
import { axiosClientWithAuth } from "@/utils/axios";
import {
  AllSubjectFilterModel,
  CreateSubjectModel,
  UpdateSubjectModel,
} from "@/model/master-data/subject/type-subject-mode";
import {
  AllSubjectModel,
  SubjectModel,
} from "@/model/master-data/subject/all-subject-model";

export const fetchAllSubjectService = createApiThunk<
  AllSubjectModel,
  AllSubjectFilterModel
>("subjects/fetchAll", async (params) => {
  const response = await axiosClientWithAuth.post<{ data: AllSubjectModel }>(
    "/v1/subjects/all",
    params
  );
  return response.data.data;
});

export const createSubjectService = createApiThunk<
  SubjectModel,
  CreateSubjectModel
>("subjects/create", async (data) => {
  const response = await axiosClientWithAuth.post<{ data: SubjectModel }>(
    "/v1/subjects",
    data
  );
  return response.data.data;
});

export const updateSubjectService = createApiThunk<
  SubjectModel,
  { id: number; data: UpdateSubjectModel }
>("subjects/update", async ({ id, data }) => {
  const response = await axiosClientWithAuth.post<{ data: SubjectModel }>(
    `/v1/subjects/updateById/${id}`,
    data
  );
  return response.data.data;
});

export const deleteSubjectService = createApiThunk<SubjectModel, number>(
  "subjects/delete",
  async (id) => {
    const response = await axiosClientWithAuth.delete<{ data: SubjectModel }>(
      `/v1/subjects/${id}`
    );
    return response.data.data;
  }
);

export const fetchSubjectComboboxService = createApiThunk<
  AllSubjectModel,
  AllSubjectFilterModel
>("subjects/combobox", async (params) => {
  const response = await axiosClientWithAuth.post<{ data: AllSubjectModel }>(
    "/v1/subjects/all",
    params
  );
  return response.data.data;
});
