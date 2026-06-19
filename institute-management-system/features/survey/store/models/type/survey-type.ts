import { SurveyResponseData, SurveyReportHeader } from "@/model/survey/survey-result-model";

export interface SurveyResultFilters {
  search: string;
  semester: string;
  academicYear: number | undefined;
  classId: number | undefined;
  startDate: string | undefined;
  endDate: string | undefined;
  pageNo: number;
}

export interface SurveyResultState {
  data: SurveyResponseData | null;
  headers: SurveyReportHeader[];
  isLoading: boolean;
  isLoadingHeaders: boolean;
  error: string | null;
  filters: SurveyResultFilters;
  studentProgress: any | null;
  operations: {
    isSubmitting: boolean;
  };
}
