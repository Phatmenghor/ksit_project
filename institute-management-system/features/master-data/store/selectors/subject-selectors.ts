import { RootState } from "@/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectSubjectState = (state: RootState) => state.subjects;
export const selectSubjectData = (state: RootState) => state.subjects.data;
export const selectSubjectIsLoading = (state: RootState) => state.subjects.isLoading;
export const selectSubjectError = (state: RootState) => state.subjects.error;
export const selectSubjectFilters = (state: RootState) => state.subjects.filters;
export const selectSubjectOperations = (state: RootState) => state.subjects.operations;

export const selectSubjectContent = createSelector(
  [selectSubjectData],
  (data) => data?.content || []
);

export const selectSubjectPagination = createSelector(
  [selectSubjectData],
  (data) => ({
    currentPage: data?.pageNo || 1,
    totalPages: data?.totalPages || 1,
    totalElements: data?.totalElements || 0,
    pageSize: data?.pageSize || 10,
  })
);
