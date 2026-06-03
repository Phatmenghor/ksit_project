export interface UpdateAttendanceModel {
  id: number;
  status?: string; // "PRESENT" | "ABSENT"
  attendanceType?: string; // "NONE" | "LATE" | "PERMISSION"
  comment?: string;
}
