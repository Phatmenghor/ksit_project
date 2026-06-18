import { RootState } from "@/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectStaffState = (state: RootState) => state.staff;
export const selectStaffData = (state: RootState) => state.staff.data;
export const selectSelectedStaff = (state: RootState) => state.staff.selectedStaff;
export const selectStaffIsLoading = (state: RootState) => state.staff.isLoading;
export const selectStaffError = (state: RootState) => state.staff.error;
export const selectStaffFilters = (state: RootState) => state.staff.filters;
export const selectStaffOperations = (state: RootState) => state.staff.operations;

export const selectStaffContent = createSelector(
  [selectStaffData],
  (data) => data?.content || []
);

export const selectStaffPagination = createSelector(
  [selectStaffData],
  (data) => ({
    currentPage: data?.pageNo || 1,
    totalPages: data?.totalPages || 1,
    totalElements: data?.totalElements || 0,
    pageSize: data?.pageSize || 10,
  })
);
