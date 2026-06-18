import { RootState } from "@/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectRequestData = (state: RootState) => state.requests.data;
export const selectRequestIsLoading = (state: RootState) => state.requests.isLoading;
export const selectRequestError = (state: RootState) => state.requests.error;
export const selectRequestFilters = (state: RootState) => state.requests.filters;

export const selectRequestContent = createSelector(
  [selectRequestData],
  (data) => data?.content || []
);

export const selectRequestPagination = createSelector(
  [selectRequestData],
  (data) => ({
    currentPage: data?.pageNo || 1,
    totalPages: data?.totalPages || 1,
    totalElements: data?.totalElements || 0,
    pageSize: data?.pageSize || 10,
  })
);
