import { SemesterEnum, YearLevelEnum } from "@/constants/constant";

export interface AllSemesterFilterModel {
  search?: string;
  academyYear?: number;
  status?: string;
  pageNo?: number;
  pageSize?: number;
}

export interface CreateSemesterModel {
  startDate?: string;
  endDate?: string;
  academyYear?: number;
  semester?: SemesterEnum;
  status?: string;
}

export interface UpdateSemesterModel {
  startDate?: string;
  endDate?: string;
  academyYear?: number;
  yearLevel?: YearLevelEnum;
  semester?: SemesterEnum;
  status?: string;
}
