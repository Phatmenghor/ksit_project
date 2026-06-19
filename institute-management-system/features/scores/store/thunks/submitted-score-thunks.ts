import { createApiThunk } from "@/utils/axios/api-wrapper";
import { axiosClientWithAuth } from "@/utils/axios";
import { AllStudentScoreModel } from "@/model/score/student-score/student-score.response";
import {
  SubmittedScoreParam,
  ConfigureScoreModel,
} from "@/model/score/submitted-score/submitted-score.request.model";
import {
  RequestStudentScoreModel,
  SubmitScoreModel,
  UpdateScoreModel,
} from "@/model/score/student-score/student-score.request";

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

export const intiStudentsScoreThunk = createApiThunk<any, RequestStudentScoreModel>(
  "scores/initialize",
  async (data) => {
    const response = await axiosClientWithAuth.post<{ data: any }>(
      "/v1/score/initialize",
      data
    );
    return response.data.data;
  }
);

export const updateStudentsScoreThunk = createApiThunk<any, UpdateScoreModel>(
  "scores/updateScore",
  async (data) => {
    const response = await axiosClientWithAuth.put<{ data: any }>(
      "/v1/score/score-update",
      data
    );
    return response.data.data;
  }
);

export const submittedScoreThunk = createApiThunk<any, SubmitScoreModel>(
  "scores/submit",
  async (data) => {
    const response = await axiosClientWithAuth.put<{ data: any }>(
      "/v1/score/submission-update",
      data
    );
    return response.data.data;
  }
);

export const getSubmissionScoreByIdThunk = createApiThunk<any, number>(
  "scores/fetchById",
  async (id) => {
    const response = await axiosClientWithAuth.get<{ data: any }>(
      `/v1/score/session/${id}`
    );
    return response.data.data;
  }
);

export const getConfigurationScoreThunk = createApiThunk<any, void>(
  "scores/getConfiguration",
  async () => {
    const response = await axiosClientWithAuth.get<{ data: any }>(
      "/v1/score/configuration"
    );
    return response.data.data;
  }
);

export const configureScoreThunk = createApiThunk<any, ConfigureScoreModel>(
  "scores/configure",
  async (config) => {
    const response = await axiosClientWithAuth.post<{ data: any }>(
      "/v1/score/configuration",
      config
    );
    return response.data.data;
  }
);
