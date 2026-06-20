import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * Tracks, per list page, the query key of the data currently held in Redux.
 * Because the store is a singleton that survives client-side navigation, this
 * lets a list skip refetching when you return to it with the same filters
 * (cache hit) and refetch only when a filter/page actually changes (key miss).
 */
interface ListCacheState {
  keys: Record<string, string>;
}

const initialState: ListCacheState = {
  keys: {},
};

export const listCacheSlice = createSlice({
  name: "listCache",
  initialState,
  reducers: {
    markListLoaded(state, action: PayloadAction<{ id: string; key: string }>) {
      state.keys[action.payload.id] = action.payload.key;
    },
    // Force the next view of this list to refetch (e.g. after add/edit/delete).
    invalidateList(state, action: PayloadAction<string>) {
      delete state.keys[action.payload];
    },
    invalidateAllLists(state) {
      state.keys = {};
    },
  },
});

export const { markListLoaded, invalidateList, invalidateAllLists } =
  listCacheSlice.actions;
export default listCacheSlice.reducer;
