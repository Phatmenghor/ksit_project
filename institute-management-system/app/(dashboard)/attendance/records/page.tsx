"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Tally1 } from "lucide-react";
import { createAttendanceRecordsColumns } from "./columns";
import { Card, CardContent } from "@/components/ui/card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { StatusEnum } from "@/constants/constant";
import { ROUTE } from "@/constants/routes";
import { ClassModel } from "@/model/master-data/class/all-class-model";
import { StudentModel } from "@/model/user/student/student.request.model";
import { ComboboxSelectClass } from "@/components/shared/ComboBox/combobox-class";
import { usePagination } from "@/hooks/use-pagination";
import { Constants } from "@/constants/text-string";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { format } from "date-fns";
import { StudentListExcelTableHeader } from "@/constants/excel/student-header";
import { AppIcons } from "@/constants/icons/icon";
import { formatDate } from "@/utils/date/date";
import { ComboboxSelectSchedule } from "@/components/shared/ComboBox/combobox-schedule";
import { ScheduleModel } from "@/model/schedules/all-schedule-model";
import { CollapsibleFilterPanel } from "@/components/shared/filter";
import { DataTable } from "@/components/shared/data-table";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectStudentData,
  selectStudentIsLoading,
  selectStudentFilters,
} from "@/features/students/store/selectors/student-selectors";
import {
  setSearchFilter,
  setClassFilter,
  setScheduleFilter,
  setAcademicYearFilter,
  setPageNo,
  resetFilters,
} from "@/features/students/store/slice/student-slice";
import { fetchAllStudentsService } from "@/features/students/store/thunks/student-thunks";
import { getAllStudentsListService } from "@/service/user/student.service";
import { useDebounce } from "@/utils/debounce/debounce";

