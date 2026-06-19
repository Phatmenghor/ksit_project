import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { DateTimeFormatter } from "@/utils/date/date-time-format";
import { TableColumn } from "@/components/shared/data-table";
import { RoomModel } from "@/model/master-data/room/all-room-model";

export interface RoomColumnsProps {
  currentPage: number;
  currentPageSize: number;
  isDeleting: boolean;
  onEdit: (item: RoomModel) => void;
  onDelete: (item: RoomModel) => void;
}

export function createRoomColumns({
  currentPage,
  currentPageSize,
  isDeleting,
  onEdit,
  onDelete,
}: RoomColumnsProps): TableColumn<RoomModel>[] {
  return [
    {
      key: "no",
      label: "#",
      width: "50px",
      render: (_, index) => (currentPage - 1) * currentPageSize + index + 1,
    },
    { key: "name", label: "Name", render: (r) => r.name },
    { key: "createdAt", label: "Created At", render: (r) => DateTimeFormatter(r.createdAt) },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex justify-start space-x-2">
          <Button
            onClick={() => onEdit(r)}
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-gray-200 hover:bg-gray-300"
            disabled={isDeleting}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => onDelete(r)}
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
