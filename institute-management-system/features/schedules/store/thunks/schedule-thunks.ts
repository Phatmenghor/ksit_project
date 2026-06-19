import { createApiThunk } from "@/utils/axios/api-wrapper";
import { axiosClientWithAuth } from "@/utils/axios";
import { AllScheduleModel } from "@/model/attendance/schedule/schedule-model";
import { ScheduleFilterModel } from "@/model/attendance/schedule/schedule-filter";

export const fetchMySchedulesService = createApiThunk<
  AllScheduleModel,
  ScheduleFilterModel
>("schedules/fetchMySchedules", async (params) => {
  const response = await axiosClientWithAuth.post<{ data: AllScheduleModel }>(
    "/v1/schedules/my-schedules",
    params
  );
  return response.data.data;
});

export const fetchAllSchedulesService = createApiThunk<
  AllScheduleModel,
  ScheduleFilterModel
>("schedules/fetchAll", async (params) => {
  const response = await axiosClientWithAuth.post<{ data: AllScheduleModel }>(
    "/v1/schedules/all",
    params
  );
  return response.data.data;
});

export const deleteScheduleService = createApiThunk<number, number>(
  "schedules/delete",
  async (scheduleId) => {
    await axiosClientWithAuth.delete(`/v1/schedules/${scheduleId}`);
    return scheduleId;
  }
);
