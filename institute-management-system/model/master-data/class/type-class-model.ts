export interface AllClassFilterModel {
  search?: string;
  academyYear?: number;
  majorId?: number;
  status?: string;
  pageNo?: number;
  pageSize?: number;
}

export interface CreateClassModel {
  code: string;
  majorId: number;
  academyYear: number;
  degree: string;
  yearLevel: string;
  status: string;
}

export interface UpdateClassModel {
  code: string;
  majorId: number;
  academyYear: number;
  degree: string;
  yearLevel: string;
  status: string;
}
