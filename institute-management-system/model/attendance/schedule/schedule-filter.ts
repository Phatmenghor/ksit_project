export interface ScheduleFilterModel {
  search?: string;
  classId?: number;
  roomId?: number;
  teacherId?: number;
  studentId?: number;
  academyYear?: number;
  semester?: string;
  dayOfWeek?: string;
  status?: string;
  pageNo?: number;
  pageSize?: number;
}

export interface DuplicateFilterModel {
  sourceClassId: number;
  sourceSemesterId: number;
  targetClassId: number;
  targetSemesterId: number;
}
