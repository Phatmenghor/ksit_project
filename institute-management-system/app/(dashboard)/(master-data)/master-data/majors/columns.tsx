import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { DateTimeFormatter } from "@/utils/date/date-time-format";
import { TableColumn } from "@/components/shared/data-table";
import { MajorModel } from "@/model/master-data/major/all-major-model";

export interface MajorColumnsProps {
  currentPage: number;
  currentPageSize: number;
  isDeleting: boolean;
  onEdit: (item: MajorModel) => void;
  onDelete: (item: MajorModel) => void;
}

export function createMajorColumns({
  currentPage,
  currentPageSize,
  isDeleting,
  onEdit,
  onDelete,
}: MajorColumnsProps): TableColumn<MajorModel>[] {
  return [
    {
      key: "no",
      label: "#",
      width: "50px",
      render: (_, index) => (currentPage - 1) * currentPageSize + index + 1,
    },
    { key: "code", label: "Code", render: (m) => m.code },
    { key: "name", label: "Name", render: (m) => m.name },
    { key: "department", label: "Department", render: (m) => m.department.name },
    { key: "createdAt", label: "Created At", render: (m) => DateTimeFormatter(m.createdAt) },
    {
      key: "actions",
      label: "Actions",
      render: (m) => (
        <div className="flex justify-start space-x-2">
          <Button
            onClick={() => onEdit(m)}
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-gray-200"
            disabled={isDeleting}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => onDelete(m)}
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
