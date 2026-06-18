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
