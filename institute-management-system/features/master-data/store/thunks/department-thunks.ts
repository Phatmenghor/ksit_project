import { createApiThunk } from "@/utils/axios/api-wrapper";
import { axiosClientWithAuth } from "@/utils/axios";
import {
  AllDepartmentFilterModel,
  CreateDepartmentModel,
  UpdateDepartmentModel,
} from "@/model/master-data/department/type-department-model";
import {
  AllDepartmentModel,
  DepartmentModel,
} from "@/model/master-data/department/all-department-model";

export const fetchAllDepartmentService = createApiThunk<
  AllDepartmentModel,
  AllDepartmentFilterModel
>("departments/fetchAll", async (params) => {
  const response = await axiosClientWithAuth.post<{ data: AllDepartmentModel }>(
    "/v1/departments/all",
    params
  );
  return response.data.data;
});

export const fetchDepartmentByIdService = createApiThunk<
  DepartmentModel,
  number
>("departments/fetchById", async (id) => {
  const response = await axiosClientWithAuth.get<{ data: DepartmentModel }>(
    `/v1/departments/${id}`
  );
  return response.data.data;
});

export const createDepartmentService = createApiThunk<
  DepartmentModel,
  CreateDepartmentModel
>("departments/create", async (data) => {
  const response = await axiosClientWithAuth.post<{ data: DepartmentModel }>(
    "/v1/departments",
    data
  );
  return response.data.data;
});

export const updateDepartmentService = createApiThunk<
  DepartmentModel,
  { id: number; data: UpdateDepartmentModel }
>("departments/update", async ({ id, data }) => {
  const response = await axiosClientWithAuth.post<{ data: DepartmentModel }>(
    `/v1/departments/updateById/${id}`,
    data
  );
  return response.data.data;
});

export const deleteDepartmentService = createApiThunk<DepartmentModel, number>(
  "departments/delete",
  async (id) => {
    const response = await axiosClientWithAuth.delete<{ data: DepartmentModel }>(
      `/v1/departments/${id}`
    );
    return response.data.data;
  }
);

export const fetchDepartmentComboboxService = createApiThunk<
  AllDepartmentModel,
  AllDepartmentFilterModel
>("departments/combobox", async (params) => {
  const response = await axiosClientWithAuth.post<{ data: AllDepartmentModel }>(
    "/v1/departments/all",
    params
  );
  return response.data.data;
});

export const fetchMyDepartmentsService = createApiThunk<
  AllDepartmentModel,
  AllDepartmentFilterModel
>("departments/fetchMyDepartments", async (params) => {
  const response = await axiosClientWithAuth.post<{ data: AllDepartmentModel }>(
    "/v1/departments/my-departments",
    params
  );
  return response.data.data;
});
