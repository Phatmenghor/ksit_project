import { Button } from "@/components/ui/button";
import { Eye, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DateTimeFormatter } from "@/utils/date/date-time-format";
import { formatEnumLabel } from "@/utils/general/format-enum-label";
import { formatDate } from "@/utils/date/date";
import { ROUTE } from "@/constants/routes";
import { TableColumn } from "@/components/shared/data-table";
import { StaffModel } from "@/model/user/staff/staff.respond.model";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export interface TeacherColumnsProps {
  currentPage: number;
  currentPageSize: number;
  isDeleting: boolean;
  router: AppRouterInstance;
  onResetPassword: (item: StaffModel) => void;
  onDelete: (item: StaffModel) => void;
}

export function createTeacherColumns({
  currentPage,
  currentPageSize,
  isDeleting,
  router,
  onResetPassword,
  onDelete,
}: TeacherColumnsProps): TableColumn<StaffModel>[] {
  return [
    {
      key: "no",
      label: "#",
      width: "50px",
      render: (_, index) => (currentPage - 1) * currentPageSize + index + 1,
    },
    {
      key: "profile",
      label: "Profile",
      width: "70px",
      render: (item) => {
        const url = item.profileUrl
          ? `${process.env.NEXT_PUBLIC_API_BASE_URL_IMAGE}${item.profileUrl}`
          : undefined;
        const initials =
          [item.englishFirstName, item.englishLastName]
            .filter(Boolean)
            .map((n) => n![0])
            .join("")
            .toUpperCase() ||
          item.username?.charAt(0).toUpperCase() ||
          "U";
        return (
          <Avatar className="h-8 w-8">
            <AvatarImage src={url} alt={item.username} className="object-cover" />
            <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        );
      },
    },
    { key: "username", label: "Username", render: (teacher) => teacher.username || "---" },
    {
      key: "khmerName",
      label: "Khmer Name",
      render: (teacher) =>
        `${teacher.khmerFirstName || ""} ${teacher.khmerLastName || ""}`.trim() || "---",
    },
    {
      key: "englishName",
      label: "English Name",
      render: (teacher) =>
        `${teacher.englishFirstName ?? ""} ${teacher.englishLastName ?? ""}`.trim() || "---",
    },
    { key: "identifyNumber", label: "ID Number", render: (teacher) => teacher.identifyNumber || "---" },
    { key: "gender", label: "Gender", render: (teacher) => formatEnumLabel(teacher.gender) },
    {
      key: "dateOfBirth",
      label: "Date of Birth",
      render: (teacher) => (teacher.dateOfBirth ? formatDate(teacher.dateOfBirth) : "---"),
    },
    { key: "phoneNumber", label: "Phone", render: (teacher) => teacher.phoneNumber || "---" },
    { key: "department", label: "Department", render: (teacher) => teacher.department?.name || "---" },
    {
      key: "status",
      label: "Status",
      render: (teacher) => (
        <Badge
          variant="outline"
          className={
            teacher.status === "ACTIVE"
              ? "border-green-500 text-green-700 bg-green-50"
              : "border-gray-400 text-gray-500"
          }
        >
          {formatEnumLabel(teacher.status)}
        </Badge>
      ),
    },
    { key: "createdAt", label: "Created At", render: (teacher) => DateTimeFormatter(teacher.createdAt) },
    {
      key: "actions",
      label: "",
      width: "160px",
      render: (teacher) => (
        <div className="flex justify-start space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => router.push(ROUTE.USERS.VIEW_TEACHER(String(teacher.id)))}
                  variant="ghost" size="icon" className="h-8 w-8 bg-gray-200 hover:bg-gray-300"
                  disabled={isDeleting}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Teacher Detail</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => router.push(ROUTE.USERS.EDIT_TEACHER(String(teacher.id)))}
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
                  onClick={() => onResetPassword(teacher)}
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
                  onClick={() => onDelete(teacher)}
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
