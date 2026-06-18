import {
  AllSubjectModel,
  SubjectModel,
} from "@/model/master-data/subject/all-subject-model";

export interface SubjectFilters {
  search: string;
  pageNo: number;
}

export interface SubjectOperations {
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isFetchingDetail: boolean;
}

export interface SubjectManagementState {
  data: AllSubjectModel | null;
  rollbackSnapshot: AllSubjectModel | null;
  selectedSubject: SubjectModel | null;
  isLoading: boolean;
  error: string | null;
  filters: SubjectFilters;
  operations: SubjectOperations;
}
