import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { StatisticModel } from "@/model/statistic/statistic-model";
import { getAllStatisticService } from "@/service/statistic/statistic.service";

interface StatisticState {
  data: StatisticModel | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: StatisticState = {
  data: null,
  isLoading: false,
  error: null,
};

export const fetchAllStatisticThunk = createAsyncThunk<
  StatisticModel,
  void,
  { rejectValue: string }
>("statistic/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await getAllStatisticService();
    if (!response) {
      return rejectWithValue("Failed to fetch statistics");
    }
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch statistics");
  }
});

const statisticSlice = createSlice({
  name: "statistic",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllStatisticThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllStatisticThunk.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllStatisticThunk.rejected, (state, action) => {
        state.error = action.payload || "Failed to fetch statistics";
        state.isLoading = false;
      });
  },
});

export default statisticSlice.reducer;
