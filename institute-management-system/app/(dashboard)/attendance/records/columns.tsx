import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ROUTE } from "@/constants/routes";
import { TableColumn } from "@/components/shared/data-table";
import { StudentModel } from "@/model/user/student/student.request.model";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export interface AttendanceRecordsColumnsProps {
  currentPage: number;
  currentPageSize: number;
  router: AppRouterInstance;
}

export function createAttendanceRecordsColumns({
  currentPage,
  currentPageSize,
  router,
}: AttendanceRecordsColumnsProps): TableColumn<StudentModel>[] {
  return [
    {
      key: "index",
      label: "#",
      width: "50px",
      render: (_, index) => (currentPage - 1) * currentPageSize + index + 1,
    },
    { key: "username", label: "Username", render: (s) => s.username || "---" },
    {
      key: "fullnameKH",
      label: "Fullname (KH)",
      render: (s) => `${s.khmerFirstName || ""} ${s.khmerLastName || ""}`.trim() || "---",
    },
    {
      key: "fullnameEN",
      label: "Fullname (EN)",
      render: (s) => `${s.englishFirstName || ""} ${s.englishLastName || ""}`.trim() || "---",
    },
    { key: "gender", label: "Gender", render: (s) => s.gender || "---" },
    { key: "dateOfBirth", label: "Date Of Birth", render: (s) => s.dateOfBirth || "---" },
    {
      key: "classCode",
      label: "Class code",
      render: (s) =>
        `${s?.studentClass?.code || ""} - ${s?.studentClass?.major?.name || ""}` || "---",
    },
    {
      key: "actions",
      label: "Actions",
      width: "80px",
      render: (s) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() =>
                  router.push(ROUTE.ATTENDANCE.STUDENT_LIST_RECORD_DETAIL(String(s.id)))
                }
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-gray-200 hover:bg-gray-300"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Student Detail</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
  ];
}
