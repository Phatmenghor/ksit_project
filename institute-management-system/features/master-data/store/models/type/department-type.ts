import {
  AllDepartmentModel,
  DepartmentModel,
} from "@/model/master-data/department/all-department-model";

export interface DepartmentFilters {
  search: string;
  pageNo: number;
}

export interface DepartmentOperations {
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isFetchingDetail: boolean;
}

export interface DepartmentManagementState {
  data: AllDepartmentModel | null;
  rollbackSnapshot: AllDepartmentModel | null;
  selectedDepartment: DepartmentModel | null;
  isLoading: boolean;
  error: string | null;
  filters: DepartmentFilters;
  operations: DepartmentOperations;
}
