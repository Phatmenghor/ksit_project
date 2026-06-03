import {
  AddStudentModel,
  AllStudentReportReq,
  EditStudentModel,
  GenerateMultipleStudent,
  RequestAllStudent,
} from "@/model/user/student/student.request.model";
import { axiosClientWithAuth } from "@/utils/axios";

const endpoint = "/v1/students";

export async function getAllStudentsService(data: RequestAllStudent) {
  try {
    const response = await axiosClientWithAuth.post(`${endpoint}/all`, data);
    return response.data.data;
  } catch (error: any) {
    if (error.response?.data?.message) throw new Error(error.response.data.message);
    throw error;
  }
}

export async function getAllStudentsListService(data: AllStudentReportReq) {
  try {
    const response = await axiosClientWithAuth.post(`/v1/students/all-student-list`, data);
    return response.data.data;
  } catch (error: any) {
    if (error.response?.data?.message) throw new Error(error.response.data.message);
    throw error;
  }
}

export async function getStudentByIdService(id: string) {
  try {
    const response = await axiosClientWithAuth.get(`${endpoint}/${id}`);
    return response.data.data;
  } catch (error: any) {
    if (error.response?.data?.message) throw new Error(error.response.data.message);
    throw error;
  }
}

export async function generateMultipleStudentService(data: GenerateMultipleStudent) {
  try {
    const response = await axiosClientWithAuth.post(`${endpoint}/register/batch`, data);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) throw new Error(error.response.data.message);
    throw error;
  }
}

export async function addStudentService(data: AddStudentModel) {
  try {
    const response = await axiosClientWithAuth.post(`${endpoint}/register`, data);
    return response.data.data;
  } catch (error: any) {
    if (error.response?.data?.message) throw new Error(error.response.data.message);
    throw error;
  }
}

export async function editStudentService(id: number, data: EditStudentModel) {
  try {
    const response = await axiosClientWithAuth.put(`${endpoint}/${id}`, data);
    return response.data.data;
  } catch (error: any) {
    if (error.response?.data?.message) throw new Error(error.response.data.message);
    throw error;
  }
}
