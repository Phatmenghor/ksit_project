import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ROUTE } from "@/constants/routes";
import { TableColumn } from "@/components/shared/data-table";
import { StudentModel } from "@/model/user/student/student.request.model";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export interface AttendanceHistoryColumnsProps {
  getDisplayIndex: (index: number) => number;
  router: AppRouterInstance;
  scheduleId: string;
  isSubmitting: boolean;
}

export function createAttendanceHistoryColumns({
  getDisplayIndex,
  router,
  scheduleId,
  isSubmitting,
}: AttendanceHistoryColumnsProps): TableColumn<StudentModel>[] {
  return [
    { key: "no", label: "#", render: (_, index) => getDisplayIndex(index) },
    { key: "username", label: "Username", render: (student) => student.username || "---" },
    {
      key: "khmerName",
      label: "Khmer Name",
      render: (student) =>
        `${student.khmerFirstName || ""} ${student.khmerLastName || ""}`.trim() || "---",
    },
    {
      key: "englishName",
      label: "English Name",
      render: (student) =>
        `${student.englishFirstName || ""} ${student.englishLastName || ""}`.trim() || "---",
    },
    { key: "gender", label: "Gender", render: (student) => student.gender || "---" },
    { key: "dateOfBirth", label: "Date of Birth", render: (student) => student.dateOfBirth || "---" },
    {
      key: "class",
      label: "Class",
      render: (student) =>
        `${student?.studentClass.code} - ${student?.studentClass.major.name}` || "---",
    },
    {
      key: "actions",
      label: "",
      render: (student) => (
        <div className="flex justify-start space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() =>
                    router.push(
                      ROUTE.ATTENDANCE.HISTORY_RECORD_DETAIL(
                        String(scheduleId),
                        String(student.id)
                      )
                    )
                  }
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-gray-200 hover:bg-gray-300"
                  disabled={isSubmitting}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Student Detail</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ];
}
