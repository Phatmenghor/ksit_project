import { SemesterEnum, SemesterType } from "@/constants/constant";

export interface AllSemesterModel {
  content: SemesterModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface SemesterModel {
  id?: number;
  semester: SemesterEnum;
  startDate: string;
  endDate: string;
  academyYear: number;
  semesterType?: SemesterType;
  status: string;
}
