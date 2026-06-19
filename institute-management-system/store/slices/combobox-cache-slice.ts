import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CacheEntry {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  page: number;
  lastPage: boolean;
  search: string;
}

interface ComboboxCacheState {
  entries: Record<string, CacheEntry>;
}

const initialState: ComboboxCacheState = {
  entries: {},
};

export const comboboxCacheSlice = createSlice({
  name: "comboboxCache",
  initialState,
  reducers: {
    setEntry(state, action: PayloadAction<{ key: string; entry: CacheEntry }>) {
      state.entries[action.payload.key] = action.payload.entry;
    },
    appendEntry(
      state,
      action: PayloadAction<{
        key: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: any[];
        page: number;
        lastPage: boolean;
      }>
    ) {
      const existing = state.entries[action.payload.key];
      if (existing) {
        existing.data = [...existing.data, ...action.payload.data];
        existing.page = action.payload.page;
        existing.lastPage = action.payload.lastPage;
      }
    },
    clearEntry(state, action: PayloadAction<string>) {
      delete state.entries[action.payload];
    },
  },
});

export const { setEntry, appendEntry, clearEntry } =
  comboboxCacheSlice.actions;
export default comboboxCacheSlice.reducer;
