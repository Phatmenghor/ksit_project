import { RootState } from "@/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectSemesterState = (state: RootState) => state.semesters;
export const selectSemesterData = (state: RootState) => state.semesters.data;
export const selectSemesterIsLoading = (state: RootState) => state.semesters.isLoading;
export const selectSemesterError = (state: RootState) => state.semesters.error;
export const selectSemesterFilters = (state: RootState) => state.semesters.filters;
export const selectSemesterOperations = (state: RootState) => state.semesters.operations;

export const selectSemesterContent = createSelector(
  [selectSemesterData],
  (data) => data?.content || []
);

export const selectSemesterPagination = createSelector(
  [selectSemesterData],
  (data) => ({
    currentPage: data?.pageNo || 1,
    totalPages: data?.totalPages || 1,
    totalElements: data?.totalElements || 0,
    pageSize: data?.pageSize || 10,
  })
);
