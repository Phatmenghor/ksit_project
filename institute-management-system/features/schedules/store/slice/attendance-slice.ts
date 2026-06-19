import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchAllAttendanceGenerateThunk,
  fetchAllAttendanceHistoryThunk,
  updateAttendanceSessionThunk,
  fetchAttendanceSessionThunk,
  submitAttendanceSessionThunk,
  fetchAttendanceSessionByIdThunk,
  fetchAttendanceHistoryExcelThunk,
  fetchAttendanceHistoryCountThunk,
} from "../thunks/attendance-thunks";

interface AttendanceState {
  data: any | null;
  history: any | null;
  session: any | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    search: string;
    classId: number | undefined;
    scheduleId: number | undefined;
    academicYear: number | undefined;
    courseId: number | undefined;
    pageNo: number;
  };
}

const initialState: AttendanceState = {
  data: null,
  history: null,
  session: null,
  isLoading: false,
  error: null,
  filters: {
    search: "",
    classId: undefined,
    scheduleId: undefined,
    academicYear: undefined,
    courseId: undefined,
    pageNo: 1,
  },
};

const attendanceSlice = createSlice({
  name: "attendance",
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
    setAcademicYearFilter: (state, action: PayloadAction<number | undefined>) => {
      state.filters.academicYear = action.payload;
      state.filters.pageNo = 1;
    },
    setCourseFilter: (state, action: PayloadAction<number | undefined>) => {
      state.filters.courseId = action.payload;
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
      .addCase(fetchAllAttendanceGenerateThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllAttendanceGenerateThunk.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllAttendanceGenerateThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchAllAttendanceHistoryThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllAttendanceHistoryThunk.fulfilled, (state, action) => {
        state.history = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllAttendanceHistoryThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchAttendanceSessionThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.session = null;
      })
      .addCase(fetchAttendanceSessionThunk.fulfilled, (state, action) => {
        state.session = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAttendanceSessionThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchAttendanceSessionByIdThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.session = null;
      })
      .addCase(fetchAttendanceSessionByIdThunk.fulfilled, (state, action) => {
        state.session = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAttendanceSessionByIdThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(updateAttendanceSessionThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAttendanceSessionThunk.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateAttendanceSessionThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(submitAttendanceSessionThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitAttendanceSessionThunk.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(submitAttendanceSessionThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchAttendanceHistoryExcelThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceHistoryExcelThunk.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(fetchAttendanceHistoryExcelThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchAttendanceHistoryCountThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceHistoryCountThunk.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(fetchAttendanceHistoryCountThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSearchFilter,
  setClassFilter,
  setScheduleFilter,
  setAcademicYearFilter,
  setCourseFilter,
  setPageNo,
  resetFilters,
  resetState,
} = attendanceSlice.actions;

export default attendanceSlice.reducer;
