import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SurveyResultState } from "../models/type/survey-type";
import { fetchSurveyResultsService, fetchSurveyHeadersService } from "../thunks/survey-thunks";

const initialState: SurveyResultState = {
  data: null,
  headers: [],
  isLoading: true,
  isLoadingHeaders: false,
  error: null,
  filters: {
    search: "",
    semester: "ALL",
    academicYear: undefined,
    classId: undefined,
    startDate: undefined,
    endDate: undefined,
    pageNo: 1,
  },
};

const surveySlice = createSlice({
  name: "surveyResults",
  initialState,
  reducers: {
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.filters.pageNo = 1;
    },
    setSemesterFilter: (state, action: PayloadAction<string>) => {
      state.filters.semester = action.payload;
      state.filters.pageNo = 1;
    },
    setAcademicYearFilter: (state, action: PayloadAction<number | undefined>) => {
      state.filters.academicYear = action.payload;
      state.filters.pageNo = 1;
    },
    setClassFilter: (state, action: PayloadAction<number | undefined>) => {
      state.filters.classId = action.payload;
      state.filters.pageNo = 1;
    },
    setStartDateFilter: (state, action: PayloadAction<string | undefined>) => {
      state.filters.startDate = action.payload;
      state.filters.pageNo = 1;
    },
    setEndDateFilter: (state, action: PayloadAction<string | undefined>) => {
      state.filters.endDate = action.payload;
      state.filters.pageNo = 1;
    },
    setPageNo: (state, action: PayloadAction<number>) => {
      state.filters.pageNo = action.payload;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    resetState: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSurveyResultsService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSurveyResultsService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchSurveyResultsService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });

    builder
      .addCase(fetchSurveyHeadersService.pending, (state) => {
        state.isLoadingHeaders = true;
      })
      .addCase(fetchSurveyHeadersService.fulfilled, (state, action) => {
        state.headers = action.payload;
        state.isLoadingHeaders = false;
      })
      .addCase(fetchSurveyHeadersService.rejected, (state) => {
        state.isLoadingHeaders = false;
      });
  },
});

export const {
  setSearchFilter,
  setSemesterFilter,
  setAcademicYearFilter,
  setClassFilter,
  setStartDateFilter,
  setEndDateFilter,
  setPageNo,
  resetFilters,
  resetState,
} = surveySlice.actions;
export default surveySlice.reducer;
