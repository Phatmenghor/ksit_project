import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";
import { ROUTE } from "@/constants/routes";
import { formatDate } from "@/utils/date/dd-mm-yyyy-format";
import { truncateText } from "@/utils/format/format-width-text";
import { TableColumn } from "@/components/shared/data-table";
import { RequestModel } from "@/model/request/request-model";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { getRequestStatusBadge } from "../requests/columns";

export interface MyRequestColumnsProps {
  getDisplayIndex: (index: number) => number;
  router: AppRouterInstance;
  onViewDetail: (req: RequestModel) => void;
  onDelete: (req: RequestModel) => void;
}

export function createMyRequestColumns({
  getDisplayIndex,
  router,
  onViewDetail,
  onDelete,
}: MyRequestColumnsProps): TableColumn<RequestModel>[] {
  return [
    {
      key: "no",
      label: "#",
      width: "50px",
      render: (_, index) => getDisplayIndex(index),
    },
    {
      key: "title",
      label: "Title",
      render: (req) => truncateText(req?.title, 40),
    },
    {
      key: "requestComment",
      label: "Comment",
      render: (req) => truncateText(req?.requestComment, 30) || "---",
    },
    {
      key: "createdAt",
      label: "Date",
      render: (req) => formatDate(req?.createdAt || "---"),
    },
    {
      key: "status",
      label: "Status",
      render: (req) => getRequestStatusBadge(req?.status || "---"),
    },
    {
      key: "action",
      label: "Action",
      width: "100px",
      render: (req) => (
        <div className="flex gap-1.5">
          <Button
            onClick={() => onViewDetail(req)}
            variant="ghost"
            size="icon"
            className="h-7 w-7 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
            title="Detail"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          {req.status === "PENDING" && (
            <Button
              onClick={() => onDelete(req)}
              variant="ghost"
              size="icon"
              className="h-7 w-7 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
              title="Cancel Request"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ];
}

