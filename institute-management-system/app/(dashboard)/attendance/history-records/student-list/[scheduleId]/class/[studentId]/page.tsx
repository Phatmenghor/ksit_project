"use client";

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { ClassModel } from "@/model/master-data/class/all-class-model";
import { useDebounce } from "@/utils/debounce/debounce";
import { useCallback, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AttendanceHistoryExcelTableHeader,
  AttendanceHistoryTableHeader,
} from "@/constants/table/attendance-history";
import {
  AttendanceHistoryFilter,
  AttendanceHistoryModel,
} from "@/model/attendance/attendance-history";
import {
  getAllAttedanceHistoryExcelService,
  getAllAttendanceHistoryService,
} from "@/service/schedule/attendance.service";
import { toast } from "sonner";
import PaginationPage from "@/components/shared/pagination-page";
import { format } from "date-fns";
import Loading from "@/components/shared/loading";
import { formatDate } from "@/utils/date/dd-mm-yyyy-format";
import { Badge } from "@/components/ui/badge";
import { formatType } from "@/constants/format-enum/formate-type-attendance";
import { AllAttendanceHistoryModel } from "@/model/attendance/attendance-history";
import { getDetailScheduleService } from "@/service/schedule/schedule.service";
import { useParams, useSearchParams } from "next/navigation";
import AttendanceHeader from "@/components/dashboard/attendance/header";
import { Button } from "@/components/ui/button";
import { AppIcons } from "@/constants/icons/icon";
import { Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScheduleModel } from "@/model/schedules/all-schedule-model";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePagination } from "@/hooks/use-pagination";
import { ROUTE } from "@/constants/routes";

