"use client";

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { SemesterFilter } from "@/constants/constant";
import { ROUTE } from "@/constants/routes";
import { ClassModel } from "@/model/master-data/class/all-class-model";
import { useDebounce } from "@/utils/debounce/debounce";
import { useCallback, useEffect, useState } from "react";
import { AttendanceHistoryExcelTableHeader } from "@/constants/table/attendance-history";
import {
  AttendanceHistoryFilter,
  AttendanceHistoryModel,
} from "@/model/attendance/attendance-history";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchAllAttendanceHistoryThunk,
  fetchAttendanceHistoryExcelThunk,
  fetchAttendanceHistoryCountThunk,
} from "@/features/schedules/store/thunks/attendance-thunks";
import { format } from "date-fns";
import { ExcelDownloadButton } from "@/components/shared/excel-download-button";
import { DateRangePicker } from "@/components/shared/start-end-date";
import { Constants } from "@/constants/text-string";
import { createAttendanceRecordDetailColumns } from "./columns";
import { AllAttendanceHistoryModel } from "@/model/attendance/attendance-history";
import { useParams, useSearchParams } from "next/navigation";
import { usePagination } from "@/hooks/use-pagination";
import { ComboboxSelectCourse } from "@/components/shared/ComboBox/combobox-course";
import { CourseModel } from "@/model/master-data/course/all-course-model";
import { ComboboxSelectSchedule } from "@/components/shared/ComboBox/combobox-schedule";
import { ScheduleModel } from "@/model/schedules/all-schedule-model";
import { ComboboxSelectClass } from "@/components/shared/ComboBox/combobox-class";
import { AcademyYearFilter } from "@/components/shared/academy-year-filter";
import { DataTable } from "@/components/shared/data-table";
import { CollapsibleFilterPanel } from "@/components/shared/filter";
import { Card, CardContent } from "@/components/ui/card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";

