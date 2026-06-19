import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { DateTimeFormatter } from "@/utils/date/date-time-format";
import { TableColumn } from "@/components/shared/data-table";
import { SubjectModel } from "@/model/master-data/subject/all-subject-model";

export interface SubjectColumnsProps {
  currentPage: number;
  currentPageSize: number;
  isDeleting: boolean;
  onEdit: (item: SubjectModel) => void;
  onDelete: (item: SubjectModel) => void;
}

export function createSubjectColumns({
  currentPage,
  currentPageSize,
  isDeleting,
  onEdit,
  onDelete,
}: SubjectColumnsProps): TableColumn<SubjectModel>[] {
  return [
    {
      key: "no",
      label: "#",
      width: "50px",
      render: (_, index) => (currentPage - 1) * currentPageSize + index + 1,
    },
    { key: "name", label: "Name", render: (s) => s.name },
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