export default function HistoryRecordsPage() {
  const params = useParams();
  const scheduleId = params?.scheduleId ? Number(params.scheduleId) : null;
  const studentId = params?.studentId ? Number(params.studentId) : null;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [scheduleDetail, setScheduleDetail] = useState<ScheduleModel | null>(
    null
  );
  const [attendanceHistoryData, setAttendanceHistoryData] =
    useState<AllAttendanceHistoryModel | null>(null);
  const searchParams = useSearchParams();

  const { currentPage, updateUrlWithPage, handlePageChange, getDisplayIndex } =
    usePagination({
      baseRoute: ROUTE.ATTENDANCE.HISTORY_RECORD_DETAIL(
        String(scheduleId),
        String(studentId)
      ),
      defaultPageSize: 10,
    });

  // Then add this effect for initial URL setup
  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    if (!pageParam) {
      // Use replace: true to avoid adding to browser history
      updateUrlWithPage(1, true);
    }
  }, [searchParams, updateUrlWithPage]);

  const fetchAttendanceHistory = useCallback(
    async (filter: AttendanceHistoryFilter) => {
      setIsLoading(true);
      try {
        const response = await getAllAttendanceHistoryService({
          scheduleId: Number(scheduleId),
          studentId: Number(studentId),
          finalizationStatus: "FINAL",
          pageNo: currentPage || 1,
          pageSize: 30,
        });

        setAttendanceHistoryData(response);
        // Handle case where current page exceeds total pages
        if (response.totalPages > 0 && currentPage > response.totalPages) {
          updateUrlWithPage(response.totalPages);
          return;
        }
      } catch (error: any) {
        toast.error("An error occurred while loading attendance history");
        setAttendanceHistoryData(null);
      } finally {
        setIsLoading(false);
      }
    },
    [studentId, scheduleId, currentPage]
  );

  useEffect(() => {
    fetchAttendanceHistory({ pageNo: currentPage });
  }, [currentPage]);

  const getStatusAttendance = (status: string) => {
    if (!status) {
      return null;
    }
    const baseBadgeAttendance =
      "w-24 h-8 flex items-center justify-center text-sm font-medium rounded-full";

    switch (status.toUpperCase()) {
      case "PRESENT":
        return (
          <Badge
            className={`bg-green-100 text-green-800 hover:bg-green-100 ${baseBadgeAttendance}`}
          >
            Present
          </Badge>
        );
      case "ABSENT":
        return (
          <Badge
            className={`bg-red-100 text-red-800 hover:bg-red-100 ${baseBadgeAttendance}`}
          >
            Absent
          </Badge>
        );
      default:
        return (
          <Badge
            className={`bg-gray-100 text-gray-800 hover:bg-gray-100 ${baseBadgeAttendance}`}
          >
            {status}
          </Badge>
        );
    }
  };

  const loadScheduleData = useCallback(async () => {
    if (!scheduleId) return;
    setIsLoading(true);
    try {
      const response = await getDetailScheduleService(scheduleId);
      setScheduleDetail(response);
    } catch (error) {
      toast.error("Error fetching schedule data");
    } finally {
      setIsLoading(false);
    }
  }, [scheduleId]);

  useEffect(() => {
    loadScheduleData();
  }, [loadScheduleData]);

  // Export to Excel - Fixed version
  const exportToExcel = async (): Promise<void> => {
    setIsSubmitting(true);

    try {
      setIsLoading(true);
      // Fetch all data for export (no pagination limit)
      const allDataResponse: AttendanceHistoryModel[] =
        await getAllAttedanceHistoryExcelService({
          scheduleId: Number(scheduleId),
          studentId: Number(studentId),
          finalizationStatus: "FINAL",
        });

      // Use API data if available, otherwise use current data
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Attendance History Data");

      // Header table excel
      const columns: string[] = AttendanceHistoryExcelTableHeader;

      // Add title row at Row 1
      worksheet.mergeCells(1, 1, 1, columns.length);
      const titleCell = worksheet.getCell("A1");
      titleCell.value = "List Attendance History Data";
      titleCell.font = { size: 16, bold: true, color: { argb: "FFFFFFFF" } };
      titleCell.alignment = { vertical: "middle", horizontal: "center" };
      titleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1F4E78" },
      };

      // Add header row at Row 3
      const headerRow = worksheet.getRow(3);
      columns.forEach((text: string, idx: number) => {
        const cell = headerRow.getCell(idx + 1);
        cell.value = text;
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF007ACC" },
        };
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };

        const columnWidths = [5, 15, 25, 27, 20, 15, 15, 15, 30];
        worksheet.getColumn(idx + 1).width = columnWidths[idx];
      });

      // Add data rows starting at row 4
      allDataResponse.forEach((item: any, i: number) => {
        const row = worksheet.addRow([
          i + 1,
          item.identifyNumber || "---",
          item.studentName || "---",
          item.teacherName || "---",
          item.courseName || "---",
          item.status || "---",
          item.attendanceType || "---",
          item.createdAt || "---",
          item.comment || "---",
        ]);

        // Zebra striping
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: i % 2 === 0 ? "FFF3F3F3" : "FFFFFFFF" },
          };
          cell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          };
          cell.alignment = { vertical: "middle", horizontal: "center" };
        });

        // Color the "Attendance" column (6th column)
        const attendanceCell = row.getCell(6);
        const attendanceValue = item.status?.toLowerCase();

        if (attendanceValue === "absent") {
          attendanceCell.font = { color: { argb: "FFFF0000" }, bold: true };
        } else if (attendanceValue === "present") {
          attendanceCell.font = { color: { argb: "FF00AA00" }, bold: true };
        }
      });

      // Format check-in time as date (column 8)
      worksheet.getColumn(8).eachCell((cell, rowNumber: number) => {
        if (rowNumber > 3 && cell.value) {
          try {
            cell.value = new Date(cell.value as string);
            cell.numFmt = "dd-mm-yyyy";
          } catch (error) {
          }
        }
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // File name
      const fileName = `attendance_history_${format(
        new Date(),
        "yyyy-MM-dd"
      )}.xlsx`;
      saveAs(blob, fileName);

      toast.success(
        `Excel file exported successfully! Total records: ${allDataResponse.length}`
      );
    } catch (error: unknown) {
      toast.error("Error exporting to Excel. Please try again.");
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  const totalStatuses = attendanceHistoryData?.content.length || 0;

  const absentStatuses =
    attendanceHistoryData?.content.filter(
      (record) => record.status === "ABSENT"
    ).length || 0;

  const presentStatuses =
    attendanceHistoryData?.content.filter(
      (record) => record.status === "PRESENT"
    ).length || 0;

  return (
    <div className="container space-y-4">
      <AttendanceHeader
        title="View Class Attendance"
        schedule={scheduleDetail}
      />
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left Title Section */}
          <div className="flex items-center gap-4">
            <CardTitle className="text-base font-medium">
              Attendance - Student List
            </CardTitle>
          </div>
          <div className="flex flex-col lg:flex-row gap-2 sm:gap-3 lg:gap-4">
            <Button
              onClick={exportToExcel}
              variant="outline"
              className="gap-2 text-sm sm:text-base lg:text-lg px-3 sm:px-4 lg:px-6 py-2 lg:py-3"
              disabled={isSubmitting}
            >
              <img
                src={AppIcons.Excel}
                alt="excel Icon"
                className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground flex-shrink-0"
              />
              <span>{isSubmitting ? "Exporting..." : "Excel"}</span>
              <Download className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
            </Button>
          </div>
        </CardHeader>
        <div className="w-full px-4 mb-2">
          <Separator className="bg-gray-300" />
        </div>
        <div className="px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg hover:scale-105 transition-transform duration-200">
              <div className="text-xs text-muted-foreground">
                Total Students
              </div>
              <div className="text-lg font-semibold">{totalStatuses}</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg hover:scale-105 transition-transform duration-200">
              <div className="text-xs text-green-600">Present</div>
              <div className="text-lg font-semibold text-green-700">
                {presentStatuses}
              </div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg hover:scale-105 transition-transform duration-200">
              <div className="text-xs text-red-600">Absent</div>
              <div className="text-lg font-semibold text-red-700">
                {absentStatuses}
              </div>
            </div>
          </div>
        </div>
        <CardContent className="p-4">
          <div
            className={`overflow-x-auto mt-4 ${useIsMobile() ? "pl-2" : ""}`}
          >
            {isLoading ? (
              <Loading />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    {AttendanceHistoryTableHeader.map((header, index) => (
                      <TableHead key={index} className={header.className}>
                        {header.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceHistoryData?.content.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={11}
                        className="text-center py-6 text-muted-foreground"
                      >
                        No Record
                      </TableCell>
                    </TableRow>
                  ) : (
                    attendanceHistoryData?.content.map((history, index) => {
                      return (
                        <TableRow key={history.id}>
                          <TableCell>{getDisplayIndex(index)}</TableCell>
                          <TableCell>
                            {history.identifyNumber || "---"}
                          </TableCell>
                          <TableCell>{history.studentName || "---"}</TableCell>
                          <TableCell>{history.teacherName || "---"}</TableCell>
                          <TableCell>{history.courseName || "---"}</TableCell>
                          <TableCell>
                            {getStatusAttendance(history.status) || "---"}
                          </TableCell>
                          <TableCell>
                            {formatType(history.attendanceType) || "---"}
                          </TableCell>
                          <TableCell>
                            {formatDate(history.createdAt) || "---"}
                          </TableCell>
                          <TableCell>
                            {history?.attendanceScore || "---"}
                          </TableCell>
                          <TableCell>
                            {history.maxAttendanceScore || "---"}
                          </TableCell>
                          <TableCell>{history.comment || "---"}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {attendanceHistoryData && (
        <div className="mt-8 flex justify-end">
          <PaginationPage
            currentPage={currentPage}
            totalPages={attendanceHistoryData.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
