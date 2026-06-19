import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DepartmentManagementState } from "../models/type/department-type";
import {
  fetchAllDepartmentService,
  createDepartmentService,
  updateDepartmentService,
  deleteDepartmentService,
  fetchDepartmentByIdService,
  fetchMyDepartmentsService,
} from "../thunks/department-thunks";

const initialState: DepartmentManagementState = {
  data: null,
  rollbackSnapshot: null,
  selectedDepartment: null,
  isLoading: true,
  error: null,
  filters: {
    search: "",
    pageNo: 1,
  },
  operations: {
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    isFetchingDetail: false,
  },
};

const departmentSlice = createSlice({
  name: "departments",
  initialState,
  reducers: {
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.filters.pageNo = 1;
    },
    setPageNo: (state, action: PayloadAction<number>) => {
      state.filters.pageNo = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedDepartment: (state) => {
      state.selectedDepartment = null;
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
      .addCase(fetchAllDepartmentService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllDepartmentService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllDepartmentService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });

    builder
      .addCase(fetchMyDepartmentsService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyDepartmentsService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchMyDepartmentsService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });

    builder
      .addCase(fetchDepartmentByIdService.pending, (state) => {
        state.operations.isFetchingDetail = true;
        state.error = null;
        state.selectedDepartment = null;
      })
      .addCase(fetchDepartmentByIdService.fulfilled, (state, action) => {
        state.selectedDepartment = action.payload;
        state.operations.isFetchingDetail = false;
        if (state.data?.content) {
          const index = state.data.content.findIndex(
            (d) => d.id === action.payload.id
          );
          if (index !== -1) state.data.content[index] = action.payload;
        }
      })
      .addCase(fetchDepartmentByIdService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isFetchingDetail = false;
      });

    builder
      .addCase(createDepartmentService.pending, (state) => {
        state.operations.isCreating = true;
        state.error = null;
      })
      .addCase(createDepartmentService.fulfilled, (state, action) => {
        if (state.data) {
          state.data.content = [action.payload, ...state.data.content];
          state.data.totalElements += 1;
          state.data.totalPages = Math.ceil(
            state.data.totalElements / state.data.pageSize
          );
        }
        state.operations.isCreating = false;
      })
      .addCase(createDepartmentService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isCreating = false;
      });

    builder
      .addCase(updateDepartmentService.pending, (state) => {
        state.operations.isUpdating = true;
        state.error = null;
      })
      .addCase(updateDepartmentService.fulfilled, (state, action) => {
        state.selectedDepartment = action.payload;
        state.operations.isUpdating = false;
        if (state.data) {
          state.data.content = state.data.content.map((d) =>
            d.id === action.payload.id ? action.payload : d
          );
        }
      })
      .addCase(updateDepartmentService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isUpdating = false;
      });

    builder
      .addCase(deleteDepartmentService.pending, (state, action) => {
        state.operations.isDeleting = true;
        state.error = null;
        state.rollbackSnapshot = state.data
          ? JSON.parse(JSON.stringify(state.data))
          : null;
        const id = action.meta.arg as number;
        if (state.data) {
          state.data.content = state.data.content.filter((d) => d.id !== id);
          state.data.totalElements -= 1;
          state.data.totalPages = Math.ceil(
            state.data.totalElements / state.data.pageSize
          );
          state.data.last = state.data.pageNo >= state.data.totalPages;
        }
      })
      .addCase(deleteDepartmentService.fulfilled, (state) => {
        state.operations.isDeleting = false;
        state.rollbackSnapshot = null;
      })
      .addCase(deleteDepartmentService.rejected, (state, action) => {
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
  clearError,
  clearSelectedDepartment,
  resetFilters,
  resetState,
} = departmentSlice.actions;

export default departmentSlice.reducer;
