import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PaymentManagementState } from "../models/type/payment-type";
import {
  fetchAllPaymentsService,
  createPaymentByTokenService,
  updatePaymentByTokenService,
  deletePaymentService,
} from "../thunks/payment-thunks";
import { PaymentModel } from "@/model/payment/payment-model";

const initialState: PaymentManagementState = {
  data: null,
  rollbackSnapshot: null,
  isLoading: true,
  error: null,
  filters: {
    search: "",
    userId: undefined,
    pageNo: 1,
  },
  operations: {
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
  },
};

const paymentSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    setPageNo: (state, action: PayloadAction<number>) => {
      state.filters.pageNo = action.payload;
    },
    setUserFilter: (state, action: PayloadAction<number | undefined>) => {
      state.filters.userId = action.payload;
      state.filters.pageNo = 1;
    },
    resetState: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllPaymentsService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllPaymentsService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllPaymentsService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });

    builder
      .addCase(createPaymentByTokenService.pending, (state) => {
        state.operations.isCreating = true;
        state.error = null;
      })
      .addCase(createPaymentByTokenService.fulfilled, (state, action) => {
        if (state.data) {
          state.data.content = [action.payload, ...state.data.content];
          state.data.totalElements += 1;
          state.data.totalPages = Math.ceil(state.data.totalElements / state.data.pageSize);
        }
        state.operations.isCreating = false;
      })
      .addCase(createPaymentByTokenService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isCreating = false;
      });

    builder
      .addCase(updatePaymentByTokenService.pending, (state) => {
        state.operations.isUpdating = true;
        state.error = null;
      })
      .addCase(updatePaymentByTokenService.fulfilled, (state, action) => {
        if (state.data) {
          state.data.content = state.data.content.map((p) =>
            p.id === action.payload.id ? action.payload : p
          );
        }
        state.operations.isUpdating = false;
      })
      .addCase(updatePaymentByTokenService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isUpdating = false;
      });

    builder
      .addCase(deletePaymentService.pending, (state, action) => {
        state.operations.isDeleting = true;
        state.error = null;
        state.rollbackSnapshot = state.data ? JSON.parse(JSON.stringify(state.data)) : null;
        const id = action.meta.arg as number;
        if (state.data) {
          state.data.content = state.data.content.filter((p) => p.id !== id);
          state.data.totalElements -= 1;
          state.data.totalPages = Math.ceil(state.data.totalElements / state.data.pageSize);
        }
      })
      .addCase(deletePaymentService.fulfilled, (state) => {
        state.operations.isDeleting = false;
        state.rollbackSnapshot = null;
      })
      .addCase(deletePaymentService.rejected, (state, action) => {
        state.operations.isDeleting = false;
        state.error = action.payload as string;
        if (state.rollbackSnapshot) {
          state.data = state.rollbackSnapshot;
          state.rollbackSnapshot = null;
        }
      });
  },
});

export const { setPageNo, setUserFilter, resetState } = paymentSlice.actions;
export default paymentSlice.reducer;
