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

export const selectSelectedRequest = (state: RootState) => state.requests.selectedRequest;
export const selectRequestIsFetchingDetail = (state: RootState) => state.requests.isFetchingDetail;
export const selectRequestIsUpdating = (state: RootState) => state.requests.isUpdating;

export const selectRequestTranscript = (state: RootState) => state.requests.transcript;
export const selectRequestIsFetchingTranscript = (state: RootState) => state.requests.isFetchingTranscript;
export const selectRequestHistory = (state: RootState) => state.requests.history;
export const selectRequestIsFetchingHistory = (state: RootState) => state.requests.isFetchingHistory;
