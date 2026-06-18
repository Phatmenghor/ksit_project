import {
  AllClassModel,
  ClassModel,
} from "@/model/master-data/class/all-class-model";

export interface ClassFilters {
  search: string;
  pageNo: number;
  majorId?: number;
  academyYear?: number;
}

export interface ClassOperations {
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isFetchingDetail: boolean;
}

export interface ClassManagementState {
  data: AllClassModel | null;
  rollbackSnapshot: AllClassModel | null;
  selectedClass: ClassModel | null;
  isLoading: boolean;
  error: string | null;
  filters: ClassFilters;
  operations: ClassOperations;
}
