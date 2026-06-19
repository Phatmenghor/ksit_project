import { RootState } from "@/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectSurveyData = (state: RootState) => state.surveyResults.data;
export const selectSurveyHeaders = (state: RootState) => state.surveyResults.headers;
export const selectSurveyIsLoading = (state: RootState) => state.surveyResults.isLoading;
export const selectSurveyIsLoadingHeaders = (state: RootState) => state.surveyResults.isLoadingHeaders;
export const selectSurveyError = (state: RootState) => state.surveyResults.error;
export const selectSurveyFilters = (state: RootState) => state.surveyResults.filters;
export const selectStudentProgress = (state: RootState) => state.surveyResults.studentProgress;
export const selectSurveyOperations = (state: RootState) => state.surveyResults.operations;

export const selectSurveyContent = createSelector(
  [selectSurveyData],
  (data) => data?.content || []
);

export const selectSurveyPagination = createSelector(
  [selectSurveyData],
  (data) => ({
    currentPage: data?.pageNo || 1,
    totalPages: data?.totalPages || 1,
    totalElements: data?.totalElements || 0,
    pageSize: data?.pageSize || 10,
  })
);
