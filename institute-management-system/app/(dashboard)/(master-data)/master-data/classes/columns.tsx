import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { DateTimeFormatter } from "@/utils/date/date-time-format";
import { Degrees } from "@/constants/constant";
import { TableColumn } from "@/components/shared/data-table";
import { ClassModel } from "@/model/master-data/class/all-class-model";

const YEAR_LEVEL_MAP: Record<string, string> = {
  FIRST_YEAR: "Year 1",
  SECOND_YEAR: "Year 2",
  THIRD_YEAR: "Year 3",
  FOURTH_YEAR: "Year 4",
};

export interface ClassColumnsProps {
  currentPage: number;
  currentPageSize: number;
  isDeleting: boolean;
  onEdit: (item: ClassModel) => void;
  onDelete: (item: ClassModel) => void;
}

export function createClassColumns({
  currentPage,
  currentPageSize,
  isDeleting,
  onEdit,
  onDelete,
}: ClassColumnsProps): TableColumn<ClassModel>[] {
  return [
    {
      key: "no",
      label: "#",
      width: "50px",
      render: (_, index) => (currentPage - 1) * currentPageSize + index + 1,
    },
    { key: "code", label: "Class Code", width: "140px", render: (cls) => cls.code },
    { key: "major", label: "Major", render: (cls) => cls.major.name },
    {
      key: "degree",
      label: "Degree",
      render: (cls) => Degrees.find((d) => d.value === cls.degree)?.label ?? cls.degree,
    },
    {
      key: "yearLevel",
      label: "Year Level",
      render: (cls) => YEAR_LEVEL_MAP[cls.yearLevel] ?? cls.yearLevel,
    },
    { key: "academyYear", label: "Academy Year", render: (cls) => cls.academyYear },
    { key: "createdAt", label: "Created At", render: (cls) => DateTimeFormatter(cls.createdAt) },
    {
      key: "actions",
      label: "",
      width: "90px",
      render: (cls) => (
        <div className="flex gap-1">
          <Button
            onClick={() => onEdit(cls)}
            variant="ghost"
            size="icon"
            className="h-7 w-7 bg-gray-200 hover:bg-gray-300"
            title="Edit"
            disabled={isDeleting}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            onClick={() => onDelete(cls)}
            variant="ghost"
            size="icon"
            className="h-7 w-7 bg-red-500 text-white hover:bg-red-600"
            disabled={isDeleting}
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];
}
