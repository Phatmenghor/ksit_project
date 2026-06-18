import { createApiThunk } from "@/utils/axios/api-wrapper";
import { axiosClientWithAuth } from "@/utils/axios";
import { AllStudentScoreModel } from "@/model/score/student-score/student-score.response";
import { SubmittedScoreParam } from "@/model/score/submitted-score/submitted-score.request.model";

export const fetchAllSubmittedScoresService = createApiThunk<
  AllStudentScoreModel,
  SubmittedScoreParam
>("scores/fetchAllSubmitted", async (params) => {
  const response = await axiosClientWithAuth.post<{ data: AllStudentScoreModel }>(
    "/v1/score/all",
    params
  );
  return response.data.data;
});
