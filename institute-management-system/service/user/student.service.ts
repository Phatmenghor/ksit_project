import {
  AddStudentModel,
  AllStudentReportReq,
  EditStudentModel,
  GenerateMultipleStudent,
  RequestAllStudent,
} from "@/model/user/student/student.request.model";
import { axiosClientWithAuth } from "@/utils/axios";

// Base API endpoint for student-related requests
const endpoint = "/v1/students";

export async function getAllStudentsService(data: RequestAllStudent) {
  try {
    // POST request to fetch all students matching the filters
    const response = await axiosClientWithAuth.post(`${endpoint}/all`, data);
    return response.data.data; // Return the actual student list data
  } catch (error: any) {
    // Check if the error response contains a message, throw it as Error
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error get all student:", error); // Log error for debugging
    throw error; // Re-throw the error for further handling
  }
}

export async function getAllStudentsListService(data: AllStudentReportReq) {
  try {
    // POST request to fetch all students matching the filters
    const response = await axiosClientWithAuth.post(
      `/v1/students/all-student-list`,
      data
    );
    return response.data.data; // Return the actual student list data
  } catch (error: any) {
    // Check if the error response contains a message, throw it as Error
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error get all student report:", error); // Log error for debugging
    throw error; // Re-throw the error for further handling
  }
}

export async function getStudentByIdService(id: string) {
  try {
    // GET request to fetch a student by ID
    const response = await axiosClientWithAuth.get(`${endpoint}/${id}`);
    return response.data.data; // Return student detail data
  } catch (error: any) {
    // Extract and throw API error message if available
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error get student by id:", error);
    throw error;
  }
}

export async function generateMultipleStudentService(
  data: GenerateMultipleStudent
) {
  try {
    // POST request to register multiple students in batch
    const response = await axiosClientWithAuth.post(
      `${endpoint}/register/batch`,
      data
    );
    return response.data; // Return full response data (may include metadata)
  } catch (error: any) {
    // Extract error message from response and throw it
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error generate multiple student:", error);
    throw error;
  }
}

export async function addStudentService(data: AddStudentModel) {
  try {
    // POST request to register/add a new student
    const response = await axiosClientWithAuth.post(
      `${endpoint}/register`,
      data
    );
    return response.data.data; // Return created student data
  } catch (error: any) {
    // Extract error message from response and throw it
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error adding student:", error);
    throw error;
  }
}

export async function editStudentService(id: number, data: EditStudentModel) {
  try {
    // PUT request to update student by ID
    const response = await axiosClientWithAuth.put(`${endpoint}/${id}`, data);
    return response.data.data; // Return updated student data
  } catch (error: any) {
    // Handle and throw API error message if present
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error editing student:", error);
    throw error;
  }
}
