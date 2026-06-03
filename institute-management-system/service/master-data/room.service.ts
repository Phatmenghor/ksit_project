
import { AllRoomFilterModel, CreateRoomModel, UpdateRoomModel } from "@/model/master-data/room/type-room-model";
import { axiosClientWithAuth } from "@/utils/axios";

export async function getAllRoomService(data: AllRoomFilterModel) {
  try {
    const response = await axiosClientWithAuth.post(
      `/v1/rooms/all`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching all room:", error);
    return null;
  }
}

export async function createRoomService(data: CreateRoomModel) {
  try {
    const response = await axiosClientWithAuth.post(`/v1/rooms`, data);
    return response.data.data;
  } catch (error: any) {
    // Extract error message from response if available
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error creating room:", error);
    throw error;
  }
}

export async function updateRoomService(
  roomId: number,
  data: UpdateRoomModel
) {
  try {
    const response = await axiosClientWithAuth.post(
      `/v1/rooms/updateById/${roomId}`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    // Extract error message from response if available
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }

    console.error("Error updating room:", error);
    throw error;
  }
}

export async function deletedRoomService(roomId: number) {
  try {
    const response = await axiosClientWithAuth.delete(
      `/v1/rooms/${roomId}`
    );
    return response.data.data;
  } catch (error: any) {
    return null;
  }
}
