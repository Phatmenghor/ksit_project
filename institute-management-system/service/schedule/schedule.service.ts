import {
  DuplicateFilterModel,
  ScheduleFilterModel,
} from "@/model/attendance/schedule/schedule-filter";
import {
  CreateScheduleModel,
  UpdateScheduleModel,
} from "@/model/schedules/type-schedule-model";
import { axiosClientWithAuth } from "@/utils/axios";

export async function duplicateScheduleService(data: DuplicateFilterModel) {
  try {
    const response = await axiosClientWithAuth.post(
      `/v1/schedules/bulk-duplicate`,
      data
    );
    return response.data;
  } catch (error: any) {
    return null;
  }
}

export async function getAllSimpleScheduleService(data: ScheduleFilterModel) {
  try {
    const response = await axiosClientWithAuth.post(
      `/v1/schedules/my-schedules-list`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    return null;
  }
}

export async function getDetailScheduleService(scheduleId: number) {
  try {
    const response = await axiosClientWithAuth.get(
      `/v1/schedules/${scheduleId}`
    );
    return response.data.data;
  } catch (error: any) {
    return null;
  }
}
export async function createScheduleService(data: CreateScheduleModel) {
  try {
    const response = await axiosClientWithAuth.post(`/v1/schedules`, data);
    return response.data.data;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
}

export async function updateScheduleService(
  scheduleId: number,
  data: UpdateScheduleModel
) {
  try {
    const response = await axiosClientWithAuth.post(
      `/v1/schedules/updateById/${scheduleId}`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }

    throw error;
  }
}
/** @deprecated Use getDetailScheduleService instead */
export const getScheduleByIdService = getDetailScheduleService;
