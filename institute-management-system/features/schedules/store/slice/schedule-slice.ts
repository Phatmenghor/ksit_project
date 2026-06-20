import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ScheduleManagementState } from "../models/type/schedule-type";
import { fetchMySchedulesService, deleteScheduleService, fetchScheduleByIdService, createScheduleThunk, updateScheduleThunk, fetchAllSchedulesService } from "../thunks/schedule-thunks";

const WEEKDAY_VALUES = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const getCurrentDay = (): string => {
  return WEEKDAY_VALUES[new Date().getDay()];
};

const initialState: ScheduleManagementState = {
  data: null,
  isLoading: true,
  error: null,
  filters: {
    search: "",
    dayOfWeek: getCurrentDay(),
    semester: "ALL",
    academicYear: new Date().getFullYear(),
    courseId: undefined,
    classId: undefined,
    pageNo: 1,
  },
  selectedSchedule: null,
  operations: {
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
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

    builder
      .addCase(fetchAllSchedulesService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllSchedulesService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllSchedulesService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });

    builder
      .addCase(fetchScheduleByIdService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.selectedSchedule = null;
      })
      .addCase(fetchScheduleByIdService.fulfilled, (state, action) => {
        state.selectedSchedule = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchScheduleByIdService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });

    builder
      .addCase(createScheduleThunk.pending, (state) => {
        state.operations.isCreating = true;
        state.error = null;
      })
      .addCase(createScheduleThunk.fulfilled, (state) => {
        state.operations.isCreating = false;
      })
      .addCase(createScheduleThunk.rejected, (state, action) => {
        state.operations.isCreating = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(updateScheduleThunk.pending, (state) => {
        state.operations.isUpdating = true;
        state.error = null;
      })
      .addCase(updateScheduleThunk.fulfilled, (state, action) => {
        state.operations.isUpdating = false;
        state.selectedSchedule = action.payload;
      })
      .addCase(updateScheduleThunk.rejected, (state, action) => {
        state.operations.isUpdating = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(deleteScheduleService.pending, (state) => {
        state.operations.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteScheduleService.fulfilled, (state, action) => {
        state.operations.isDeleting = false;
        if (state.data) {
          state.data.content = state.data.content.filter((s) => s.id !== action.payload);
        }
      })
      .addCase(deleteScheduleService.rejected, (state, action) => {
        state.operations.isDeleting = false;
        state.error = action.payload as string;
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
