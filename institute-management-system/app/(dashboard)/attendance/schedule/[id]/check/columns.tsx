import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, CheckCircle } from "lucide-react";
import { attendanceStatusOptions, attendanceTypeOptions } from "@/constants/filter/filter-page";
import { TableColumn } from "@/components/shared/data-table";

type AttendanceStudent = {
  id: number;
  studentName?: string;
  identifyNumber?: string;
  status: string;
  attendanceType: string;
  recordedTime?: string;
  attendanceScore?: string | number;
  maxAttendanceScore?: string | number;
  comment?: string;
};

function getStatusColor(status: string) {
  switch (status?.toLowerCase()) {
    case "present":
      return "text-green-700 bg-green-100 border-green-300 shadow-sm transition-all duration-200";
    case "absent":
      return "text-red-700 bg-red-100 border-red-300 shadow-sm transition-all duration-200";
    default:
      return "text-gray-700 bg-gray-100 border-gray-300 shadow-sm transition-all duration-200";
  }
}

export interface AttendanceCheckColumnsProps {
  unsavedChanges: Set<number>;
  isSubmitted: boolean;
  onFieldChange: (id: number, field: string, value: string) => void;
  onRemoveFromUnsaved: (id: number) => void;
}

export function createAttendanceCheckColumns({
  unsavedChanges,
  isSubmitted,
  onFieldChange,
  onRemoveFromUnsaved,
}: AttendanceCheckColumnsProps): TableColumn<AttendanceStudent>[] {
  return [
    {
      key: "no",
      label: "#",
      width: "50px",
      render: (_, index) => index + 1,
    },
    {
      key: "studentName",
      label: "Student Name",
      render: (student) => (
        <div className="flex items-center gap-2">
          {student.studentName || "- - -"}
          {unsavedChanges.has(student.id) && (
            <Badge variant="outline" className="text-xs animate-pulse">
              Unsaved
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "identifyNumber",
      label: "Student ID",
      render: (student) => student.identifyNumber,
    },
    {
      key: "attendance",
      label: "Attendance",
      render: (student) => (
        <Select
          value={student.status}
          onValueChange={(value) => onFieldChange(student.id, "status", value)}
          disabled={isSubmitted}
        >
          <SelectTrigger
            className={`h-8 w-full border ${getStatusColor(student.status)} ${isSubmitted ? "cursor-not-allowed" : ""}`}
          >
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {attendanceStatusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (student) => (
        <Select
          value={student.attendanceType}
          onValueChange={(value) => onFieldChange(student.id, "attendanceType", value)}
          disabled={isSubmitted}
        >
          <SelectTrigger
            className={`h-8 w-full border ${isSubmitted ? "cursor-not-allowed" : ""}`}
          >
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {attendanceTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "recordedTime",
      label: "Check-in Time",
      render: (student) => student.recordedTime || "--",
    },
    {
      key: "attendanceScore",
      label: "attendanceScore",
      render: (student) => student.attendanceScore || "--",
    },
    {
      key: "maxAttendanceScore",
      label: "maxAttendanceScore",
      render: (student) => student.maxAttendanceScore || "--",
    },
    {
      key: "comment",
      label: "Comments",
      render: (student) => (
        <Input
          placeholder="Add Comment"
          className={`h-8 text-sm w-full transition-all duration-100 ease-in-out ${
            unsavedChanges.has(student.id) ? "border-yellow-300 ring-1 ring-yellow-200" : ""
          } ${isSubmitted ? "cursor-not-allowed" : ""}`}
          value={student.comment || ""}
          onChange={(e) => onFieldChange(student.id, "comment", e.target.value)}
          disabled={isSubmitted}
        />
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (student) =>
        isSubmitted ? (
          <Badge variant="secondary" className="text-xs">
            <CheckCircle className="h-3 w-3 mr-1" />
            Submitted
          </Badge>
        ) : unsavedChanges.has(student.id) ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveFromUnsaved(student.id)}
            className="text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        ) : (
          <Badge variant="secondary" className="text-xs">
            Saved
          </Badge>
        ),
    },
  ];
}
