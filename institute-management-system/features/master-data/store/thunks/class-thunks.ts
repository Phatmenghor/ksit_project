import { createApiThunk } from "@/utils/axios/api-wrapper";
import { axiosClientWithAuth } from "@/utils/axios";
import {
  AllClassFilterModel,
  CreateClassModel,
  UpdateClassModel,
} from "@/model/master-data/class/type-class-model";
import {
  AllClassModel,
  ClassModel,
} from "@/model/master-data/class/all-class-model";

export const fetchAllClassService = createApiThunk<
  AllClassModel,
  AllClassFilterModel
>("classes/fetchAll", async (params) => {
  const response = await axiosClientWithAuth.post<{ data: AllClassModel }>(
    "/v1/classes/all",
    params
  );
  return response.data.data;
});

export const fetchClassByIdService = createApiThunk<ClassModel, number>(
  "classes/fetchById",
  async (id) => {
    const response = await axiosClientWithAuth.get<{ data: ClassModel }>(
      `/v1/classes/${id}`
    );
    return response.data.data;
  }
);

export const createClassService = createApiThunk<ClassModel, CreateClassModel>(
  "classes/create",
  async (data) => {
    const response = await axiosClientWithAuth.post<{ data: ClassModel }>(
      "/v1/classes",
      data
    );
    return response.data.data;
  }
);

export const updateClassService = createApiThunk<
  ClassModel,
  { id: number; data: UpdateClassModel }
>("classes/update", async ({ id, data }) => {
  const response = await axiosClientWithAuth.post<{ data: ClassModel }>(
    `/v1/classes/updateById/${id}`,
    data
  );
  return response.data.data;
});

export const deleteClassService = createApiThunk<ClassModel, number>(
  "classes/delete",
  async (id) => {
    const response = await axiosClientWithAuth.delete<{ data: ClassModel }>(
      `/v1/classes/${id}`
    );
    return response.data.data;
  }
);

export const fetchClassComboboxService = createApiThunk<
  AllClassModel,
  AllClassFilterModel
>("classes/combobox", async (params) => {
  const response = await axiosClientWithAuth.post<{ data: AllClassModel }>(
    "/v1/classes/all",
    params
  );
  return response.data.data;
});

export const fetchMyClassesThunk = createApiThunk<
  AllClassModel,
  AllClassFilterModel
>("classes/fetchMyClasses", async (params) => {
  const response = await axiosClientWithAuth.post<{ data: AllClassModel }>(
    "/v1/classes/my-classes",
    params
  );
  return response.data.data;
});
