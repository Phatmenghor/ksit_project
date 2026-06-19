import { Button } from "@/components/ui/button";
import { Eye, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DateTimeFormatter } from "@/utils/date/date-time-format";
import { formatEnumLabel } from "@/utils/general/format-enum-label";
import { ROUTE } from "@/constants/routes";
import { TableColumn } from "@/components/shared/data-table";
import { StaffModel } from "@/model/user/staff/staff.respond.model";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export interface AdminColumnsProps {
  currentPage: number;
  currentPageSize: number;
  isDeleting: boolean;
  router: AppRouterInstance;
  onResetPassword: (item: StaffModel) => void;
  onDelete: (item: StaffModel) => void;
}

export function createAdminColumns({
  currentPage,
  currentPageSize,
  isDeleting,
  router,
  onResetPassword,
  onDelete,
}: AdminColumnsProps): TableColumn<StaffModel>[] {
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
    { key: "username", label: "Username", render: (admin) => admin.username || "---" },
    { key: "email", label: "Email", render: (admin) => admin?.email || "---" },
    {
      key: "name",
      label: "Name",
      render: (admin) =>
        `${admin.khmerFirstName || ""} ${admin.khmerLastName || ""}`.trim() || "---",
    },
    { key: "gender", label: "Gender", render: (admin) => formatEnumLabel(admin.gender) },
    {
      key: "status",
      label: "Status",
      render: (admin) => (
        <Badge
          variant="outline"
          className={
            admin.status === "ACTIVE"
              ? "border-green-500 text-green-700 bg-green-50"
              : "border-gray-400 text-gray-500"
          }
        >
          {formatEnumLabel(admin.status)}
        </Badge>
      ),
    },
    { key: "createdAt", label: "Created At", render: (admin) => DateTimeFormatter(admin.createdAt) },
    {
      key: "actions",
      label: "",
      width: "160px",
      render: (admin) => (
        <div className="flex justify-start space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => router.push(ROUTE.USERS.ADMIN.ADMIN_VIEW(String(admin.id)))}
                  variant="ghost" size="icon" className="h-8 w-8 bg-gray-200 hover:bg-gray-300"
                  disabled={isDeleting}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Admin Detail</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => router.push(ROUTE.USERS.ADMIN.EDIT_ADMIN(String(admin.id)))}
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
                  onClick={() => onResetPassword(admin)}
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
                  onClick={() => onDelete(admin)}
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
