"use client";

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useCallback, useEffect, useState } from "react";
import { AttendanceHistoryExcelTableHeader } from "@/constants/table/attendance-history";
import {
  AttendanceHistoryFilter,
  AttendanceHistoryModel,
} from "@/model/attendance/attendance-history";
import { toast } from "sonner";
import { format } from "date-fns";
import { createAttendanceStudentHistoryColumns } from "./columns";
import { useParams, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchScheduleByIdService } from "@/features/schedules/store/thunks/schedule-thunks";
import {
  fetchAllAttendanceHistoryThunk,
  fetchAttendanceHistoryExcelThunk,
} from "@/features/schedules/store/thunks/attendance-thunks";
import AttendanceHeader from "@/components/dashboard/attendance/header";
import { ExcelDownloadButton } from "@/components/shared/excel-download-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScheduleModel } from "@/model/schedules/all-schedule-model";
import { Separator } from "@/components/ui/separator";
import { usePagination } from "@/hooks/use-pagination";
import { ROUTE } from "@/constants/routes";
import { DataTable } from "@/components/shared/data-table";

export default function HistoryRecordsPage() {
  const params = useParams();
  const scheduleId = params?.scheduleId ? Number(params.scheduleId) : null;
  const studentId = params?.studentId ? Number(params.studentId) : null;

  const dispatch = useAppDispatch();
  const attendanceHistoryData = useAppSelector((state) => state.attendance.history);
  const scheduleDetail = useAppSelector((state) => state.scheduleList.selectedSchedule);
  const isLoading = useAppSelector((state) => state.attendance.isLoading);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const searchParams = useSearchParams();

  const { currentPage, currentPageSize, updateUrlWithPage, handlePageChange, handlePageSizeChange, getDisplayIndex } =
    usePagination({
      baseRoute: ROUTE.ATTENDANCE.HISTORY_RECORD_DETAIL(String(scheduleId), String(studentId)),
    });

  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    if (!pageParam) updateUrlWithPage(1, true);
  }, [searchParams, updateUrlWithPage]);

  const fetchAttendanceHistory = useCallback(async () => {
    try {
      const response = await dispatch(fetchAllAttendanceHistoryThunk({
        scheduleId: Number(scheduleId),
        studentId: Number(studentId),
        finalizationStatus: "FINAL",
        pageNo: currentPage || 1,
        pageSize: currentPageSize,
      })).unwrap();

      if (response && response.totalPages > 0 && currentPage > response.totalPages) {
        updateUrlWithPage(response.totalPages);
      }
    } catch {
      toast.error("An error occurred while loading attendance history");
    }
  }, [studentId, scheduleId, currentPage, currentPageSize, updateUrlWithPage, dispatch]);

  useEffect(() => {
    fetchAttendanceHistory();
  }, [fetchAttendanceHistory]);

  const loadScheduleData = useCallback(async () => {
    if (!scheduleId) return;
    try {
      await dispatch(fetchScheduleByIdService(scheduleId)).unwrap();
    } catch {
      toast.error("Error fetching schedule data");
    }
  }, [scheduleId, dispatch]);

  useEffect(() => {
    loadScheduleData();
  }, [loadScheduleData]);

  const exportToExcel = async (): Promise<void> => {
    setIsSubmitting(true);
    try {
      setIsLoading(true);
      const allDataResponse: AttendanceHistoryModel[] = await dispatch(fetchAttendanceHistoryExcelThunk({
        scheduleId: Number(scheduleId),
        studentId: Number(studentId),
        finalizationStatus: "FINAL",
      })).unwrap();

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Attendance History Data");
      const columns: string[] = AttendanceHistoryExcelTableHeader;

      worksheet.mergeCells(1, 1, 1, columns.length);
      const titleCell = worksheet.getCell("A1");
      titleCell.value = "List Attendance History Data";
      titleCell.font = { size: 16, bold: true, color: { argb: "FFFFFFFF" } };
      titleCell.alignment = { vertical: "middle", horizontal: "center" };
      titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F4E78" } };

      const headerRow = worksheet.getRow(3);
      columns.forEach((text: string, idx: number) => {
        const cell = headerRow.getCell(idx + 1);
        cell.value = text;
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF007ACC" } };
        cell.border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
        const columnWidths = [5, 15, 25, 27, 20, 15, 15, 15, 30];
        worksheet.getColumn(idx + 1).width = columnWidths[idx];
      });

      allDataResponse.forEach((item: AttendanceHistoryModel, i: number) => {
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
        row.eachCell((cell) => {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: i % 2 === 0 ? "FFF3F3F3" : "FFFFFFFF" } };
          cell.border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
          cell.alignment = { vertical: "middle", horizontal: "center" };
        });
        const attendanceCell = row.getCell(6);
        const status = item.status?.toLowerCase();
        if (status === "absent") attendanceCell.font = { color: { argb: "FFFF0000" }, bold: true };
        else if (status === "present") attendanceCell.font = { color: { argb: "FF00AA00" }, bold: true };
      });

      worksheet.getColumn(8).eachCell((cell, rowNumber: number) => {
        if (rowNumber > 3 && cell.value) {
          try { cell.value = new Date(cell.value as string); cell.numFmt = "dd-mm-yyyy"; } catch { /* skip */ }
        }
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(
        new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
        `attendance_history_${format(new Date(), "yyyy-MM-dd")}.xlsx`
      );
      toast.success(`Excel exported! Total records: ${allDataResponse.length}`);
    } catch {
      toast.error("Error exporting to Excel. Please try again.");
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  const totalStatuses = attendanceHistoryData?.totalElements || 0;
  const presentStatuses = attendanceHistoryData?.content?.filter((r) => r.status === "PRESENT").length || 0;
  const absentStatuses = attendanceHistoryData?.content?.filter((r) => r.status === "ABSENT").length || 0;

  const tableColumns = createAttendanceStudentHistoryColumns({ getDisplayIndex });

  return (
    <div className="space-y-4">
      <AttendanceHeader title="View Class Attendance" schedule={scheduleDetail} />

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base font-medium">Attendance - Student List</CardTitle>
          <ExcelDownloadButton onClick={exportToExcel} isLoading={isSubmitting} />
        </CardHeader>

        <div className="px-6 pb-2">
          <Separator className="mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded-lg hover:scale-105 transition-transform duration-200">
              <div className="text-xs text-muted-foreground">Total Students</div>
              <div className="text-lg font-semibold">{totalStatuses}</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg hover:scale-105 transition-transform duration-200">
              <div className="text-xs text-green-600">Present</div>
              <div className="text-lg font-semibold text-green-700">{presentStatuses}</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg hover:scale-105 transition-transform duration-200">
              <div className="text-xs text-red-600">Absent</div>
              <div className="text-lg font-semibold text-red-700">{absentStatuses}</div>
            </div>
          </div>
        </div>

        <CardContent className="p-4">
          <DataTable
            data={attendanceHistoryData?.content ?? null}
            columns={tableColumns}
            loading={isLoading}
            currentPage={currentPage}
            totalPages={attendanceHistoryData?.totalPages ?? 0}
            totalElements={attendanceHistoryData?.totalElements}
            onPageChange={handlePageChange}
            pageSize={currentPageSize}
            onPageSizeChange={handlePageSizeChange}
            emptyMessage="No Record"
            getRowKey={(history) => history.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
