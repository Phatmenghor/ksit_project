import { RootState } from "@/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectMajorState = (state: RootState) => state.majors;
export const selectMajorData = (state: RootState) => state.majors.data;
export const selectSelectedMajor = (state: RootState) => state.majors.selectedMajor;
export const selectMajorIsLoading = (state: RootState) => state.majors.isLoading;
export const selectMajorError = (state: RootState) => state.majors.error;
export const selectMajorFilters = (state: RootState) => state.majors.filters;
export const selectMajorOperations = (state: RootState) => state.majors.operations;

export const selectMajorContent = createSelector(
  [selectMajorData],
  (data) => data?.content || []
);

export const selectMajorPagination = createSelector(
  [selectMajorData],
  (data) => ({
    currentPage: data?.pageNo || 1,
    totalPages: data?.totalPages || 1,
    totalElements: data?.totalElements || 0,
    pageSize: data?.pageSize || 10,
  })
);
