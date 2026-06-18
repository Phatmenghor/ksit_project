import { createApiThunk } from "@/utils/axios/api-wrapper";
import { axiosClientWithAuth } from "@/utils/axios";
import {
  AllRoomFilterModel,
  CreateRoomModel,
  UpdateRoomModel,
} from "@/model/master-data/room/type-room-model";
import { AllRoomModel, RoomModel } from "@/model/master-data/room/all-room-model";

export const fetchAllRoomService = createApiThunk<
  AllRoomModel,
  AllRoomFilterModel
>("rooms/fetchAll", async (params) => {
  const response = await axiosClientWithAuth.post<{ data: AllRoomModel }>(
    "/v1/rooms/all",
    params
  );
  return response.data.data;
});

export const createRoomService = createApiThunk<RoomModel, CreateRoomModel>(
  "rooms/create",
  async (data) => {
    const response = await axiosClientWithAuth.post<{ data: RoomModel }>(
      "/v1/rooms",
      data
    );
    return response.data.data;
  }
);

export const updateRoomService = createApiThunk<
  RoomModel,
  { id: number; data: UpdateRoomModel }
>("rooms/update", async ({ id, data }) => {
  const response = await axiosClientWithAuth.post<{ data: RoomModel }>(
    `/v1/rooms/updateById/${id}`,
    data
  );
  return response.data.data;
});

export const deleteRoomService = createApiThunk<RoomModel, number>(
  "rooms/delete",
  async (id) => {
    const response = await axiosClientWithAuth.delete<{ data: RoomModel }>(
      `/v1/rooms/${id}`
    );
    return response.data.data;
  }
);

export const fetchRoomComboboxService = createApiThunk<
  AllRoomModel,
  AllRoomFilterModel
>("rooms/combobox", async (params) => {
  const response = await axiosClientWithAuth.post<{ data: AllRoomModel }>(
    "/v1/rooms/all",
    params
  );
  return response.data.data;
});
