import { RootState } from "@/store";

export const selectSurveyQAData = (state: RootState) => state.surveyQA.data;
export const selectSurveyQAIsLoading = (state: RootState) => state.surveyQA.isLoading;
export const selectSurveyQAIsSaving = (state: RootState) => state.surveyQA.isSaving;
export const selectSurveyQAError = (state: RootState) => state.surveyQA.error;
