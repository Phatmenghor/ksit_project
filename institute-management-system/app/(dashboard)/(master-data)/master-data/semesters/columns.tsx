import { Button } from "@/components/ui/button";
import { CalendarClock, CheckCircle, Loader, Pencil, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { DateTimeFormatter } from "@/utils/date/date-time-format";
import { SemesterType } from "@/constants/constant";
import { TableColumn } from "@/components/shared/data-table";
import { SemesterModel } from "@/model/master-data/semester/semester-model";

function formatSemesterDate(dateString: string) {
  try {
    return format(parseISO(dateString), "MMMM dd, yyyy");
  } catch {
    return dateString;
  }
}

export interface SemesterColumnsProps {
  currentPage: number;
  currentPageSize: number;
  isDeleting: boolean;
  onEdit: (item: SemesterModel) => void;
  onDelete: (item: SemesterModel) => void;
}

export function createSemesterColumns({
  currentPage,
  currentPageSize,
  isDeleting,
  onEdit,
  onDelete,
}: SemesterColumnsProps): TableColumn<SemesterModel>[] {
  return [
    {
      key: "no",
      label: "#",
      width: "50px",
      render: (_, index) => (currentPage - 1) * currentPageSize + index + 1,
    },
    {
      key: "semester",
      label: "Semester",
      render: (s) =>
        s.semester === "SEMESTER_1"
          ? "Semester 1"
          : s.semester === "SEMESTER_2"
          ? "Semester 2"
          : s.semester,
    },
    { key: "startDate", label: "Start Date", render: (s) => formatSemesterDate(s.startDate) },
    { key: "endDate", label: "End Date", render: (s) => formatSemesterDate(s.endDate) },
    { key: "academyYear", label: "Academy Year", render: (s) => s.academyYear },
    {
      key: "semesterType",
      label: "Status",
      render: (s) => (
        <>
          {s.semesterType === SemesterType.DONE && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle size={16} /><span>Done</span>
            </div>
          )}
          {s.semesterType === SemesterType.PROCESSING && (
            <div className="flex items-center gap-2 text-blue-600">
              <Loader size={16} /><span>Processing</span>
            </div>
          )}
          {s.semesterType === SemesterType.PROGRESS && (
            <div className="flex items-center gap-2 text-yellow-500">
              <CalendarClock size={16} /><span>Progress</span>
            </div>
          )}
        </>
      ),
    },
    { key: "createdAt", label: "Created At", render: (s) => DateTimeFormatter(s.createdAt) },
    {
      key: "actions",
      label: "Actions",
      render: (s) => (
        <div className="flex justify-start space-x-2">
          <Button
            onClick={() => onEdit(s)}
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-gray-200 hover:bg-gray-300"
            disabled={isDeleting}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => onDelete(s)}
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-red-500 text-white hover:bg-red-600"
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
}
