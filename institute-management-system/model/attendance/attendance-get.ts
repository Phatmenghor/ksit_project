export interface AllAttendanceModel {
  id: number;
  sessionDate: string;
  finalizationStatus: string;
  status: string;
  scheduleId: number;
  roomName: string;
  classCode: string;
  teacherId: number;
  teacherName: string;
  totalStudents: number;
  totalPresent: number;
  totalAbsent: number;
  createdAt: string;
  attendances: AttendanceModel[];
}

export interface AttendanceModel {
  id: number;
  status: string;
  attendanceType: string;
  identifyNumber: string;
  comment?: string;
  recordedTime: string;
  finalizationStatus: string;
  studentId: number;
  studentName: any;
  attendanceSessionId: number;
  createdAt: string;
  teacherId: number;
  teacherName: string;
  gender: any;
  dateOfBirth: any;
  scheduleId: number;
  courseName: string;
}
