import { RootState } from "@/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectPaymentData = (state: RootState) => state.payments.data;
export const selectPaymentIsLoading = (state: RootState) => state.payments.isLoading;
export const selectPaymentError = (state: RootState) => state.payments.error;
export const selectPaymentFilters = (state: RootState) => state.payments.filters;
export const selectPaymentOperations = (state: RootState) => state.payments.operations;

export const selectPaymentContent = createSelector(
  [selectPaymentData],
  (data) => data?.content || []
);

export const selectPaymentPagination = createSelector(
  [selectPaymentData],
  (data) => ({
    currentPage: data?.pageNo || 1,
    totalPages: data?.totalPages || 1,
    totalElements: data?.totalElements || 0,
    pageSize: data?.pageSize || 10,
  })
);
