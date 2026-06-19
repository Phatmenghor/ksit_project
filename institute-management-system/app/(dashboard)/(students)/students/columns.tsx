import { Button } from "@/components/ui/button";
import { Eye, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDate } from "@/utils/date/date";
import { formatEnumLabel } from "@/utils/general/format-enum-label";
import { ROUTE } from "@/constants/routes";
import { TableColumn } from "@/components/shared/data-table";
import { StudentModel } from "@/model/user/student/student.request.model";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export interface StudentColumnsProps {
  currentPage: number;
  currentPageSize: number;
  isDeleting: boolean;
  router: AppRouterInstance;
  onResetPassword: (item: StudentModel) => void;
  onDelete: (item: StudentModel) => void;
}

export function createStudentColumns({
  currentPage,
  currentPageSize,
  isDeleting,
  router,
  onResetPassword,
  onDelete,
}: StudentColumnsProps): TableColumn<StudentModel>[] {
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
    { key: "gender", label: "Gender", render: (s) => formatEnumLabel(s.gender) },
    {
      key: "dateOfBirth",
      label: "Date Of Birth",
      render: (s) => (s.dateOfBirth ? formatDate(s.dateOfBirth) : "---"),
    },
    {
      key: "classCode",
      label: "Class code",
      render: (s) =>
        `${s?.studentClass?.code || ""} - ${s?.studentClass?.major?.name || ""}` || "---",
    },
    {
      key: "actions",
      label: "Actions",
      width: "160px",
      render: (s) => (
        <div className="flex justify-start space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => router.push(ROUTE.STUDENTS.VIEW(String(s.id)))}
                  variant="ghost" size="icon" className="h-8 w-8 bg-gray-200 hover:bg-gray-300"
                  disabled={isDeleting}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Student Detail</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => router.push(ROUTE.STUDENTS.EDIT_STUDENT(String(s.id)))}
                  variant="ghost" size="icon" className="h-8 w-8 bg-gray-200 hover:bg-gray-300"
                  disabled={isDeleting}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => onResetPassword(s)}
                  variant="ghost" size="icon" className="h-8 w-8 bg-gray-200 hover:bg-gray-300"
                  disabled={isDeleting}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset Password</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => onDelete(s)}
                  variant="ghost" size="icon"
                  className="h-8 w-8 bg-red-500 text-white hover:text-gray-100 hover:bg-red-600"
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ];
}
