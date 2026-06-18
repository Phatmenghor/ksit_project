import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ClassManagementState } from "../models/type/class-type";
import {
  fetchAllClassService,
  createClassService,
  updateClassService,
  deleteClassService,
  fetchClassByIdService,
} from "../thunks/class-thunks";

const initialState: ClassManagementState = {
  data: null,
  rollbackSnapshot: null,
  selectedClass: null,
  isLoading: true,
  error: null,
  filters: {
    search: "",
    pageNo: 1,
    majorId: undefined,
    academyYear: undefined,
  },
  operations: {
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    isFetchingDetail: false,
  },
};

const classSlice = createSlice({
  name: "classes",
  initialState,
  reducers: {
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.filters.pageNo = 1;
    },
    setPageNo: (state, action: PayloadAction<number>) => {
      state.filters.pageNo = action.payload;
    },
    setMajorFilter: (state, action: PayloadAction<number | undefined>) => {
      state.filters.majorId = action.payload;
      state.filters.pageNo = 1;
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
    clearSelectedClass: (state) => {
      state.selectedClass = null;
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
      .addCase(fetchAllClassService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllClassService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllClassService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });

    builder
      .addCase(fetchClassByIdService.pending, (state) => {
        state.operations.isFetchingDetail = true;
        state.error = null;
        state.selectedClass = null;
      })
      .addCase(fetchClassByIdService.fulfilled, (state, action) => {
        state.selectedClass = action.payload;
        state.operations.isFetchingDetail = false;
        if (state.data?.content) {
          const index = state.data.content.findIndex(
            (c) => c.id === action.payload.id
          );
          if (index !== -1) state.data.content[index] = action.payload;
        }
      })
      .addCase(fetchClassByIdService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isFetchingDetail = false;
      });

    builder
      .addCase(createClassService.pending, (state) => {
        state.operations.isCreating = true;
        state.error = null;
      })
      .addCase(createClassService.fulfilled, (state, action) => {
        if (state.data) {
          state.data.content = [action.payload, ...state.data.content];
          state.data.totalElements += 1;
          state.data.totalPages = Math.ceil(
            state.data.totalElements / state.data.pageSize
          );
        }
        state.operations.isCreating = false;
      })
      .addCase(createClassService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isCreating = false;
      });

    builder
      .addCase(updateClassService.pending, (state) => {
        state.operations.isUpdating = true;
        state.error = null;
      })
      .addCase(updateClassService.fulfilled, (state, action) => {
        state.selectedClass = action.payload;
        state.operations.isUpdating = false;
        if (state.data) {
          state.data.content = state.data.content.map((c) =>
            c.id === action.payload.id ? action.payload : c
          );
        }
      })
      .addCase(updateClassService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isUpdating = false;
      });

    builder
      .addCase(deleteClassService.pending, (state, action) => {
        state.operations.isDeleting = true;
        state.error = null;
        state.rollbackSnapshot = state.data
          ? JSON.parse(JSON.stringify(state.data))
          : null;
        const id = action.meta.arg as number;
        if (state.data) {
          state.data.content = state.data.content.filter((c) => c.id !== id);
          state.data.totalElements -= 1;
          state.data.totalPages = Math.ceil(
            state.data.totalElements / state.data.pageSize
          );
          state.data.last = state.data.pageNo >= state.data.totalPages;
        }
      })
      .addCase(deleteClassService.fulfilled, (state) => {
        state.operations.isDeleting = false;
        state.rollbackSnapshot = null;
      })
      .addCase(deleteClassService.rejected, (state, action) => {
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
  setMajorFilter,
  setAcademyYearFilter,
  clearError,
  clearSelectedClass,
  resetFilters,
  resetState,
} = classSlice.actions;

export default classSlice.reducer;
