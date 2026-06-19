import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
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
}

export function createMyRequestColumns({
  getDisplayIndex,
  router,
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
        <Button
          onClick={() => router.push(ROUTE.REQUEST_DETAIL(String(req.id)))}
          variant="outline"
          className="flex items-center gap-2 border-none bg-transparent transition-all duration-200 hover:bg-muted hover:scale-105"
        >
          <Eye className="h-4 w-4" />
          <span className="border-b-2 transition-all duration-200 hover:border-primary">Detail</span>
        </Button>
      ),
    },
  ];
}
