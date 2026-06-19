import { createSlice } from "@reduxjs/toolkit";
import { SurveyMainModel } from "@/model/survey/survey-main-model";
import { fetchSurveyQAThunk, saveSurveyQAThunk } from "../thunks/survey-qa-thunks";

interface SurveyQAState {
  data: SurveyMainModel | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

const initialState: SurveyQAState = {
  data: null,
  isLoading: true,
  isSaving: false,
  error: null,
};

const surveyQASlice = createSlice({
  name: "surveyQA",
  initialState,
  reducers: {
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSurveyQAThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSurveyQAThunk.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchSurveyQAThunk.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });

    builder
      .addCase(saveSurveyQAThunk.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(saveSurveyQAThunk.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isSaving = false;
      })
      .addCase(saveSurveyQAThunk.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isSaving = false;
      });
  },
});

export const { resetState } = surveyQASlice.actions;
export default surveyQASlice.reducer;
