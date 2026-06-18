import { RootState } from "@/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectCourseData = (state: RootState) => state.courses.data;
export const selectCourseIsLoading = (state: RootState) => state.courses.isLoading;
export const selectCourseError = (state: RootState) => state.courses.error;
export const selectCourseFilters = (state: RootState) => state.courses.filters;
export const selectCourseOperations = (state: RootState) => state.courses.operations;
export const selectSelectedCourse = (state: RootState) => state.courses.selectedCourse;

export const selectCourseContent = createSelector(
  [selectCourseData],
  (data) => data?.content || []
);

export const selectCoursePagination = createSelector(
  [selectCourseData],
  (data) => ({
    currentPage: data?.pageNo || 1,
    totalPages: data?.totalPages || 1,
    totalElements: data?.totalElements || 0,
    pageSize: data?.pageSize || 10,
  })
);