export default function AttendanceStudentsListPage() {
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectStudentData);
  const isLoading = useAppSelector(selectStudentIsLoading);
  const filters = useAppSelector(selectStudentFilters);

  const [isExporting, setIsExporting] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassModel | undefined>(undefined);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleModel | undefined>(undefined);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);

  const router = useRouter();

  const { currentPage, currentPageSize, updateUrlWithPage, handlePageChange, handlePageSizeChange } =
    usePagination({ baseRoute: ROUTE.ATTENDANCE.STUDENT_LIST_RECORD });

  const searchDebounce = useDebounce(filters.search, 500);

  useEffect(() => {
    dispatch(
      fetchAllStudentsService({
        search: searchDebounce,
        classId: filters.classId,
        scheduleId: filters.scheduleId,
        academicYear: filters.academicYear,
        status: StatusEnum.ACTIVE,
        pageNo: currentPage,
        pageSize: currentPageSize,
      })
    );
  }, [dispatch, searchDebounce, filters.classId, filters.scheduleId, filters.academicYear, currentPage, currentPageSize]);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
    if (currentPage !== 1) updateUrlWithPage(1);
  };

  const handleClassChange = (e: ClassModel | null) => {
    setSelectedClass(e ?? undefined);
    dispatch(setClassFilter(e?.id));
  };

  const handleScheduleChange = (e: ScheduleModel | null) => {
    setSelectedSchedule(e ?? undefined);
    dispatch(setScheduleFilter(e?.id));
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    dispatch(setAcademicYearFilter(year));
  };

  const exportToExcel = async (): Promise<void> => {
    setIsExporting(true);
    try {
      const studentData = data?.content?.length;
      if ((studentData || 0) === 0) { toast.warning("No data available to export."); return; }
      if ((studentData ?? 0) > Constants.EXCEL_LIMIT) {
        toast.info(`Only ${Constants.EXCEL_LIMIT} items were exported.`); return;
      }

      const allStudentsRes = await getAllStudentsListService({
        academicYear: filters.academicYear,
        classId: filters.classId,
        search: filters.search || undefined,
        status: StatusEnum.ACTIVE,
        scheduleId: filters.scheduleId,
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Student list Data");
      const columns: string[] = StudentListExcelTableHeader;
      const PRIMARY_COLOR = "FF024D3E";

      worksheet.mergeCells(1, 1, 1, columns.length);
      const titleCell = worksheet.getCell("A1");
      titleCell.value = "List Student Data";
      titleCell.font = { size: 16, bold: true, color: { argb: "FFFFFFFF" } };
      titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF013328" } };
      worksheet.getRow(1).height = 26;

      const headerRow = worksheet.getRow(3);
      const columnWidths = [5, 15, 25, 20, 30, 30, 12, 18, 15, 15, 30, 16, 22];
      columns.forEach((text, idx) => {
        const cell = headerRow.getCell(idx + 1);
        cell.value = text;
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: PRIMARY_COLOR } };
        cell.border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
        worksheet.getColumn(idx + 1).width = columnWidths[idx];
      });

      allStudentsRes?.forEach((item: StudentModel, i: number) => {
        const row = worksheet.addRow([
          i + 1,
          item.username || "---",
          item.email || "---",
          item.identifyNumber || "---",
          `${item.khmerFirstName || ""} ${item.khmerLastName || ""}`.trim() || "---",
          `${item.englishFirstName || ""} ${item.englishLastName || ""}`.trim() || "---",
          item.gender || "---",
          item.studentStatus || "---",
          item.dateOfBirth ? formatDate(item.dateOfBirth) : "---",
          item.phoneNumber || "---",
          `${item?.studentClass?.code || ""} - ${item?.studentClass?.major?.name || ""}`,
          item.status || "---",
          item.createdAt ? formatDate(item.createdAt) : "---",
        ]);
        row.eachCell((cell) => {
          cell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
          cell.border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: i % 2 === 0 ? "FFF3F3F3" : "FFFFFFFF" } };
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
        `student_list_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
      toast.success(`Excel exported! Total: ${allStudentsRes?.length}`);
    } catch {
      toast.error("Error exporting to Excel.");
    } finally {
      setIsExporting(false);
    }
  };

  const tableColumns = createAttendanceRecordsColumns({ currentPage, currentPageSize, router });

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-none bg-transparent p-0">
        <CardContent className="p-0 space-y-2">
          <PageBreadcrumb
            items={[
              { label: "Attendance", href: ROUTE.ATTENDANCE.STUDENT_LIST_RECORD },
              { label: "Student List" },
            ]}
          />
        </CardContent>
      </Card>

      <CollapsibleFilterPanel
        config={{
          title: "Student List",
          totalCount: data?.totalElements,
          searchValue: filters.search,
          searchPlaceholder: "Search...",
          onSearchChange: handleSearchChange,
          filters: [
            {
              id: "year",
              type: "year",
              label: "Academic Year",
              value: selectedYear ?? 0,
              onChange: handleYearChange,
            },
            {
              id: "class",
              type: "custom",
              label: "Class",
              value: selectedClass ?? null,
              onChange: (v) => handleClassChange(v ?? null),
              render: ({ value, onChange }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-foreground/80">Class</label>
                  <ComboboxSelectClass dataSelect={value} onChangeSelected={onChange} />
                </div>
              ),
            },
            {
              id: "schedule",
              type: "custom",
              label: "Schedule",
              value: selectedSchedule ?? null,
              onChange: (v) => handleScheduleChange(v ?? null),
              render: ({ value, onChange }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-foreground/80">Schedule</label>
                  <ComboboxSelectSchedule dataSelect={value} onChangeSelected={onChange} />
                </div>
              ),
            },
          ],
          onClearAll: () => {
            dispatch(resetFilters());
            setSelectedClass(undefined);
            setSelectedSchedule(undefined);
            setSelectedYear(undefined);
          },
          extraActions: (
            <Button
              onClick={exportToExcel}
              variant="outline"
              size="sm"
              className="h-8 px-2 border-gray-200 py-5"
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <img src={AppIcons.Excel} alt="excel" className="h-4 w-4 lg:h-5 lg:w-5" />
                  <span className="ml-1 text-xs font-medium">Excel</span>
                  <Tally1 className="-mr-[12px] text-gray-300" />
                  <Download className="h-4 w-4" />
                </>
              )}
            </Button>
          ),
        }}
        essentialFilterIds={["year", "class"]}
      />

      <DataTable
        data={data?.content ?? null}
        columns={tableColumns}
        loading={isLoading}
        currentPage={currentPage}
        totalPages={data?.totalPages ?? 0}
        totalElements={data?.totalElements}
        onPageChange={(page) => { dispatch(setPageNo(page)); handlePageChange(page); }}
        pageSize={currentPageSize}
        onPageSizeChange={handlePageSizeChange}
        emptyMessage="No student found"
        getRowKey={(s) => s.id}
      />
    </div>
  );
}
