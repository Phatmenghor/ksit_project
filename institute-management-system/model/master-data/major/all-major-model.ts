import { DepartmentModel } from "../department/all-department-model";

export interface AllMajorModel {
  content: MajorModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface MajorModel {
  id: number;
  code: string;
  name: string;
  status: string;
  department: DepartmentModel;
  createdAt: string;
  updatedAt: any;
}
