import { axiosClientWithAuth } from "@/utils/axios";

export async function getAllStudentSurveyService({
  scheduleId,
}: {
  scheduleId: number;
}) {
  try {
    const response = await axiosClientWithAuth.get(
      `/v1/surveys/schedule/${scheduleId}/students-progress`
    );
    return response.data.data;
  } catch (error: any) {
    return null;
  }
}
