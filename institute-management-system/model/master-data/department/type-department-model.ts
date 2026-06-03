export interface AllDepartmentFilterModel {
  search?: string;
  status?: string;
  pageNo?: number;
  pageSize?: number;
}

export interface CreateDepartmentModel {
  name: string;
  code: string;
  urlLogo?: string;
  status?: string;
}

export interface UpdateDepartmentModel {
  name?: string;
  status?: string;
  code?: string;
  urlLogo?: string;
}
