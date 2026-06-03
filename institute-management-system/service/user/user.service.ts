import { axiosClientWithAuth } from "@/utils/axios";
import {
  AddStaffModel,
  EditStaffModel,
  StaffListRequest,
} from "@/model/user/staff/staff.request.model";

export async function getAllStaffService(data: StaffListRequest) {
  try {
    // POST request to fetch all staff matching the filters
    const response = await axiosClientWithAuth.post(`/v1/staff/all`, data);
    return response.data.data; // Return the actual staff list data
  } catch (error: any) {
    // Check if the error response contains a message, throw it as Error
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error get all staff:", error); // Log error for debugging
    throw error; // Re-throw the error for further handling
  }
}

export async function getStaffByIdService(id: string) {
  try {
    // GET request to fetch a staff by ID
    const response = await axiosClientWithAuth.get(`/v1/staff/${id}`);
    return response.data.data; // Return staff detail data
  } catch (error: any) {
    // Extract and throw API error message if available
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error get staff by id:", error);
    throw error;
  }
}

export async function getStaffByTokenService() {
  try {
    // GET request to fetch a staff by ID
    const response = await axiosClientWithAuth.post(`/v1/auth/staff/token`);
    return response.data.data; // Return staff detail data
  } catch (error: any) {
    // Extract and throw API error message if available
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error get staff by token:", error);
    throw error;
  }
}

export async function getStudentByTokenService() {
  try {
    // GET request to fetch a staff by ID
    const response = await axiosClientWithAuth.post(`/v1/auth/student/token`);
    return response.data.data; // Return staff detail data
  } catch (error: any) {
    // Extract and throw API error message if available
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error get student by token:", error);
    throw error;
  }
}

export async function addStaffService(data: AddStaffModel) {
  try {
    // POST request to register/add a new staff
    const response = await axiosClientWithAuth.post(`/v1/staff/register`, data);
    return response.data.data; // Return created staff data
  } catch (error: any) {
    // Extract error message from response and throw it
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error adding staff:", error);
    throw error;
  }
}

export async function updateStaffService(
  staffId: number,
  data: EditStaffModel
) {
  try {
    // PUT request to update staff by ID
    const response = await axiosClientWithAuth.put(
      `/v1/staff/${staffId}`,
      data
    );
    return response.data.data; // Return updated staff data
  } catch (error: any) {
    // Handle and throw API error message if present
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error updating staff:", error);
    throw error;
  }
}

export async function deletedStaffService(id: number) {
  try {
    const response = await axiosClientWithAuth.delete(`/v1/staff/${id}`);
    return response.data.data;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error deleting staff:", error);
    throw error;
  }
}
