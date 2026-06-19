import { createApiThunk } from "@/utils/axios/api-wrapper";
import { axiosClientWithAuth } from "@/utils/axios";
import { SurveyMainModel } from "@/model/survey/survey-main-model";

export const fetchSurveyQAThunk = createApiThunk<SurveyMainModel, void>(
  "surveyQA/fetch",
  async () => {
    const response = await axiosClientWithAuth.get<{ data: SurveyMainModel }>(
      "/v1/surveys/main"
    );
    return response.data.data;
  }
);

export const saveSurveyQAThunk = createApiThunk<SurveyMainModel, SurveyMainModel>(
  "surveyQA/save",
  async (data) => {
    const response = await axiosClientWithAuth.put<{ data: SurveyMainModel }>(
      "/v1/surveys/main",
      data
    );
    return response.data.data;
  }
);
