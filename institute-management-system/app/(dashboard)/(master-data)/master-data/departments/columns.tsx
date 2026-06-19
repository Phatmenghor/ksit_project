import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DateTimeFormatter } from "@/utils/date/date-time-format";
import { baseAPI } from "@/constants/api";
import { TableColumn } from "@/components/shared/data-table";
import { DepartmentModel } from "@/model/master-data/department/all-department-model";

export interface DepartmentColumnsProps {
  currentPage: number;
  currentPageSize: number;
  isDeleting: boolean;
  onEdit: (item: DepartmentModel) => void;
  onDelete: (item: DepartmentModel) => void;
}

export function createDepartmentColumns({
  currentPage,
  currentPageSize,
  isDeleting,
  onEdit,
  onDelete,
}: DepartmentColumnsProps): TableColumn<DepartmentModel>[] {
  return [
    {
      key: "no",
      label: "#",
      width: "50px",
      render: (_, index) => (currentPage - 1) * currentPageSize + index + 1,
    },
    { key: "code", label: "Code", render: (dept) => dept.code },
    { key: "name", label: "Name", render: (dept) => dept.name },
    {
      key: "logo",
      label: "Logo",
      render: (dept) => (
        <Avatar className="h-12 w-12">
          <AvatarImage
            src={dept.urlLogo ? `${baseAPI.BASE_IMAGE}${dept.urlLogo}` : baseAPI.NO_IMAGE}
            alt={dept.name}
          />
          <AvatarFallback>{dept.name?.charAt(0)}</AvatarFallback>
        </Avatar>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      render: (dept) => DateTimeFormatter(dept.createdAt),
    },
    {
      key: "actions",
      label: "Actions",
      render: (dept) => (
        <div className="flex justify-start space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => onEdit(dept)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-gray-200 hover:bg-gray-300"
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
                  onClick={() => onDelete(dept)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-red-500 text-white hover:bg-red-600"
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
