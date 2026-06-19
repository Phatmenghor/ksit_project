import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StudentManagementState } from "../models/type/student-type";
import { fetchAllStudentsService, deleteStudentService, fetchStudentByIdThunk, addStudentThunk, updateStudentThunk, fetchStudentsListThunk } from "../thunks/student-thunks";
import { ClassModel } from "@/model/master-data/class/all-class-model";
import { ScheduleModel } from "@/model/schedules/all-schedule-model";

const initialState: StudentManagementState = {
  data: null,
  rollbackSnapshot: null,
  isLoading: true,
  error: null,
  filters: {
    search: "",
    classId: undefined,
    scheduleId: undefined,
    academicYear: undefined,
    courseId: undefined,
    pageNo: 1,
  },
  operations: {
    isDeleting: false,
    isCreating: false,
    isUpdating: false,
    isFetchingDetail: false,
  },
  selectedStudent: null,
};

const studentSlice = createSlice({
  name: "studentList",
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
      .addCase(fetchAllStudentsService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllStudentsService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllStudentsService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });

    builder
      .addCase(deleteStudentService.pending, (state, action) => {
        state.operations.isDeleting = true;
        state.error = null;
        state.rollbackSnapshot = state.data ? JSON.parse(JSON.stringify(state.data)) : null;
        const id = action.meta.arg as number;
        if (state.data) {
          state.data.content = state.data.content.filter((s) => s.id !== id);
          state.data.totalElements -= 1;
          state.data.totalPages = Math.ceil(state.data.totalElements / state.data.pageSize);
        }
      })
      .addCase(deleteStudentService.fulfilled, (state) => {
        state.operations.isDeleting = false;
        state.rollbackSnapshot = null;
      })
      .addCase(deleteStudentService.rejected, (state, action) => {
        state.operations.isDeleting = false;
        state.error = action.payload as string;
        if (state.rollbackSnapshot) {
          state.data = state.rollbackSnapshot;
          state.rollbackSnapshot = null;
        }
      });

    builder
      .addCase(fetchStudentByIdThunk.pending, (state) => {
        state.operations.isFetchingDetail = true;
        state.error = null;
        state.selectedStudent = null;
      })
      .addCase(fetchStudentByIdThunk.fulfilled, (state, action) => {
        state.selectedStudent = action.payload;
        state.operations.isFetchingDetail = false;
      })
      .addCase(fetchStudentByIdThunk.rejected, (state, action) => {
        state.operations.isFetchingDetail = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(addStudentThunk.pending, (state) => {
        state.operations.isCreating = true;
        state.error = null;
      })
      .addCase(addStudentThunk.fulfilled, (state) => {
        state.operations.isCreating = false;
      })
      .addCase(addStudentThunk.rejected, (state, action) => {
        state.operations.isCreating = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(updateStudentThunk.pending, (state) => {
        state.operations.isUpdating = true;
        state.error = null;
      })
      .addCase(updateStudentThunk.fulfilled, (state, action) => {
        state.operations.isUpdating = false;
        state.selectedStudent = action.payload;
      })
      .addCase(updateStudentThunk.rejected, (state, action) => {
        state.operations.isUpdating = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchStudentsListThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStudentsListThunk.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchStudentsListThunk.rejected, (state, action) => {
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
} = studentSlice.actions;
export default studentSlice.reducer;
