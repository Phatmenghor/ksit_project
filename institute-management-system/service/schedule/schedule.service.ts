import { UpdateSemesterModel } from "@/model/master-data/semester/type-semester-model";
import {
  DuplicateFilterModel,
  ScheduleFilterModel,
} from "@/model/attendance/schedule/schedule-filter";
import { CreateScheduleModel } from "@/model/schedules/type-schedule-model";
import { axiosClientWithAuth } from "@/utils/axios";

export async function getAllScheduleService(data: ScheduleFilterModel) {
  try {
    const response = await axiosClientWithAuth.post(`/v1/schedules/all`, data);
    return response.data.data;
  } catch (error: any) {
    return null;
  }
}

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

export async function getAllMyScheduleService(data: ScheduleFilterModel) {
  try {
    const response = await axiosClientWithAuth.post(
      `/v1/schedules/my-schedules`,
      data
    );
    return response.data.data;
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
  data: UpdateSemesterModel
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

export async function DetailScheduleService(scheduleId: number) {
  try {
    const response = await axiosClientWithAuth.get(
      `/v1/schedules/${scheduleId}`
    );
    return response.data.data;
  } catch (error: any) {
    return null;
  }
}
export async function getScheduleByIdService(scheduleId: number) {
  try {
    const response = await axiosClientWithAuth.get(
      `/v1/schedules/${scheduleId}`
    );
    return response.data.data;
  } catch (error: any) {
    return null;
  }
}

export async function deleteScheduleService(scheduleId: number) {
  try {
    const response = await axiosClientWithAuth.delete(
      `/v1/schedules/${scheduleId}`
    );
    return response.data.data;
  } catch (error: any) {
    return null;
  }
}
