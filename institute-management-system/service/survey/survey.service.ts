import { AllSubjectFilterModel } from "@/model/master-data/subject/type-subject-mode";
import { SurveyMainModel } from "@/model/survey/survey-main-model";
import {
  AllSurveyFilterModel,
  SurveyReportHeadersRequest,
} from "@/model/survey/survey-result-model";
import { axiosClientWithAuth } from "@/utils/axios";
import { SurveyFormDataModel } from "../../model/survey/survey-main-model";

export async function getAllSurveySectionService() {
  try {
    const response = await axiosClientWithAuth.get("/v1/surveys/main");
    return response.data.data;
  } catch (error: any) {
    return null;
  }
}

export async function updateSurveyService(data: SurveyMainModel) {
  try {
    const response = await axiosClientWithAuth.put(`/v1/surveys/main`, data);
    return response.data.data;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }

    throw error;
  }
}

export async function getSurveyReportHeadersService(
  data?: SurveyReportHeadersRequest
) {
  try {
    const requestBody = data || { hiddenHeaders: [] };
    const response = await axiosClientWithAuth.post(
      `/v1/surveys/reports/active/headers`,
      requestBody
    );
    return response.data.data;
  } catch (error: any) {
    return null;
  }
}

export async function getAllSurveyResultService(data: AllSurveyFilterModel) {
  try {
    const response = await axiosClientWithAuth.post(
      `/v1/surveys/reports/active/preview`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    return null;
  }
}

export async function submitSurveyService(
  scheduleId: number,
  data: SurveyFormDataModel
) {
  try {
    const response = await axiosClientWithAuth.post(
      `/v1/surveys/schedule/${scheduleId}/submit`,
      data
    );

    return response.data.data;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }

    throw error;
  }
}

export async function getAllSurveyResultExcelService(
  data: AllSurveyFilterModel
) {
  try {
    const response = await axiosClientWithAuth.post(
      `/v1/surveys/reports/active/export`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    return null;
  }
}
