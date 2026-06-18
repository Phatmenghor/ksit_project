import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CourseManagementState } from "../models/type/course-type";
import { fetchAllCoursesService, deleteCourseService } from "../thunks/course-thunks";

const initialState: CourseManagementState = {
  data: null,
  rollbackSnapshot: null,
  selectedCourse: null,
  isLoading: true,
  error: null,
  filters: {
    search: "",
    departmentId: undefined,
    pageNo: 1,
  },
  operations: {
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
  },
};

const courseSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.filters.pageNo = 1;
    },
    setDepartmentFilter: (state, action: PayloadAction<number | undefined>) => {
      state.filters.departmentId = action.payload;
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
      .addCase(fetchAllCoursesService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllCoursesService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllCoursesService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });

    builder
      .addCase(deleteCourseService.pending, (state, action) => {
        state.operations.isDeleting = true;
        state.error = null;
        state.rollbackSnapshot = state.data ? JSON.parse(JSON.stringify(state.data)) : null;
        const id = action.meta.arg as number;
        if (state.data) {
          state.data.content = state.data.content.filter((c) => c.id !== id);
          state.data.totalElements -= 1;
          state.data.totalPages = Math.ceil(state.data.totalElements / state.data.pageSize);
        }
      })
      .addCase(deleteCourseService.fulfilled, (state) => {
        state.operations.isDeleting = false;
        state.rollbackSnapshot = null;
      })
      .addCase(deleteCourseService.rejected, (state, action) => {
        state.operations.isDeleting = false;
        state.error = action.payload as string;
        if (state.rollbackSnapshot) {
          state.data = state.rollbackSnapshot;
          state.rollbackSnapshot = null;
        }
      });
  },
});

export const { setSearchFilter, setDepartmentFilter, setPageNo, resetFilters, resetState } = courseSlice.actions;
export default courseSlice.reducer;
