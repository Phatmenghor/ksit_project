import { createApiThunk } from "@/utils/axios/api-wrapper";
import { axiosClientWithAuth } from "@/utils/axios";
import { RequestAllStudent, AllStudentModel } from "@/model/user/student/student.request.model";

export const fetchStudentComboboxService = createApiThunk<
  AllStudentModel,
  RequestAllStudent
>("students/combobox", async (params) => {
  const response = await axiosClientWithAuth.post<{ data: AllStudentModel }>(
    "/v1/students/all",
    params
  );
  return response.data.data;
});
