import { AllCourseModel, CourseModel } from "@/model/master-data/course/all-course-model";

export interface CourseFilters {
  search: string;
  departmentId: number | undefined;
  pageNo: number;
}

export interface CourseOperations {
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export interface CourseManagementState {
  data: AllCourseModel | null;
  rollbackSnapshot: AllCourseModel | null;
  selectedCourse: CourseModel | null;
  isLoading: boolean;
  error: string | null;
  filters: CourseFilters;
  operations: CourseOperations;
}
