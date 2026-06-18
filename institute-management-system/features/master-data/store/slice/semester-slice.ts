import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SemesterManagementState } from "../models/type/semester-type";
import {
  fetchAllSemesterService,
  createSemesterService,
  updateSemesterService,
  deleteSemesterService,
} from "../thunks/semester-thunks";

const initialState: SemesterManagementState = {
  data: null,
  rollbackSnapshot: null,
  selectedSemester: null,
  isLoading: true,
  error: null,
  filters: {
    search: "",
    pageNo: 1,
    academyYear: undefined,
  },
  operations: {
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    isFetchingDetail: false,
  },
};

const semesterSlice = createSlice({
  name: "semesters",
  initialState,
  reducers: {
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.filters.pageNo = 1;
    },
    setPageNo: (state, action: PayloadAction<number>) => {
      state.filters.pageNo = action.payload;
    },
    setAcademyYearFilter: (
      state,
      action: PayloadAction<number | undefined>
    ) => {
      state.filters.academyYear = action.payload;
      state.filters.pageNo = 1;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedSemester: (state) => {
      state.selectedSemester = null;
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
      .addCase(fetchAllSemesterService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllSemesterService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllSemesterService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });

    builder
      .addCase(createSemesterService.pending, (state) => {
        state.operations.isCreating = true;
        state.error = null;
      })
      .addCase(createSemesterService.fulfilled, (state, action) => {
        if (state.data) {
          state.data.content = [action.payload, ...state.data.content];
          state.data.totalElements += 1;
          state.data.totalPages = Math.ceil(
            state.data.totalElements / state.data.pageSize
          );
        }
        state.operations.isCreating = false;
      })
      .addCase(createSemesterService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isCreating = false;
      });

    builder
      .addCase(updateSemesterService.pending, (state) => {
        state.operations.isUpdating = true;
        state.error = null;
      })
      .addCase(updateSemesterService.fulfilled, (state, action) => {
        state.operations.isUpdating = false;
        if (state.data) {
          state.data.content = state.data.content.map((s) =>
            s.id === action.payload.id ? action.payload : s
          );
        }
      })
      .addCase(updateSemesterService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isUpdating = false;
      });

    builder
      .addCase(deleteSemesterService.pending, (state, action) => {
        state.operations.isDeleting = true;
        state.error = null;
        state.rollbackSnapshot = state.data
          ? JSON.parse(JSON.stringify(state.data))
          : null;
        const id = action.meta.arg as number;
        if (state.data) {
          state.data.content = state.data.content.filter((s) => s.id !== id);
          state.data.totalElements -= 1;
          state.data.totalPages = Math.ceil(
            state.data.totalElements / state.data.pageSize
          );
          state.data.last = state.data.pageNo >= state.data.totalPages;
        }
      })
      .addCase(deleteSemesterService.fulfilled, (state) => {
        state.operations.isDeleting = false;
        state.rollbackSnapshot = null;
      })
      .addCase(deleteSemesterService.rejected, (state, action) => {
        state.operations.isDeleting = false;
        state.error = action.payload as string;
        if (state.rollbackSnapshot) {
          state.data = state.rollbackSnapshot;
          state.rollbackSnapshot = null;
        }
      });
  },
});

export const {
  setSearchFilter,
  setPageNo,
  setAcademyYearFilter,
  clearError,
  clearSelectedSemester,
  resetFilters,
  resetState,
} = semesterSlice.actions;

export default semesterSlice.reducer;
