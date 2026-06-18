import { createApiThunk } from "@/utils/axios/api-wrapper";
import { axiosClientWithAuth } from "@/utils/axios";
import { AllStudentModel, RequestAllStudent, StudentModel } from "@/model/user/student/student.request.model";

export const fetchAllStudentsService = createApiThunk<
  AllStudentModel,
  RequestAllStudent
>("students/fetchAll", async (params) => {
  const response = await axiosClientWithAuth.post<{ data: AllStudentModel }>(
    "/v1/students/all",
    params
  );
  return response.data.data;
});

export const deleteStudentService = createApiThunk<StudentModel, number>(
  "students/delete",
  async (id) => {
    const response = await axiosClientWithAuth.put<{ data: StudentModel }>(
      `/v1/students/${id}`,
      { status: "INACTIVE" }
    );
    return response.data.data;
  }
);
