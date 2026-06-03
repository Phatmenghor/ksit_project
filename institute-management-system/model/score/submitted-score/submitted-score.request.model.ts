export interface SubmittedScoreParam {
  search?: string;
  status?: string;
  teacherId?: number;
  scheduleId?: number;
  classId?: number;
  courseId?: number;
  academicYear?: number;
  studentId?: number;
  semester?: string;
  pageNo?: number;
  pageSize?: number;
}
export interface ConfigureScoreModel {
  attendancePercentage?: number;
  assignmentPercentage?: number;
  midtermPercentage?: number;
  finalPercentage?: number;
  totalPercentage?: number;
}
