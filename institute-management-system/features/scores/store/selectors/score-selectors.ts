import { RootState } from "@/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectSubmittedScoreData = (state: RootState) => state.submittedScores.data;
export const selectSubmittedScoreIsLoading = (state: RootState) => state.submittedScores.isLoading;
export const selectSubmittedScoreError = (state: RootState) => state.submittedScores.error;
export const selectSubmittedScoreFilters = (state: RootState) => state.submittedScores.filters;
export const selectSubmittedScoreConfiguration = (state: RootState) => state.submittedScores.configuration;
export const selectSelectedSubmission = (state: RootState) => state.submittedScores.selectedSubmission;
export const selectSubmittedScoreOperations = (state: RootState) => state.submittedScores.operations;

export const selectSubmittedScoreContent = createSelector(
  [selectSubmittedScoreData],
  (data) => data?.content || []
);

export const selectSubmittedScorePagination = createSelector(
  [selectSubmittedScoreData],
  (data) => ({
    currentPage: data?.pageNo || 1,
    totalPages: data?.totalPages || 1,
    totalElements: data?.totalElements || 0,
    pageSize: data?.pageSize || 10,
  })
);
