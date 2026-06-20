import { TableColumn } from "@/components/shared/data-table";
import { AttendanceHistoryModel } from "@/model/attendance/attendance-history";
import { formatDate } from "@/utils/date/dd-mm-yyyy-format";
import { formatType } from "@/constants/format-enum/formate-type-attendance";
import { getAttendanceStatusBadge } from "@/app/(dashboard)/attendance/records/[id]/columns";

export interface AttendanceStudentHistoryColumnsProps {
  getDisplayIndex: (index: number) => number;
}

export function createAttendanceStudentHistoryColumns({
  getDisplayIndex,
}: AttendanceStudentHistoryColumnsProps): TableColumn<AttendanceHistoryModel>[] {
  return [
    { key: "no", label: "#", render: (_, index) => getDisplayIndex(index) },
    { key: "identifyNumber", label: "Student ID", render: (h) => h.identifyNumber || "---" },
    { key: "studentName", label: "Student Name", render: (h) => h.studentName || "---" },
    { key: "teacherName", label: "Teacher Name", render: (h) => h.teacherName || "---" },
    { key: "courseName", label: "Course Name", render: (h) => h.courseName || "---" },
    { key: "status", label: "Status", render: (h) => getAttendanceStatusBadge(h.status) || "---" },
    { key: "attendanceType", label: "Type", render: (h) => formatType(h.attendanceType) || "---" },
    { key: "createdAt", label: "Date", render: (h) => formatDate(h.createdAt) || "---" },
    { key: "attendanceScore", label: "Score", render: (h) => h?.attendanceScore || "---" },
    { key: "maxAttendanceScore", label: "Max Score", render: (h) => h.maxAttendanceScore || "---" },
    { key: "comment", label: "Comment", render: (h) => h.comment || "---" },
  ];
}
