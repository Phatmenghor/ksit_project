import { RootState } from "@/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectDepartmentState = (state: RootState) => state.departments;
export const selectDepartmentData = (state: RootState) => state.departments.data;
export const selectSelectedDepartment = (state: RootState) => state.departments.selectedDepartment;
export const selectDepartmentIsLoading = (state: RootState) => state.departments.isLoading;
export const selectDepartmentError = (state: RootState) => state.departments.error;
export const selectDepartmentFilters = (state: RootState) => state.departments.filters;
export const selectDepartmentOperations = (state: RootState) => state.departments.operations;

export const selectDepartmentContent = createSelector(
  [selectDepartmentData],
  (data) => data?.content || []
);

export const selectDepartmentPagination = createSelector(
  [selectDepartmentData],
  (data) => ({
    currentPage: data?.pageNo || 1,
    totalPages: data?.totalPages || 1,
    totalElements: data?.totalElements || 0,
    pageSize: data?.pageSize || 10,
  })
);
