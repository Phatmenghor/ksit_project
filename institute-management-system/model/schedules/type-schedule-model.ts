import { SemesterEnum, YearLevelEnum } from "@/constants/constant";

export interface AllScheduleFilterModel {
  search?: string;
  classId?: number;
  roomId?: number;
  teacherId?: number;
  academyYear?: number;
  semester?: string;
  dayOfWeek?: string;
  status?: string;
  pageNo?: number;
  pageSize?: number;
}

export interface CreateScheduleModel {
  startTime?: string;
  endTime?: string;
  day?: string;
  classId?: number;
  teacherId?: number;
  courseId?: number;
  roomId?: number;
  yearLevel?: YearLevelEnum;
  semesterId?: number;
  status?: string;
}

export interface UpdateScheduleModel {
  startTime?: string;
  endTime?: string;
  day?: string;
  classId?: number;
  yearLevel?: YearLevelEnum;
  teacherId?: number;
  courseId?: number;
  roomId?: number;
  semesterId?: number;
  status?: string;
}
