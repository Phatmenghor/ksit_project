import { RootState } from "@/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectMyRequestData = (state: RootState) => state.myRequests.data;
export const selectMyRequestIsLoading = (state: RootState) => state.myRequests.isLoading;
export const selectMyRequestIsCreating = (state: RootState) => state.myRequests.isCreating;
export const selectMyRequestError = (state: RootState) => state.myRequests.error;
export const selectMyRequestFilters = (state: RootState) => state.myRequests.filters;

export const selectMyRequestContent = createSelector(
  [selectMyRequestData],
  (data) => data?.content || []
);

export const selectMyRequestPagination = createSelector(
  [selectMyRequestData],
  (data) => ({
    currentPage: data?.pageNo || 1,
    totalPages: data?.totalPages || 1,
    totalElements: data?.totalElements || 0,
    pageSize: data?.pageSize || 10,
  })
);
