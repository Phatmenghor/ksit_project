import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RequestManagementState } from "../models/type/request-type";
import { fetchAllRequestsService, createRequestThunk, fetchRequestByIdThunk, updateRequestThunk } from "../thunks/request-thunks";

const initialState: RequestManagementState = {
  data: null,
  isLoading: true,
  error: null,
  isCreating: false,
  filters: {
    search: "",
    status: "PENDING",
    userId: undefined,
    pageNo: 1,
  },
  selectedRequest: null,
  isFetchingDetail: false,
  isUpdating: false,
};

const requestSlice = createSlice({
  name: "requests",
  initialState,
  reducers: {
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.filters.pageNo = 1;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.filters.status = action.payload;
      state.filters.pageNo = 1;
    },
    setUserFilter: (state, action: PayloadAction<number | undefined>) => {
      state.filters.userId = action.payload;
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
      .addCase(fetchAllRequestsService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllRequestsService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllRequestsService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });

    builder
      .addCase(createRequestThunk.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createRequestThunk.fulfilled, (state, action) => {
        if (state.data) {
          state.data.content = [action.payload, ...state.data.content];
          state.data.totalElements += 1;
        }
        state.isCreating = false;
      })
      .addCase(createRequestThunk.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isCreating = false;
      });

    builder
      .addCase(fetchRequestByIdThunk.pending, (state) => {
        state.isFetchingDetail = true;
        state.error = null;
        state.selectedRequest = null;
      })
      .addCase(fetchRequestByIdThunk.fulfilled, (state, action) => {
        state.selectedRequest = action.payload;
        state.isFetchingDetail = false;
      })
      .addCase(fetchRequestByIdThunk.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isFetchingDetail = false;
      });

    builder
      .addCase(updateRequestThunk.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateRequestThunk.fulfilled, (state, action) => {
        state.selectedRequest = action.payload;
        state.isUpdating = false;
        if (state.data?.content) {
          state.data.content = state.data.content.map((req) =>
            req.id === action.payload.id ? action.payload : req
          );
        }
      })
      .addCase(updateRequestThunk.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isUpdating = false;
      });
  },
});

export const { setSearchFilter, setStatusFilter, setUserFilter, setPageNo, resetFilters, resetState } =
  requestSlice.actions;
export default requestSlice.reducer;
