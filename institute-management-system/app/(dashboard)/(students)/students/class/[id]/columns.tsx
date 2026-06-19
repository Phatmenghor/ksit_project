import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDate } from "@/utils/date/date";
import { ROUTE } from "@/constants/routes";
import { TableColumn } from "@/components/shared/data-table";
import { StudentModel } from "@/model/user/student/student.request.model";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export interface StudentClassColumnsProps {
  getDisplayIndex: (index: number) => number;
  router: AppRouterInstance;
}

export function createStudentClassColumns({
  getDisplayIndex,
  router,
}: StudentClassColumnsProps): TableColumn<StudentModel>[] {
  return [
    {
      key: "index",
      label: "#",
      width: "50px",
      render: (_item, index) => getDisplayIndex(index),
    },
    { key: "username", label: "Student ID", render: (student) => student.username || "---" },
    {
      key: "fullnameKH",
      label: "Fullname (KH)",
      render: (student) =>
        `${student.khmerFirstName || ""} ${student.khmerLastName || ""}`.trim() || "---",
    },
    {
      key: "fullnameEN",
      label: "Fullname (EN)",
      render: (student) =>
        `${student.englishFirstName || ""} ${student.englishLastName || ""}`.trim() || "---",
    },
    { key: "gender", label: "Gender", render: (student) => student.gender || "---" },
    {
      key: "dateOfBirth",
      label: "Date Of Birth",
      render: (student) => (student.dateOfBirth ? formatDate(student.dateOfBirth) : "---"),
    },
    {
      key: "actions",
      label: "Actions",
      width: "80px",
      render: (student) => (
        <div className="flex justify-start space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => router.push(ROUTE.STUDENTS.VIEW(String(student.id)))}
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
        </div>
      ),
    },
  ];
}
