import { createApiThunk } from "@/utils/axios/api-wrapper";
import { axiosClientWithAuth } from "@/utils/axios";
import { AllCourseFilterModel } from "@/model/master-data/course/type-course-model";
import { AllCourseModel, CourseModel } from "@/model/master-data/course/all-course-model";

export const fetchCourseComboboxService = createApiThunk<
  AllCourseModel,
  AllCourseFilterModel
>("courses/combobox", async (params) => {
  const response = await axiosClientWithAuth.post<{ data: AllCourseModel }>(
    "/v1/courses/all",
    params
  );
  return response.data.data;
});

export const fetchAllCoursesService = createApiThunk<
  AllCourseModel,
  AllCourseFilterModel
>("courses/fetchAll", async (params) => {
  const response = await axiosClientWithAuth.post<{ data: AllCourseModel }>(
    "/v1/courses/all",
    params
  );
  return response.data.data;
});

export const deleteCourseService = createApiThunk<CourseModel, number>(
  "courses/delete",
  async (id) => {
    const response = await axiosClientWithAuth.delete<{ data: CourseModel }>(
      `/v1/courses/${id}`
    );
    return response.data.data;
  }
);
