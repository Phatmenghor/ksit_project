import { createApiThunk } from "@/utils/axios/api-wrapper";
import { axiosClientWithAuth } from "@/utils/axios";
import { AllCourseFilterModel } from "@/model/master-data/course/type-course-model";
import { AllCourseModel } from "@/model/master-data/course/all-course-model";

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
