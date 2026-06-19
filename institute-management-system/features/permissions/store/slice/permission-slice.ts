import { createSlice } from "@reduxjs/toolkit";
import { PermissionState } from "../models/type/permission-type";
import {
  fetchUserMenuThunk,
  fetchUserRolesThunk,
  updateUserRolesThunk,
  updateUserPermissionsThunk,
} from "../thunks/permission-thunks";

const initialState: PermissionState = {
  menuData: [],
  userRoles: [],
  isLoadingMenu: false,
  isLoadingRoles: false,
  isUpdatingRoles: false,
  isUpdatingPermissions: false,
  error: null,
};

const permissionSlice = createSlice({
  name: "permissions",
  initialState,
  reducers: {
    clearPermissionData: (state) => {
      state.menuData = [];
      state.userRoles = [];
      state.error = null;
    },
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserMenuThunk.pending, (state) => {
        state.isLoadingMenu = true;
        state.error = null;
      })
      .addCase(fetchUserMenuThunk.fulfilled, (state, action) => {
        state.menuData = action.payload || [];
        state.isLoadingMenu = false;
      })
      .addCase(fetchUserMenuThunk.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoadingMenu = false;
      });

    builder
      .addCase(fetchUserRolesThunk.pending, (state) => {
        state.isLoadingRoles = true;
        state.error = null;
      })
      .addCase(fetchUserRolesThunk.fulfilled, (state, action) => {
        state.userRoles = action.payload || [];
        state.isLoadingRoles = false;
      })
      .addCase(fetchUserRolesThunk.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoadingRoles = false;
      });

    builder
      .addCase(updateUserRolesThunk.pending, (state) => {
        state.isUpdatingRoles = true;
        state.error = null;
      })
      .addCase(updateUserRolesThunk.fulfilled, (state, action) => {
        state.userRoles = action.payload || [];
        state.isUpdatingRoles = false;
      })
      .addCase(updateUserRolesThunk.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isUpdatingRoles = false;
      });

    builder
      .addCase(updateUserPermissionsThunk.pending, (state) => {
        state.isUpdatingPermissions = true;
        state.error = null;
      })
      .addCase(updateUserPermissionsThunk.fulfilled, (state, action) => {
        state.menuData = action.payload || [];
        state.isUpdatingPermissions = false;
      })
      .addCase(updateUserPermissionsThunk.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isUpdatingPermissions = false;
      });
  },
});

export const { clearPermissionData, resetState } = permissionSlice.actions;
export default permissionSlice.reducer;
