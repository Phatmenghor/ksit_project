import { YearLevelEnum } from "@/constants/constant";
import { MajorModel } from "../major/all-major-model";

export interface AllClassModel {
  content: ClassModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ClassModel {
  id: number;
  code: string;
  academyYear: YearLevelEnum;
  degree: string;
  yearLevel: YearLevelEnum;
  status: string;
  major: MajorModel;
  createdAt: string;
}
