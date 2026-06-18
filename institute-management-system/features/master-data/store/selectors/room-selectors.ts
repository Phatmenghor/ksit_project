import { RootState } from "@/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectRoomState = (state: RootState) => state.rooms;
export const selectRoomData = (state: RootState) => state.rooms.data;
export const selectRoomIsLoading = (state: RootState) => state.rooms.isLoading;
export const selectRoomError = (state: RootState) => state.rooms.error;
export const selectRoomFilters = (state: RootState) => state.rooms.filters;
export const selectRoomOperations = (state: RootState) => state.rooms.operations;

export const selectRoomContent = createSelector(
  [selectRoomData],
  (data) => data?.content || []
);

export const selectRoomPagination = createSelector(
  [selectRoomData],
  (data) => ({
    currentPage: data?.pageNo || 1,
    totalPages: data?.totalPages || 1,
    totalElements: data?.totalElements || 0,
    pageSize: data?.pageSize || 10,
  })
);
