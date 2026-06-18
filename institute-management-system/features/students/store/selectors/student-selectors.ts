import { RootState } from "@/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectStudentData = (state: RootState) => state.studentList.data;
export const selectStudentIsLoading = (state: RootState) => state.studentList.isLoading;
export const selectStudentError = (state: RootState) => state.studentList.error;
export const selectStudentFilters = (state: RootState) => state.studentList.filters;
export const selectStudentOperations = (state: RootState) => state.studentList.operations;

export const selectStudentContent = createSelector(
  [selectStudentData],
  (data) => data?.content || []
);

export const selectStudentPagination = createSelector(
  [selectStudentData],
  (data) => ({
    currentPage: data?.pageNo || 1,
    totalPages: data?.totalPages || 1,
    totalElements: data?.totalElements || 0,
    pageSize: data?.pageSize || 10,
  })
);
