"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Loading from "@/components/shared/loading";
import { RequestHistoryTableHeader } from "@/constants/table/request";
import { useCallback, useEffect, useState } from "react";
import { AllHistoryReqModel } from "@/model/request/request-model";
import { HistoryReqFilterModel } from "@/model/request/request-filter";
import { getAllHistoryReqService } from "@/service/request/request.service";
import { toast } from "sonner";
import { formatDate } from "@/utils/date/dd-mm-yyyy-format";
import PaginationPage from "@/components/shared/pagination-page";
import { truncateText } from "@/utils/format/format-width-text";

interface RequestParam {
  userId?: number;
}

export function RequestHistory(param: RequestParam) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [historyReqData, setHistoryReqData] =
    useState<AllHistoryReqModel | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  console.log("## ==param.userId", param.userId);

  const fetchHistoryReq = useCallback(
    async (filters: HistoryReqFilterModel = {}) => {
      if (!param.userId) return;
      setIsLoading(true);
      try {
        const response = await getAllHistoryReqService({
          userId: param.userId ? param.userId : undefined,
          ...filters,
        });
        setHistoryReqData(response);
      } catch (error: any) {
        console.error("Error fetching history requests:", error);
        toast.error("error occurred while loading classes");
        setHistoryReqData(null);
      } finally {
        setIsLoading(false);
      }
    },
    [param.userId]
  );

  useEffect(() => {
    fetchHistoryReq({ pageNo: currentPage });
  }, [currentPage, fetchHistoryReq, param.userId]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusBadge = (status: string) => {
    const baseBadgeClasses =
      "w-24 h-8 flex items-center justify-center text-sm font-medium rounded-full";

    switch (status.toUpperCase()) {
      case "DONE":
        return (
          <Badge
            className={`bg-green-100 text-green-800 hover:bg-green-100 ${baseBadgeClasses}`}
          >
            Done
          </Badge>
        );
      case "ACCEPTED":
        return (
          <div
            className={`bg-blue-100 text-blue-800 hover:bg-blue-100 ${baseBadgeClasses}`}
          >
            Accepted
          </div>
        );
      case "REJECTED":
        return (
          <Badge
            className={`bg-red-100 text-red-800 hover:bg-red-100 ${baseBadgeClasses}`}
          >
            Rejected
          </Badge>
        );
      case "PENDING":
        return (
          <Badge
            className={`bg-orange-100 text-orange-800 hover:bg-orange-100 hover:text-orange-800 ${baseBadgeClasses}`}
          >
            Pending
          </Badge>
        );
      case "RETURN":
        return (
          <Badge
            className={`bg-yellow-100 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-800 ${baseBadgeClasses}`}
          >
            Returned
          </Badge>
        );
      default:
        return (
          <Badge
            variant="secondary"
            className={`bg-gray-100 text-gray-800 hover:bg-gray-100 hover:text-gray-800 ${baseBadgeClasses}`}
          >
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="">
      <div className="">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Request History
        </h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-4">
        {isLoading ? (
          <Loading />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {RequestHistoryTableHeader.map((header, index) => (
                  <TableHead key={index} className={header.className}>
                    {header.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyReqData?.content.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No Records
                  </TableCell>
                </TableRow>
              ) : (
                historyReqData?.content.map((item, index) => {
                  const indexDisplay =
                    ((historyReqData.pageNo || 1) - 1) * 10 + index + 1;
                  return (
                    <TableRow key={item.id}>
                      <TableCell>{indexDisplay}</TableCell>
                      <TableCell>{truncateText(item.title) || "---"}</TableCell>
                      <TableCell>
                        {truncateText(item.requestComment) || "---"}
                      </TableCell>
                      <TableCell>
                        {formatDate(item.createdAt || "---")}
                      </TableCell>
                      <TableCell>{getStatusBadge(item.toStatus) || "---"}</TableCell>
                      <TableCell>
                        {truncateText(item.staffComment) || "---"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && historyReqData && historyReqData.totalPages > 1 && (
        <div className="mt-8 flex justify-end">
          <PaginationPage
            currentPage={historyReqData.pageNo}
            totalPages={historyReqData.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
