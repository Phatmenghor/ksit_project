import { createApiThunk } from "@/utils/axios/api-wrapper";
import { axiosClientWithAuth } from "@/utils/axios";
import { ScheduleFilterModel } from "@/model/attendance/schedule/schedule-filter";
import { AllScheduleodel } from "@/model/schedules/all-schedule-model";

export const fetchScheduleComboboxService = createApiThunk<
  AllScheduleodel,
  ScheduleFilterModel
>("schedules/combobox", async (params) => {
  const response = await axiosClientWithAuth.post<{ data: AllScheduleodel }>(
    "/v1/schedules/all",
    params
  );
  return response.data.data;
});
