export interface AllSubjectFilterModel {
  search?: string;
  status?: string;
  pageNo?: number;
  pageSize?: number;
}

export interface CreateSubjectModel {
  name?: string;
  status?: string;
}

export interface UpdateSubjectModel {
  name?: string;
  status?: string;
}
