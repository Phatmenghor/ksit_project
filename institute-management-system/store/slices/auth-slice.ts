import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { LoginRequest, LoginResponse } from "@/model/auth/auth.model";
import { loginService, ChangePasswordService } from "@/service/auth/auth.service";
import { ChangePasswordModel, EditStaffModel } from "@/model/user/staff/staff.request.model";
import { EditStudentModel } from "@/model/user/student/student.request.model";
import { getStaffByTokenService, getStudentByTokenService, updateStaffService } from "@/service/user/user.service";
import { editStudentService } from "@/service/user/student.service";

interface AuthState {
  user: LoginResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  studentProfile: any | null;
  staffProfile: any | null;
  isProfileLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  studentProfile: null,
  staffProfile: null,
  isProfileLoading: false,
};

export const loginThunk = createAsyncThunk<LoginResponse, LoginRequest, { rejectValue: string }>(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await loginService(credentials);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

export const changePasswordThunk = createAsyncThunk<any, ChangePasswordModel, { rejectValue: string }>(
  "auth/changePassword",
  async (data, { rejectWithValue }) => {
    try {
      const response = await ChangePasswordService(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Change password failed");
    }
  }
);

export const fetchStudentProfileThunk = createAsyncThunk<any, void, { rejectValue: string }>(
  "auth/fetchStudentProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getStudentByTokenService();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch student profile");
    }
  }
);

export const fetchStaffProfileThunk = createAsyncThunk<any, void, { rejectValue: string }>(
  "auth/fetchStaffProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getStaffByTokenService();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch staff profile");
    }
  }
);

export const updateStudentProfileThunk = createAsyncThunk<
  any,
  { id: number; data: EditStudentModel },
  { rejectValue: string }
>(
  "auth/updateStudentProfile",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await editStudentService(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update student profile");
    }
  }
);

export const updateStaffProfileThunk = createAsyncThunk<
  any,
  { id: number; data: EditStaffModel },
  { rejectValue: string }
>(
  "auth/updateStaffProfile",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await updateStaffService(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update staff profile");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.studentProfile = null;
      state.staffProfile = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Login failed";
      });

    builder
      .addCase(changePasswordThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePasswordThunk.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(changePasswordThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Change password failed";
      });

    builder
      .addCase(fetchStudentProfileThunk.pending, (state) => {
        state.isProfileLoading = true;
        state.error = null;
      })
      .addCase(fetchStudentProfileThunk.fulfilled, (state, action) => {
        state.isProfileLoading = false;
        state.studentProfile = action.payload;
      })
      .addCase(fetchStudentProfileThunk.rejected, (state, action) => {
        state.isProfileLoading = false;
        state.error = action.payload || "Failed to fetch profile";
      });

    builder
      .addCase(fetchStaffProfileThunk.pending, (state) => {
        state.isProfileLoading = true;
        state.error = null;
      })
      .addCase(fetchStaffProfileThunk.fulfilled, (state, action) => {
        state.isProfileLoading = false;
        state.staffProfile = action.payload;
      })
      .addCase(fetchStaffProfileThunk.rejected, (state, action) => {
        state.isProfileLoading = false;
        state.error = action.payload || "Failed to fetch profile";
      });

    builder
      .addCase(updateStudentProfileThunk.pending, (state) => {
        state.isProfileLoading = true;
        state.error = null;
      })
      .addCase(updateStudentProfileThunk.fulfilled, (state, action) => {
        state.isProfileLoading = false;
        state.studentProfile = action.payload;
      })
      .addCase(updateStudentProfileThunk.rejected, (state, action) => {
        state.isProfileLoading = false;
        state.error = action.payload || "Failed to update profile";
      });

    builder
      .addCase(updateStaffProfileThunk.pending, (state) => {
        state.isProfileLoading = true;
        state.error = null;
      })
      .addCase(updateStaffProfileThunk.fulfilled, (state, action) => {
        state.isProfileLoading = false;
        state.staffProfile = action.payload;
      })
      .addCase(updateStaffProfileThunk.rejected, (state, action) => {
        state.isProfileLoading = false;
        state.error = action.payload || "Failed to update profile";
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
