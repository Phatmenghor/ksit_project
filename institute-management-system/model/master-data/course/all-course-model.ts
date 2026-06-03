import { StaffModel } from "@/model/user/staff/staff.respond.model";
import { DepartmentModel } from "../department/all-department-model";
import { SubjectModel } from "../subject/all-subject-model";

export interface AllCourseModel {
  content: CourseModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface CourseModel {
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
