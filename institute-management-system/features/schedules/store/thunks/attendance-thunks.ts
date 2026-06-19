import { createApiThunk } from "@/utils/axios/api-wrapper";
import { axiosClientWithAuth } from "@/utils/axios";

export const fetchAllAttendanceGenerateThunk = createApiThunk<any, any>(
  "attendance/generate",
  async (params) => {
    const response = await axiosClientWithAuth.post<{ data: any }>(
      "/v1/attendance/initialize",
      params
    );
    return response.data.data;
  }
);

export const fetchAllAttendanceHistoryThunk = createApiThunk<any, any>(
  "attendance/history",
  async (params) => {
    const response = await axiosClientWithAuth.post<{ data: any }>(
      "/v1/attendance/history",
      params
    );
    return response.data.data;
  }
);

export const updateAttendanceSessionThunk = createApiThunk<any, any>(
  "attendance/update",
  async (params) => {
    const response = await axiosClientWithAuth.put<{ data: any }>(
      "/v1/attendance/update",
      params
    );
    return response.data.data;
  }
);

export const fetchAttendanceSessionThunk = createApiThunk<any, number>(
  "attendance/fetchSession",
  async (id) => {
    const response = await axiosClientWithAuth.get<{ data: any }>(
      `/v1/attendance/session/${id}`
    );
    return response.data.data;
  }
);

export const submitAttendanceSessionThunk = createApiThunk<any, number>(
  "attendance/submitSession",
  async (id) => {
    const response = await axiosClientWithAuth.post<{ data: any }>(
      `/v1/attendance/submit/${id}`
    );
    return response.data.data;
  }
);

export const fetchAttendanceSessionByIdThunk = createApiThunk<any, number>(
  "attendance/fetchSessionById",
  async (scheduleId) => {
    const response = await axiosClientWithAuth.get<{ data: any }>(
      `/v1/attendance/${scheduleId}`
    );
    return response.data.data;
  }
);

export const fetchAttendanceHistoryExcelThunk = createApiThunk<any, any>(
  "attendance/historyExcel",
  async (params) => {
    const response = await axiosClientWithAuth.post<{ data: any }>(
      "/v1/attendance/history/all",
      params
    );
    return response.data.data;
  }
);

export const fetchAttendanceHistoryCountThunk = createApiThunk<any, any>(
  "attendance/historyCount",
  async (params) => {
    const response = await axiosClientWithAuth.post<{ data: any }>(
      "/v1/attendance/history/count",
      params
    );
    return response.data.data;
  }
);
