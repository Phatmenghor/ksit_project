import { RootState } from "@/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectScheduleData = (state: RootState) => state.scheduleList.data;
export const selectScheduleIsLoading = (state: RootState) => state.scheduleList.isLoading;
export const selectScheduleError = (state: RootState) => state.scheduleList.error;
export const selectScheduleFilters = (state: RootState) => state.scheduleList.filters;
export const selectSelectedSchedule = (state: RootState) => state.scheduleList.selectedSchedule;
export const selectScheduleOperations = (state: RootState) => state.scheduleList.operations;

export const selectScheduleContent = createSelector(
  [selectScheduleData],
  (data) => data?.content || []
);

export const selectSchedulePagination = createSelector(
  [selectScheduleData],
  (data) => ({
    currentPage: data?.pageNo || 1,
    totalPages: data?.totalPages || 1,
    totalElements: data?.totalElements || 0,
    pageSize: data?.pageSize || 10,
  })
);
