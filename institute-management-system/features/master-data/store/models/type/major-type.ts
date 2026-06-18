import {
  AllMajorModel,
  MajorModel,
} from "@/model/master-data/major/all-major-model";

export interface MajorFilters {
  search: string;
  pageNo: number;
  departmentId?: number;
}

export interface MajorOperations {
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isFetchingDetail: boolean;
}

export interface MajorManagementState {
  data: AllMajorModel | null;
  rollbackSnapshot: AllMajorModel | null;
  selectedMajor: MajorModel | null;
  isLoading: boolean;
  error: string | null;
  filters: MajorFilters;
  operations: MajorOperations;
}
