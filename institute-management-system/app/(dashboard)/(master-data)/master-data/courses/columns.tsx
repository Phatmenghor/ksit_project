import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { DateTimeFormatter } from "@/utils/date/date-time-format";
import { ROUTE } from "@/constants/routes";
import { TableColumn } from "@/components/shared/data-table";
import { CourseModel } from "@/model/master-data/course/all-course-model";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export interface CourseColumnsProps {
  currentPage: number;
  currentPageSize: number;
  isDeleting: boolean;
  router: AppRouterInstance;
  onDelete: (item: CourseModel) => void;
}

export function createCourseColumns({
  currentPage,
  currentPageSize,
  isDeleting,
  router,
  onDelete,
}: CourseColumnsProps): TableColumn<CourseModel>[] {
  return [
    {
      key: "no",
      label: "#",
      width: "50px",
      render: (_, index) => (currentPage - 1) * currentPageSize + index + 1,
    },
    { key: "code", label: "Code", render: (c) => c?.code || "—" },
    { key: "nameKH", label: "Name (KH)", render: (c) => c?.nameKH || "---" },
    { key: "nameEn", label: "Name (EN)", render: (c) => c?.nameEn || "---" },
    {
      key: "credit",
      label: "Credit",
      render: (c) => `${c?.credit || "---"} (${c?.theory},${c?.execute},${c?.apply})`,
    },
    {
      key: "instructor",
      label: "Instructor",
      render: (c) =>
        c?.user?.englishFirstName && c?.user?.englishLastName
          ? `${c.user.englishFirstName} ${c.user.englishLastName}`
          : c?.user?.khmerFirstName && c?.user?.khmerLastName
          ? `${c.user.khmerFirstName} ${c.user.khmerLastName}`
          : c?.user?.username || "---",
    },
    {
      key: "createdAt",
      label: "Created At",
      render: (c) => DateTimeFormatter(c.createdAt),
    },
    {
      key: "actions",
      label: "Actions",
      render: (c) => (
        <div className="flex justify-start space-x-2">
          <Button
            onClick={() => router.push(ROUTE.MASTER_DATA.COURSES.VIEW(String(c.id)))}
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-gray-200"
            disabled={isDeleting}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => router.push(ROUTE.MASTER_DATA.COURSES.UPDATE(String(c.id)))}
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-gray-200"
            disabled={isDeleting}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => onDelete(c)}
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
