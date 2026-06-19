import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/date/dd-mm-yyyy-format";
import { formatType } from "@/constants/format-enum/formate-type-attendance";
import { TableColumn } from "@/components/shared/data-table";
import { AttendanceHistoryModel } from "@/model/attendance/attendance-history";
import React from "react";

const BASE_BADGE_ATTENDANCE =
  "w-24 h-8 flex items-center justify-center text-sm font-medium rounded-full";

export function getAttendanceStatusBadge(status: string): React.ReactNode | null {
  if (!status) return null;
  switch (status.toUpperCase()) {
    case "PRESENT":
      return (
        <Badge className={`bg-green-100 text-green-800 hover:bg-green-100 ${BASE_BADGE_ATTENDANCE}`}>
          Present
        </Badge>
      );
    case "ABSENT":
      return (
        <Badge className={`bg-red-100 text-red-800 hover:bg-red-100 ${BASE_BADGE_ATTENDANCE}`}>
          Absent
        </Badge>
      );
    default:
      return (
        <Badge className={`bg-gray-100 text-gray-800 hover:bg-gray-100 ${BASE_BADGE_ATTENDANCE}`}>
          {status}
        </Badge>
      );
  }
}

export interface AttendanceRecordDetailColumnsProps {
  getDisplayIndex: (index: number) => number;
}

export function createAttendanceRecordDetailColumns({
  getDisplayIndex,
}: AttendanceRecordDetailColumnsProps): TableColumn<AttendanceHistoryModel>[] {
  return [
    { key: "no", label: "#", render: (_, index) => getDisplayIndex(index) },
    { key: "identifyNumber", label: "Identify Number", render: (h) => h.identifyNumber || "---" },
    { key: "studentName", label: "Student Name", render: (h) => h.studentName || "---" },
    { key: "teacherName", label: "Teacher Name", render: (h) => h.teacherName || "---" },
    { key: "courseName", label: "Course Name", render: (h) => h.courseName || "---" },
    { key: "status", label: "Status", render: (h) => getAttendanceStatusBadge(h.status) || "---" },
    { key: "attendanceType", label: "Type", render: (h) => formatType(h.attendanceType) || "---" },
    { key: "createdAt", label: "Date", render: (h) => formatDate(h.createdAt) || "---" },
    { key: "comment", label: "Comment", render: (h) => h.comment || "---" },
  ];
}
