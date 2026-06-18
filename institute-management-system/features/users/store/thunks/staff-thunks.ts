import { createApiThunk } from "@/utils/axios/api-wrapper";
import { axiosClientWithAuth } from "@/utils/axios";
import {
  AddStaffModel,
  EditStaffModel,
  StaffListRequest,
  ChangePasswordByAdminModel,
} from "@/model/user/staff/staff.request.model";
import {
  AllStaffModel,
  StaffModel,
} from "@/model/user/staff/staff.respond.model";

export const fetchAllStaffService = createApiThunk<
  AllStaffModel,
  StaffListRequest
>("staff/fetchAll", async (params) => {
  const response = await axiosClientWithAuth.post<{ data: AllStaffModel }>(
    "/v1/staff/all",
    params
  );
  return response.data.data;
});

export const fetchStaffByIdService = createApiThunk<StaffModel, string>(
  "staff/fetchById",
  async (id) => {
    const response = await axiosClientWithAuth.get<{ data: StaffModel }>(
      `/v1/staff/${id}`
    );
    return response.data.data;
  }
);

export const addStaffService = createApiThunk<StaffModel, AddStaffModel>(
  "staff/create",
  async (data) => {
    const response = await axiosClientWithAuth.post<{ data: StaffModel }>(
      "/v1/staff/register",
      data
    );
    return response.data.data;
  }
);

export const updateStaffService = createApiThunk<
  StaffModel,
  { id: number; data: EditStaffModel }
>("staff/update", async ({ id, data }) => {
  const response = await axiosClientWithAuth.put<{ data: StaffModel }>(
    `/v1/staff/${id}`,
    data
  );
  return response.data.data;
});

export const deleteStaffService = createApiThunk<StaffModel, number>(
  "staff/delete",
  async (id) => {
    const response = await axiosClientWithAuth.delete<{ data: StaffModel }>(
      `/v1/staff/${id}`
    );
    return response.data.data;
  }
);

export const changeStaffPasswordService = createApiThunk<
  void,
  ChangePasswordByAdminModel
>("staff/changePassword", async (data) => {
  const response = await axiosClientWithAuth.post<{ data: void }>(
    `/v1/staff/admin-change-password`,
    data
  );
  return response.data.data;
});

export const fetchStaffComboboxService = createApiThunk<
  AllStaffModel,
  StaffListRequest
>("staff/combobox", async (params) => {
  const response = await axiosClientWithAuth.post<{ data: AllStaffModel }>(
    "/v1/staff/all",
    params
  );
  return response.data.data;
});
