import { StaffModel } from "@/model/user/staff/staff.respond.model";
import { DepartmentModel } from "../department/all-department-model";
import { SubjectModel } from "../subject/all-subject-model";

export interface AllCourseFilterModel {
  search?: string;
  departmentId?: number;
  status?: string;
  pageNo?: number;
  pageSize?: number;
}

export interface CreateCourseModel {
  code?: string;
  nameKH?: string;
  nameEn?: string;
  credit?: number;
  theory?: number;
  execute?: number;
  apply?: number;
  totalHour?: number;
  description?: string;
  purpose?: string;
  expectedOutcome?: string;
  status?: string;
  departmentId?: number;
  subjectId?: number;
  teacherId?: number;
}

export interface UpdatteCourseModel {
  code?: string;
  nameKH?: string;
  nameEn?: string;
  credit?: number;
  theory?: number;
  execute?: number;
  apply?: number;
  totalHour?: number;
  description?: string;
  purpose?: string;
  expectedOutcome?: string;
  status?: string;
  departmentId?: number;
  subjectId?: number;
  teacherId?: number;
}

export interface DetialCourseModel {
  id: number;
  code: string;
  nameKH: string;
  nameEn: string;
  credit: number;
  theory: number;
  execute: number;
  apply: number;
  totalHour: number;
  description: string;
  purpose: string;
  expectedOutcome: string;
  status: string;
  department: DepartmentModel;
  subject: SubjectModel;
  user: StaffModel;
  createdAt: string;
}
