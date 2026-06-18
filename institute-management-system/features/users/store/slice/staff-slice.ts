import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StaffManagementState } from "../models/type/staff-type";
import {
  fetchAllStaffService,
  fetchStaffByIdService,
  addStaffService,
  updateStaffService,
  deleteStaffService,
  changeStaffPasswordService,
} from "../thunks/staff-thunks";

const initialState: StaffManagementState = {
  data: null,
  rollbackSnapshot: null,
  selectedStaff: null,
  isLoading: true,
  error: null,
  filters: {
    search: "",
    pageNo: 1,
    status: "ACTIVE",
    roles: [],
  },
  operations: {
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    isFetchingDetail: false,
    isResettingPassword: false,
  },
};

const staffSlice = createSlice({
  name: "staff",
  initialState,
  reducers: {
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.filters.pageNo = 1;
    },
    setPageNo: (state, action: PayloadAction<number>) => {
      state.filters.pageNo = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.filters.status = action.payload;
      state.filters.pageNo = 1;
    },
    setRolesFilter: (state, action: PayloadAction<string[]>) => {
      state.filters.roles = action.payload;
      state.filters.pageNo = 1;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedStaff: (state) => {
      state.selectedStaff = null;
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
      .addCase(fetchAllStaffService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllStaffService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllStaffService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });

    builder
      .addCase(fetchStaffByIdService.pending, (state) => {
        state.operations.isFetchingDetail = true;
        state.error = null;
        state.selectedStaff = null;
      })
      .addCase(fetchStaffByIdService.fulfilled, (state, action) => {
        state.selectedStaff = action.payload;
        state.operations.isFetchingDetail = false;
        if (state.data?.content) {
          const index = state.data.content.findIndex(
            (s) => String(s.id) === String(action.payload.id)
          );
          if (index !== -1) state.data.content[index] = action.payload;
        }
      })
      .addCase(fetchStaffByIdService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isFetchingDetail = false;
      });

    builder
      .addCase(addStaffService.pending, (state) => {
        state.operations.isCreating = true;
        state.error = null;
      })
      .addCase(addStaffService.fulfilled, (state, action) => {
        if (state.data) {
          state.data.content = [action.payload, ...state.data.content];
          state.data.totalElements += 1;
          state.data.totalPages = Math.ceil(
            state.data.totalElements / state.data.pageSize
          );
        }
        state.operations.isCreating = false;
      })
      .addCase(addStaffService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isCreating = false;
      });

    builder
      .addCase(updateStaffService.pending, (state) => {
        state.operations.isUpdating = true;
        state.error = null;
      })
      .addCase(updateStaffService.fulfilled, (state, action) => {
        state.selectedStaff = action.payload;
        state.operations.isUpdating = false;
        if (state.data) {
          state.data.content = state.data.content.map((s) =>
            s.id === action.payload.id ? action.payload : s
          );
        }
      })
      .addCase(updateStaffService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isUpdating = false;
      });

    builder
      .addCase(deleteStaffService.pending, (state, action) => {
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
      .addCase(deleteStaffService.fulfilled, (state) => {
        state.operations.isDeleting = false;
        state.rollbackSnapshot = null;
      })
      .addCase(deleteStaffService.rejected, (state, action) => {
        state.operations.isDeleting = false;
        state.error = action.payload as string;
        if (state.rollbackSnapshot) {
          state.data = state.rollbackSnapshot;
          state.rollbackSnapshot = null;
        }
      });

    builder
      .addCase(changeStaffPasswordService.pending, (state) => {
        state.operations.isResettingPassword = true;
        state.error = null;
      })
      .addCase(changeStaffPasswordService.fulfilled, (state) => {
        state.operations.isResettingPassword = false;
      })
      .addCase(changeStaffPasswordService.rejected, (state, action) => {
        state.operations.isResettingPassword = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSearchFilter,
  setPageNo,
  setStatusFilter,
  setRolesFilter,
  clearError,
  clearSelectedStaff,
  resetFilters,
  resetState,
} = staffSlice.actions;

export default staffSlice.reducer;
