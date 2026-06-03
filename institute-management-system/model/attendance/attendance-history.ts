export interface AttendanceHistoryFilter {
  search?: string;
  scheduleId?: number;
  classId?: number;
  teacherId?: number;
  finalizationStatus?: string;
  studentId?: number;
  status?: string;
  semester?: string;
  academyYear?: number;
  startDate?: string; // Format: YYYY-MM-DD
  endDate?: string; // Format: YYYY-MM-DD
  pageNo?: number;
  pageSize?: number;
}

export interface AllAttendanceHistoryModel {
  content: AttendanceHistoryModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface AttendanceHistoryModel {
  id: number;
  status: string;
  attendanceType: string;
  identifyNumber: string;
  comment: string;
  recordedTime: string;
  finalizationStatus: string;
  studentId: number;
  studentName: string;
  attendanceSessionId: number;
  createdAt: string;
  teacherId: number;
  teacherName: string;
  gender: string;
  dateOfBirth: string;
  scheduleId: number;
  totalSessionsConducted: number;
  sessionsAttended: number;
  attendancePercentage: number;
  attendanceScore: number;
  maxAttendanceScore: number;
  attendanceScoreDescription: string;
  courseName: string;
}
