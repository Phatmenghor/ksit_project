import {
  AllCourseFilterModel,
  CreateCourseModel,
  UpdatteCourseModel,
} from "@/model/master-data/course/type-course-model";
import { axiosClientWithAuth } from "@/utils/axios";

export async function getAllCourseService(data: AllCourseFilterModel) {
  try {
    const response = await axiosClientWithAuth.post(`/v1/courses/all`, data);
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching all courses:", error);
    return null;
  }
}

export async function createCourseService(data: CreateCourseModel) {
  try {
    const response = await axiosClientWithAuth.post(`/v1/courses`, data);
    return response.data.data;
  } catch (error: any) {
    // Extract error message from response if available
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error("Error creating course:", error);
    throw error;
  }
}

export async function updateCourseService(
  courseId: number,
  data: UpdatteCourseModel
) {
  try {
    const response = await axiosClientWithAuth.post(
      `/v1/courses/updateById/${courseId}`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    // Extract error message from response if available
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }

    console.error("Error updating course:", error);
    throw error;
  }
}

export async function deletedCourseService(courseId: number) {
  try {
    const response = await axiosClientWithAuth.delete(
      `/v1/courses/${courseId}`
    );
    return response.data.data;
  } catch (error: any) {
    return null;
  }
}

export async function DetailCourseService(courseId: number) {
  try {
    const response = await axiosClientWithAuth.get(`/v1/courses/${courseId}`);
    return response.data.data;
  } catch (error: any) {
    return null;
  }
}
