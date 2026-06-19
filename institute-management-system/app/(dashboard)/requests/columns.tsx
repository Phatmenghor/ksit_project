import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { ROUTE } from "@/constants/routes";
import { formatDate } from "@/utils/date/dd-mm-yyyy-format";
import { truncateText } from "@/utils/format/format-width-text";
import { formatGender } from "@/constants/format-enum/formate-gender";
import { TableColumn } from "@/components/shared/data-table";
import { RequestModel } from "@/model/request/request-model";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import React from "react";

const BASE_BADGE = "w-24 h-8 flex items-center justify-center text-sm font-medium rounded-full border-0";

export function getRequestStatusBadge(status: string): React.ReactNode {
  switch (status.toUpperCase()) {
    case "DONE":
      return <Badge className={`bg-green-100 text-green-800 hover:bg-green-100 ${BASE_BADGE}`}>Done</Badge>;
    case "ACCEPTED":
      return <div className={`bg-blue-100 text-blue-800 hover:bg-blue-100 ${BASE_BADGE}`}>Accepted</div>;
    case "REJECTED":
      return <Badge className={`bg-red-100 text-red-800 hover:bg-red-100 ${BASE_BADGE}`}>Rejected</Badge>;
    case "PENDING":
      return <Badge className={`bg-orange-100 text-orange-800 hover:bg-orange-100 hover:text-orange-800 ${BASE_BADGE}`}>Pending</Badge>;
    case "RETURN":
      return <Badge className={`bg-yellow-100 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-800 ${BASE_BADGE}`}>Returned</Badge>;
    default:
      return (
        <Badge variant="secondary" className={`bg-gray-100 text-gray-800 hover:bg-gray-100 hover:text-gray-800 ${BASE_BADGE}`}>
          {status}
        </Badge>
      );
  }
}

export interface RequestColumnsProps {
  getDisplayIndex: (index: number) => number;
  router: AppRouterInstance;
}

export function createRequestColumns({
  getDisplayIndex,
  router,
}: RequestColumnsProps): TableColumn<RequestModel>[] {
  return [
    { key: "no", label: "#", width: "50px", render: (_, index) => getDisplayIndex(index) },
    {
      key: "identifyNumber",
      label: "ID",
      render: (req) => (req.user ? req.user?.identifyNumber || "---" : "---"),
    },
    {
      key: "name",
      label: "Name",
      render: (req) =>
        req.user
          ? `${req.user?.englishFirstName || "---"} ${req.user?.englishLastName || "---"}`
          : "---",
    },
    {
      key: "gender",
      label: "Gender",
      render: (req) => (req.user ? formatGender(req.user?.gender) || "---" : "---"),
    },
    { key: "title", label: "Title", render: (req) => truncateText(req?.title, 20) },
    { key: "createdAt", label: "Date", render: (req) => formatDate(req?.createdAt || "---") },
    { key: "status", label: "Status", render: (req) => getRequestStatusBadge(req?.status || "---") },
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
          <Eye className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
          <span className="border-b-2 transition-all duration-200 hover:border-primary">Detail</span>
        </Button>
      ),
    },
  ];
}
