import { LoginRequest, LoginResponse } from "@/model/auth/auth.model";
import { ApiResponse } from "@/model/index-model";
import {
  ChangePasswordByAdminModel,
  ChangePasswordModel,
} from "@/model/user/staff/staff.request.model";
import { axiosClient, axiosClientWithAuth } from "@/utils/axios";
import { clearRoles, storeRoles } from "@/utils/local-storage/user-info/roles";
import { logoutUser, storeToken } from "@/utils/local-storage/user-info/token";
import {
  clearUserId,
  storeUserId,
} from "@/utils/local-storage/user-info/userId";
import {
  clearUsername,
  storeUsername,
} from "@/utils/local-storage/user-info/username";
import axios from "axios";

export const loginService = async (credentail: LoginRequest) => {
  try {
    const response = await axiosClient.post<ApiResponse<LoginResponse>>(
      `/v1/auth/login`,
      credentail
    );

    const data = response.data.data;

    storeUserId(data.userId);
    storeToken(data.accessToken);
    storeRoles(data.roles);
    storeUsername(data.username);

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Extract error message from backend if available
      const message =
        error.response?.data?.message || "Login failed. Please try again.";
      throw new Error(message);
    }

    // Unexpected (non-Axios) error
    throw new Error("An unexpected error occurred. Please try again.");
  }
};

// export const logoutService = async () => {
//   try {
//     const response = await axios.post(`/v1/auth/logout`);

//     const data = response.data.data;

//     clearUserId();
//     clearRoles();
//     clearUsername();
//     logoutUser();

//     return data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       // Extract error message from backend if available
//       const message =
//         error.response?.data?.message || "Logout failed. Please try again.";
//       throw new Error(message);
//     }

//     // Unexpected (non-Axios) error
//     throw new Error("An unexpected error occurred. Please try again.");
//   }
// };

export const AdminChangePasswordService = async (
  data: ChangePasswordByAdminModel
) => {
  try {
    const response = await axiosClientWithAuth.post(
      `/v1/auth/change-password-by-admin`,
      data
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Extract error message from backend if available
      const message =
        error.response?.data?.message ||
        "Change password failed. Please try again.";
      throw new Error(message);
    }

    // Unexpected (non-Axios) error
    throw new Error("An unexpected error occurred. Please try again.");
  }
};

export const ChangePasswordService = async (data: ChangePasswordModel) => {
  try {
    const response = await axiosClientWithAuth.post(
      `/v1/auth/change-password`,
      data
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Extract error message from backend if available
      const message =
        error.response?.data?.message ||
        "Change password failed. Please try again.";
      throw new Error(message);
    }

    // Unexpected (non-Axios) error
    throw new Error("An unexpected error occurred. Please try again.");
  }
};
