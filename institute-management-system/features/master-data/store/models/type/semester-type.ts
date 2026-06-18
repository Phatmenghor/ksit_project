import {
  AllSemesterModel,
  SemesterModel,
} from "@/model/master-data/semester/semester-model";

export interface SemesterFilters {
  search: string;
  pageNo: number;
  academyYear?: number;
}

export interface SemesterOperations {
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isFetchingDetail: boolean;
}

export interface SemesterManagementState {
  data: AllSemesterModel | null;
  rollbackSnapshot: AllSemesterModel | null;
  selectedSemester: SemesterModel | null;
  isLoading: boolean;
  error: string | null;
  filters: SemesterFilters;
  operations: SemesterOperations;
}
