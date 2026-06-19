import { AllStudentModel, StudentModel } from "@/model/user/student/student.request.model";

export interface StudentFilters {
  search: string;
  classId: number | undefined;
  scheduleId: number | undefined;
  academicYear: number | undefined;
  courseId: number | undefined;
  pageNo: number;
}

export interface StudentOperations {
  isDeleting: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isFetchingDetail: boolean;
}

export interface StudentManagementState {
  data: AllStudentModel | null;
  rollbackSnapshot: AllStudentModel | null;
  isLoading: boolean;
  error: string | null;
  filters: StudentFilters;
  operations: StudentOperations;
  selectedStudent: any | null;
}
