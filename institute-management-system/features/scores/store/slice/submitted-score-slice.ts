import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SubmittedScoreState } from "../models/type/score-type";
import {
  fetchAllSubmittedScoresService,
  intiStudentsScoreThunk,
  updateStudentsScoreThunk,
  submittedScoreThunk,
  getSubmissionScoreByIdThunk,
  getConfigurationScoreThunk,
  configureScoreThunk,
} from "../thunks/submitted-score-thunks";

const initialState: SubmittedScoreState = {
  data: null,
  isLoading: true,
  error: null,
  filters: {
    search: "",
    classId: undefined,
    scheduleId: undefined,
    academicYear: new Date().getFullYear(),
    semester: "ALL",
    status: "SUBMITTED",
    pageNo: 1,
  },
  configuration: null,
  selectedSubmission: null,
  operations: {
    isSubmitting: false,
    isInitializing: false,
    isUpdating: false,
    isConfiguring: false,
  },
};

const submittedScoreSlice = createSlice({
  name: "submittedScores",
  initialState,
  reducers: {
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.filters.pageNo = 1;
    },
    setClassFilter: (state, action: PayloadAction<number | undefined>) => {
      state.filters.classId = action.payload;
      state.filters.pageNo = 1;
    },
    setScheduleFilter: (state, action: PayloadAction<number | undefined>) => {
      state.filters.scheduleId = action.payload;
      state.filters.pageNo = 1;
    },
    setAcademicYearFilter: (state, action: PayloadAction<number>) => {
      state.filters.academicYear = action.payload;
      state.filters.pageNo = 1;
    },
    setSemesterFilter: (state, action: PayloadAction<string>) => {
      state.filters.semester = action.payload;
      state.filters.pageNo = 1;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.filters.status = action.payload;
      state.filters.pageNo = 1;
    },
    setPageNo: (state, action: PayloadAction<number>) => {
      state.filters.pageNo = action.payload;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    resetState: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllSubmittedScoresService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllSubmittedScoresService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllSubmittedScoresService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });

    builder
      .addCase(intiStudentsScoreThunk.pending, (state) => {
        state.operations.isInitializing = true;
        state.error = null;
      })
      .addCase(intiStudentsScoreThunk.fulfilled, (state) => {
        state.operations.isInitializing = false;
      })
      .addCase(intiStudentsScoreThunk.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isInitializing = false;
      });

    builder
      .addCase(updateStudentsScoreThunk.pending, (state) => {
        state.operations.isUpdating = true;
        state.error = null;
      })
      .addCase(updateStudentsScoreThunk.fulfilled, (state) => {
        state.operations.isUpdating = false;
      })
      .addCase(updateStudentsScoreThunk.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isUpdating = false;
      });

    builder
      .addCase(submittedScoreThunk.pending, (state) => {
        state.operations.isSubmitting = true;
        state.error = null;
      })
      .addCase(submittedScoreThunk.fulfilled, (state) => {
        state.operations.isSubmitting = false;
      })
      .addCase(submittedScoreThunk.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isSubmitting = false;
      });

    builder
      .addCase(getSubmissionScoreByIdThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.selectedSubmission = null;
      })
      .addCase(getSubmissionScoreByIdThunk.fulfilled, (state, action) => {
        state.selectedSubmission = action.payload;
        state.isLoading = false;
      })
      .addCase(getSubmissionScoreByIdThunk.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });

    builder
      .addCase(getConfigurationScoreThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getConfigurationScoreThunk.fulfilled, (state, action) => {
        state.configuration = action.payload;
        state.isLoading = false;
      })
      .addCase(getConfigurationScoreThunk.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });

    builder
      .addCase(configureScoreThunk.pending, (state) => {
        state.operations.isConfiguring = true;
        state.error = null;
      })
      .addCase(configureScoreThunk.fulfilled, (state, action) => {
        state.configuration = action.payload;
        state.operations.isConfiguring = false;
      })
      .addCase(configureScoreThunk.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isConfiguring = false;
      });
  },
});

export const {
  setSearchFilter,
  setClassFilter,
  setScheduleFilter,
  setAcademicYearFilter,
  setSemesterFilter,
  setStatusFilter,
  setPageNo,
  resetFilters,
  resetState,
} = submittedScoreSlice.actions;
export default submittedScoreSlice.reducer;
