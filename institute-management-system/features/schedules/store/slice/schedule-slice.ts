import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ScheduleManagementState } from "../models/type/schedule-type";
import { fetchMySchedulesService } from "../thunks/schedule-thunks";

const initialState: ScheduleManagementState = {
  data: null,
  isLoading: true,
  error: null,
  filters: {
    search: "",
    dayOfWeek: "ALL",
    semester: "ALL",
    academicYear: new Date().getFullYear(),
    courseId: undefined,
    classId: undefined,
    pageNo: 1,
  },
};

const scheduleSlice = createSlice({
  name: "scheduleList",
  initialState,
  reducers: {
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.filters.pageNo = 1;
    },
    setDayFilter: (state, action: PayloadAction<string>) => {
      state.filters.dayOfWeek = action.payload;
      state.filters.pageNo = 1;
    },
    setSemesterFilter: (state, action: PayloadAction<string>) => {
      state.filters.semester = action.payload;
      state.filters.pageNo = 1;
    },
    setAcademicYearFilter: (state, action: PayloadAction<number>) => {
      state.filters.academicYear = action.payload;
      state.filters.pageNo = 1;
    },
    setCourseFilter: (state, action: PayloadAction<number | undefined>) => {
      state.filters.courseId = action.payload;
      state.filters.pageNo = 1;
    },
    setClassFilter: (state, action: PayloadAction<number | undefined>) => {
      state.filters.classId = action.payload;
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
      .addCase(fetchMySchedulesService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMySchedulesService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchMySchedulesService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });
  },
});

export const {
  setSearchFilter,
  setDayFilter,
  setSemesterFilter,
  setAcademicYearFilter,
  setCourseFilter,
  setClassFilter,
  setPageNo,
  resetFilters,
  resetState,
} = scheduleSlice.actions;
export default scheduleSlice.reducer;
