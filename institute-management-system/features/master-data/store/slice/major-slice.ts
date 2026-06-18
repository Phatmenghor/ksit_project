import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MajorManagementState } from "../models/type/major-type";
import {
  fetchAllMajorService,
  createMajorService,
  updateMajorService,
  deleteMajorService,
  fetchMajorByIdService,
} from "../thunks/major-thunks";

const initialState: MajorManagementState = {
  data: null,
  rollbackSnapshot: null,
  selectedMajor: null,
  isLoading: true,
  error: null,
  filters: {
    search: "",
    pageNo: 1,
    departmentId: undefined,
  },
  operations: {
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    isFetchingDetail: false,
  },
};

const majorSlice = createSlice({
  name: "majors",
  initialState,
  reducers: {
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.filters.pageNo = 1;
    },
    setPageNo: (state, action: PayloadAction<number>) => {
      state.filters.pageNo = action.payload;
    },
    setDepartmentFilter: (state, action: PayloadAction<number | undefined>) => {
      state.filters.departmentId = action.payload;
      state.filters.pageNo = 1;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedMajor: (state) => {
      state.selectedMajor = null;
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
      .addCase(fetchAllMajorService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllMajorService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllMajorService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });

    builder
      .addCase(fetchMajorByIdService.pending, (state) => {
        state.operations.isFetchingDetail = true;
        state.error = null;
        state.selectedMajor = null;
      })
      .addCase(fetchMajorByIdService.fulfilled, (state, action) => {
        state.selectedMajor = action.payload;
        state.operations.isFetchingDetail = false;
        if (state.data?.content) {
          const index = state.data.content.findIndex(
            (m) => m.id === action.payload.id
          );
          if (index !== -1) state.data.content[index] = action.payload;
        }
      })
      .addCase(fetchMajorByIdService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isFetchingDetail = false;
      });

    builder
      .addCase(createMajorService.pending, (state) => {
        state.operations.isCreating = true;
        state.error = null;
      })
      .addCase(createMajorService.fulfilled, (state, action) => {
        if (state.data) {
          state.data.content = [action.payload, ...state.data.content];
          state.data.totalElements += 1;
          state.data.totalPages = Math.ceil(
            state.data.totalElements / state.data.pageSize
          );
        }
        state.operations.isCreating = false;
      })
      .addCase(createMajorService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isCreating = false;
      });

    builder
      .addCase(updateMajorService.pending, (state) => {
        state.operations.isUpdating = true;
        state.error = null;
      })
      .addCase(updateMajorService.fulfilled, (state, action) => {
        state.selectedMajor = action.payload;
        state.operations.isUpdating = false;
        if (state.data) {
          state.data.content = state.data.content.map((m) =>
            m.id === action.payload.id ? action.payload : m
          );
        }
      })
      .addCase(updateMajorService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isUpdating = false;
      });

    builder
      .addCase(deleteMajorService.pending, (state, action) => {
        state.operations.isDeleting = true;
        state.error = null;
        state.rollbackSnapshot = state.data
          ? JSON.parse(JSON.stringify(state.data))
          : null;
        const id = action.meta.arg as number;
        if (state.data) {
          state.data.content = state.data.content.filter((m) => m.id !== id);
          state.data.totalElements -= 1;
          state.data.totalPages = Math.ceil(
            state.data.totalElements / state.data.pageSize
          );
          state.data.last = state.data.pageNo >= state.data.totalPages;
        }
      })
      .addCase(deleteMajorService.fulfilled, (state) => {
        state.operations.isDeleting = false;
        state.rollbackSnapshot = null;
      })
      .addCase(deleteMajorService.rejected, (state, action) => {
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
  setDepartmentFilter,
  clearError,
  clearSelectedMajor,
  resetFilters,
  resetState,
} = majorSlice.actions;

export default majorSlice.reducer;
