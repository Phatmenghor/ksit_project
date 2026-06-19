import { createApiThunk } from "@/utils/axios/api-wrapper";
import { axiosClientWithAuth } from "@/utils/axios";
import {
  AllSurveyFilterModel,
  SurveyReportHeader,
  SurveyReportHeadersRequest,
  SurveyResponseData,
} from "@/model/survey/survey-result-model";

export const fetchSurveyResultsService = createApiThunk<
  SurveyResponseData,
  AllSurveyFilterModel
>("survey/fetchResults", async (params) => {
  const response = await axiosClientWithAuth.post<{ data: SurveyResponseData }>(
    "/v1/surveys/reports/active/preview",
    params
  );
  return response.data.data;
});

export const fetchSurveyHeadersService = createApiThunk<
  SurveyReportHeader[],
  SurveyReportHeadersRequest
>("survey/fetchHeaders", async (params) => {
  const requestBody = params || { hiddenHeaders: [] };
  const response = await axiosClientWithAuth.post<{ data: SurveyReportHeader[] }>(
    "/v1/surveys/reports/active/headers",
    requestBody
  );
  return response.data.data;
});

export const submitSurveyThunk = createApiThunk<
  any,
  { scheduleId: number; data: any }
>("survey/submit", async ({ scheduleId, data }) => {
  const response = await axiosClientWithAuth.post<{ data: any }>(
    `/v1/surveys/schedule/${scheduleId}/submit`,
    data
  );
  return response.data.data;
});

export const fetchSurveyExcelService = createApiThunk<
  any,
  AllSurveyFilterModel
>("survey/fetchExcel", async (params) => {
  const response = await axiosClientWithAuth.post<{ data: any }>(
    "/v1/surveys/reports/active/export",
    params
  );
  return response.data.data;
});

export const fetchStudentSurveyThunk = createApiThunk<
  any,
  { scheduleId: number }
>("survey/fetchStudentSurvey", async ({ scheduleId }) => {
  const response = await axiosClientWithAuth.get<{ data: any }>(
    `/v1/surveys/schedule/${scheduleId}/students-progress`
  );
  return response.data.data;
});
