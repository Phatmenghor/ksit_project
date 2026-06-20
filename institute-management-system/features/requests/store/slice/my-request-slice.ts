import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MyRequestState } from "../models/type/request-type";
import { fetchMyRequestsService } from "../thunks/my-request-thunks";
import { createRequestThunk, deleteRequestThunk } from "../thunks/request-thunks";

const initialState: MyRequestState = {
  data: null,
  isLoading: true,
  error: null,
  isCreating: false,
  filters: {
    search: "",
    status: "PENDING",
    pageNo: 1,
  },
};

const myRequestSlice = createSlice({
  name: "myRequests",
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
    setPageNo: (state, action: PayloadAction<number>) => {
      state.filters.pageNo = action.payload;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyRequestsService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyRequestsService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchMyRequestsService.rejected, (state, action) => {
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
      .addCase(deleteRequestThunk.fulfilled, (state, action) => {
        if (state.data?.content) {
          state.data.content = state.data.content.filter((req) => req.id !== action.payload.id);
          state.data.totalElements = Math.max(0, state.data.totalElements - 1);
        }
      });
  },
});

export const {
  setSearchFilter,
  setStatusFilter,
  setPageNo,
  resetFilters,
  resetState,
} = myRequestSlice.actions;
export default myRequestSlice.reducer;
