import { AttendanceGenerateParamModel } from "@/model/attendance/attendance-filter";
import { AttendanceHistoryFilter } from "@/model/attendance/attendance-history";
import { UpdateAttendanceModel } from "@/model/attendance/attendance-update";
import { axiosClientWithAuth } from "@/utils/axios";

export async function getAllAttendanceGenerateService(
  data: AttendanceGenerateParamModel
) {
  try {
    const response = await axiosClientWithAuth.post(
      `/v1/attendance/initialize`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching all schedule:", error);
    return null;
  }
}

export async function getAllAttendanceHistoryService(
  data: AttendanceHistoryFilter
) {
  try {
    const response = await axiosClientWithAuth.post(
      `/v1/attendance/history`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching requests:", error);
    return null;
  }
}

// update attendance session
export async function updateAttendanceSessionService(
  data: UpdateAttendanceModel
) {
  try {
    const response = await axiosClientWithAuth.put(
      `/v1/attendance/update`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    console.error("Error updating attendance session:", error);
    return null;
  }
}

export async function getAllAttedanceHistoryExcelService(
  data: AttendanceHistoryFilter
) {
  try {
    const response = await axiosClientWithAuth.post(
      `/v1/attendance/history/all`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching requests:", error);
    return null;
  }
}

export async function getAllAttedanceHistoryCountService(
  data: AttendanceHistoryFilter
) {
  try {
    const response = await axiosClientWithAuth.post(
      `/v1/attendance/history/count`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching requests:", error);
    return null;
  }
}

export async function getAttendanceSessionService(id: number) {
  try {
    const response = await axiosClientWithAuth.get(
      `/v1/attendance/session/${id}`
    );
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching attendance by id:", error);
    return null;
  }
}

export async function submitAttendanceSessionService(sessionId: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/v1/attendance/submit/${sessionId}`
    );
    return response.data.data;
  } catch (error: any) {
    console.error("Error submitting attendance session:", error);
    return null;
  }
}

export async function getAttendanceSessionByIdService(scheduleId: number) {
  try {
    const response = await axiosClientWithAuth.get(
      `/v1/attendance/${scheduleId}`
    );
    return response.data.data;
  } catch (error: any) {
    console.error("Error get attendance session by Id:", error);
    return null;
  }
}

export async function getAttendanceHistoryAllService(
  data: AttendanceHistoryFilter
) {
  try {
    const response = await axiosClientWithAuth.post(
      `/v1/attendance/history/all`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching requests:", error);
    return null;
  }
}
