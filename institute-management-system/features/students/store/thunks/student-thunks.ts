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

export const fetchStudentsListThunk = createApiThunk<any, any>(
  "students/fetchList",
  async (params) => {
    const response = await axiosClientWithAuth.post<{ data: any }>(
      "/v1/students/all-student-list",
      params
    );
    return response.data.data;
  }
);

export const fetchStudentByIdThunk = createApiThunk<any, string>(
  "students/fetchById",
  async (id) => {
    const response = await axiosClientWithAuth.get<{ data: any }>(
      `/v1/students/${id}`
    );
    return response.data.data;
  }
);

export const addStudentThunk = createApiThunk<any, any>(
  "students/add",
  async (data) => {
    const response = await axiosClientWithAuth.post<{ data: any }>(
      "/v1/students/register",
      data
    );
    return response.data.data;
  }
);

export const updateStudentThunk = createApiThunk<any, { id: number; data: any }>(
  "students/update",
  async ({ id, data }) => {
    const response = await axiosClientWithAuth.put<{ data: any }>(
      `/v1/students/${id}`,
      data
    );
    return response.data.data;
  }
);
