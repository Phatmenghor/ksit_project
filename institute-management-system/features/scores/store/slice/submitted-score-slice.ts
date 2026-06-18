import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SubmittedScoreState } from "../models/type/score-type";
import { fetchAllSubmittedScoresService } from "../thunks/submitted-score-thunks";

const initialState: SubmittedScoreState = {
  data: null,
  isLoading: true,
  error: null,
  filters: {
    search: "",
    classId: undefined,
    scheduleId: undefined,
    academicYear: new Date().getFullYear(),
    semester: "ALL",
    status: "SUBMITTED",
    pageNo: 1,
  },
};

const submittedScoreSlice = createSlice({
  name: "submittedScores",
  initialState,
  reducers: {
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.filters.pageNo = 1;
    },
    setClassFilter: (state, action: PayloadAction<number | undefined>) => {
      state.filters.classId = action.payload;
      state.filters.pageNo = 1;
    },
    setScheduleFilter: (state, action: PayloadAction<number | undefined>) => {
      state.filters.scheduleId = action.payload;
      state.filters.pageNo = 1;
    },
    setAcademicYearFilter: (state, action: PayloadAction<number>) => {
      state.filters.academicYear = action.payload;
      state.filters.pageNo = 1;
    },
    setSemesterFilter: (state, action: PayloadAction<string>) => {
      state.filters.semester = action.payload;
      state.filters.pageNo = 1;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.filters.status = action.payload;
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
      .addCase(fetchAllSubmittedScoresService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllSubmittedScoresService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllSubmittedScoresService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });
  },
});

export const {
  setSearchFilter,
  setClassFilter,
  setScheduleFilter,
  setAcademicYearFilter,
  setSemesterFilter,
  setStatusFilter,
  setPageNo,
  resetFilters,
  resetState,
} = submittedScoreSlice.actions;
export default submittedScoreSlice.reducer;
