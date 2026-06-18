import { RootState } from "@/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectClassState = (state: RootState) => state.classes;
export const selectClassData = (state: RootState) => state.classes.data;
export const selectSelectedClass = (state: RootState) => state.classes.selectedClass;
export const selectClassIsLoading = (state: RootState) => state.classes.isLoading;
export const selectClassError = (state: RootState) => state.classes.error;
export const selectClassFilters = (state: RootState) => state.classes.filters;
export const selectClassOperations = (state: RootState) => state.classes.operations;

export const selectClassContent = createSelector(
  [selectClassData],
  (data) => data?.content || []
);

export const selectClassPagination = createSelector(
  [selectClassData],
  (data) => ({
    currentPage: data?.pageNo || 1,
    totalPages: data?.totalPages || 1,
    totalElements: data?.totalElements || 0,
    pageSize: data?.pageSize || 10,
  })
);
