export interface AllMajorFilterModel {
  search?: string;
  status?: string;
  departmentId?: number;
  pageNo?: number;
  pageSize?: number;
}

export interface CreateMajorModel {
  code: string;
  name: string;
  departmentId: number;
  status?: string;
}

export interface UpdateMajorModel {
  code?: string;
  name?: string;
  departmentId?: number;
  status?: string;
}