export default function StudentAttendancePage() {
  const dispatch = useAppDispatch();
  const attendanceHistoryData = useAppSelector((state) => state.attendance.history);
  const isLoading = useAppSelector((state) => state.attendance.isLoading);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [selectedSemester, setSelectedSemester] = useState<string>("ALL");

  const [selectAcademicYear, setSelectAcademicYear] = useState<number>(0);
  const [selectedClass, setSelectedClass] = useState<ClassModel | undefined>(undefined);
  const [selectedCourse, setSelectedCourse] = useState<CourseModel | undefined>(undefined);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleModel | undefined>(undefined);

  const params = useParams();
  const studentId = params.id as string;
  const searchParams = useSearchParams();

  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const { currentPage, currentPageSize, updateUrlWithPage, handlePageChange, handlePageSizeChange, getDisplayIndex } =
    usePagination({ baseRoute: ROUTE.ATTENDANCE.STUDENT_LIST_RECORD_DETAIL(studentId) });

  // Initialise filters from URL query params passed by the records list page
  useEffect(() => {
    const classIdParam = searchParams.get("classId");
    const scheduleIdParam = searchParams.get("scheduleId");
    const academicYearParam = searchParams.get("academicYear");

    if (academicYearParam) setSelectAcademicYear(parseInt(academicYearParam));
    // class and schedule objects can't be reconstructed from just an id without an extra API call,
    // so we store the ids and pass them directly to the fetch
    if (classIdParam) setInitialClassId(parseInt(classIdParam));
    if (scheduleIdParam) setInitialScheduleId(parseInt(scheduleIdParam));

    const pageParam = searchParams.get("pageNo");
    if (!pageParam) updateUrlWithPage(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Store raw ids from URL so we can send them even without a full model object
  const [initialClassId, setInitialClassId] = useState<number | undefined>(undefined);
  const [initialScheduleId, setInitialScheduleId] = useState<number | undefined>(undefined);

  const fetchAttendanceHistory = useCallback(async () => {
    try {
      const response = await dispatch(fetchAllAttendanceHistoryThunk({
        search: debouncedSearchQuery,
        academyYear: selectAcademicYear || undefined,
        semester: selectedSemester !== "ALL" ? selectedSemester : undefined,
        classId: selectedClass?.id ?? initialClassId,
        courseId: selectedCourse?.id,
        scheduleId: selectedSchedule?.id ?? initialScheduleId,
        pageNo: currentPage,
        pageSize: currentPageSize,
        studentId: studentId ? parseInt(studentId) : undefined,
        finalizationStatus: "FINAL",
        startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
        endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
      })).unwrap();

      if (response && response.totalPages > 0 && currentPage > response.totalPages) {
        updateUrlWithPage(response.totalPages);
      }
    } catch {
      toast.error("An error occurred while loading attendance history");
    }
  }, [
    debouncedSearchQuery,
    selectedClass,
    selectedCourse,
    selectedSchedule,
    initialClassId,
    initialScheduleId,
    selectAcademicYear,
    currentPage,
    currentPageSize,
    selectedSemester,
    startDate,
    endDate,
    studentId,
    updateUrlWithPage,
  ]);

  useEffect(() => {
    fetchAttendanceHistory();
  }, [fetchAttendanceHistory]);

  const exportToExcel = async (): Promise<void> => {
    setIsSubmitting(true);
    try {
      setIsLoading(true);
      const exportFilter: AttendanceHistoryFilter = {
        search: debouncedSearchQuery,
        academyYear: selectAcademicYear || undefined,
        finalizationStatus: "FINAL",
        semester: selectedSemester !== "ALL" ? selectedSemester : undefined,
        classId: selectedClass?.id ?? initialClassId,
        courseId: selectedCourse?.id,
        scheduleId: selectedSchedule?.id ?? initialScheduleId,
        startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
        endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
      };

      const countFilter = await dispatch(fetchAttendanceHistoryCountThunk(exportFilter)).unwrap();
      if ((countFilter || 0) === 0) {
        toast.warning("No data available to export.");
        return;
      }
      if (countFilter > Constants.EXCEL_LIMIT) {
        toast.info(`Only ${Constants.EXCEL_LIMIT} items were exported. Please filter the data.`);
        return;
      }

      const allDataResponse: AttendanceHistoryModel[] = await dispatch(fetchAttendanceHistoryExcelThunk(exportFilter)).unwrap();

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

  const handleClearAll = () => {
    setSearchQuery("");
    setSelectedClass(undefined);
    setSelectedSchedule(undefined);
    setSelectedCourse(undefined);
    setSelectAcademicYear(0);
    setSelectedSemester("ALL");
    setStartDate(undefined);
    setEndDate(undefined);
    setInitialClassId(undefined);
    setInitialScheduleId(undefined);
  };

  const tableColumns = createAttendanceRecordDetailColumns({ getDisplayIndex });

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-none bg-transparent p-0">
        <CardContent className="p-0 space-y-2">
          <PageBreadcrumb
            items={[
              { label: "Attendance", href: ROUTE.ATTENDANCE.STUDENT_LIST_RECORD },
              { label: "Student Record" },
            ]}
          />
        </CardContent>
      </Card>

      <CollapsibleFilterPanel
        config={{
          title: "Student Record",
          totalCount: attendanceHistoryData?.totalElements,
          searchValue: searchQuery,
          searchPlaceholder: "Search by name or ID...",
          onSearchChange: (e) => {
            setSearchQuery(e.target.value);
            if (currentPage !== 1) updateUrlWithPage(1);
          },
          onBack: () => window.history.back(),
          filters: [
            {
              id: "year",
              type: "custom",
              label: "Academic Year",
              value: selectAcademicYear,
              onChange: (v: unknown) => setSelectAcademicYear((v as number) || 0),
              render: ({ value, onChange }: { value: unknown; onChange: (v: unknown) => void }) => (
                <AcademyYearFilter
                  value={(value as number) ?? 0}
                  onChange={(y) => onChange(y)}
                  disabled={isSubmitting}
                />
              ),
            },
            {
              id: "class",
              type: "custom",
              label: "Class",
              value: selectedClass ?? null,
              onChange: (v: unknown) => setSelectedClass((v as ClassModel) ?? undefined),
              render: ({ value, onChange }: { value: unknown; onChange: (v: unknown) => void }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-foreground/80">Class</label>
                  <ComboboxSelectClass
                    dataSelect={(value as ClassModel) ?? null}
                    onChangeSelected={(item) => { onChange(item); setInitialClassId(undefined); }}
                    disabled={isSubmitting}
                  />
                </div>
              ),
            },
            {
              id: "schedule",
              type: "custom",
              label: "Schedule",
              value: selectedSchedule ?? null,
              onChange: (v: unknown) => setSelectedSchedule((v as ScheduleModel) ?? undefined),
              render: ({ value, onChange }: { value: unknown; onChange: (v: unknown) => void }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-foreground/80">Schedule</label>
                  <ComboboxSelectSchedule
                    dataSelect={(value as ScheduleModel) ?? null}
                    onChangeSelected={(item) => { onChange(item); setInitialScheduleId(undefined); }}
                    disabled={isSubmitting}
                    allowClear
                  />
                </div>
              ),
            },
            {
              id: "course",
              type: "custom",
              label: "Course",
              value: selectedCourse ?? null,
              onChange: (v: unknown) => setSelectedCourse((v as CourseModel) ?? undefined),
              render: ({ value, onChange }: { value: unknown; onChange: (v: unknown) => void }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-foreground/80">Course</label>
                  <ComboboxSelectCourse
                    dataSelect={(value as CourseModel) ?? null}
                    onChangeSelected={(item) => onChange(item)}
                    disabled={isSubmitting}
                  />
                </div>
              ),
            },
            {
              id: "semester",
              type: "select",
              label: "Semester",
              value: selectedSemester,
              onChange: (v: unknown) => setSelectedSemester(String(v || "ALL")),
              options: SemesterFilter.map((s) => ({ value: s.value, label: s.label })),
            },
            {
              id: "dateRange",
              type: "custom",
              label: "Date Range",
              value: null,
              onChange: () => {},
              render: () => (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-foreground/80">Date Range</label>
                  <DateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                    clearStartDate={() => setStartDate(undefined)}
                    clearEndDate={() => setEndDate(undefined)}
                  />
                </div>
              ),
            },
          ],
          onClearAll: handleClearAll,
          extraActions: (
            <ExcelDownloadButton onClick={exportToExcel} isLoading={isSubmitting} />
          ),
        }}
      />

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
    </div>
  );
}
