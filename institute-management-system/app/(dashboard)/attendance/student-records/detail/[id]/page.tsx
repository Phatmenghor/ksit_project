"use client";

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { ComboboxSelectClass } from "@/components/shared/ComboBox/combobox-class";
import { YearSelector } from "@/components/shared/year-selector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SemesterFilter } from "@/constants/constant";
import { ROUTE } from "@/constants/routes";
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
  getAllAttedanceHistoryCountService,
  getAllAttedanceHistoryExcelService,
  getAllAttendanceHistoryService,
} from "@/service/schedule/attendance.service";
import { toast } from "sonner";
import PaginationPage from "@/components/shared/pagination-page";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, Search, Tally1, X } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import Loading from "@/components/shared/loading";
import { formatDate } from "@/utils/date/dd-mm-yyyy-format";
import { Badge } from "@/components/ui/badge";
import { DateRangePicker } from "@/components/shared/start-end-date";
import { Constants } from "@/constants/text-string";
import { formatType } from "@/constants/format-enum/formate-type-attendance";
import { AllAttendanceHistoryModel } from "@/model/attendance/attendance-history";
import { CardHeaderSection } from "@/components/shared/layout/card-header-section";
import { AppIcons } from "@/constants/icons/icon";
import { useIsMobile } from "@/hooks/use-mobile";
import { useParams, useSearchParams } from "next/navigation";
import { usePagination } from "@/hooks/use-pagination";
import { ComboboxSelectCourse } from "@/components/shared/ComboBox/combobox-course";
import { CourseModel } from "@/model/master-data/course/all-course-model";
import { ComboboxSelectSchedule } from "@/components/shared/ComboBox/combobox-schedule";
import { ScheduleModel } from "@/model/schedules/all-schedule-model";

export default function StudentAttendancePage() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [selectedSemester, setSelectedSemester] = useState<string>("ALL");

  const [selectAcademicYear, setSelectAcademicYear] = useState<
    number | undefined
  >();
  const [selectedClass, setSelectedClass] = useState<ClassModel | undefined>(
    undefined
  );
  const [selectedCourse, setSelectedCourse] = useState<CourseModel | undefined>(
    undefined
  );
  const [selectedSchedule, setSelectedSchedule] = useState<
    ScheduleModel | undefined
  >(undefined);
  const [attendanceHistoryData, setAttendanceHistoryData] =
    useState<AllAttendanceHistoryModel | null>(null);
  const params = useParams();
  const studentId = params.id as string;

  // Date filter states
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const searchParams = useSearchParams();

  const { currentPage, updateUrlWithPage, handlePageChange, getDisplayIndex } =
    usePagination({
      baseRoute: ROUTE.ATTENDANCE.STUDENT_LIST_RECORD_DETAIL(studentId),
      defaultPageSize: 10,
    });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (currentPage !== 1) {
      updateUrlWithPage(1);
    }
  };

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
          search: debouncedSearchQuery,
          academyYear: selectAcademicYear,
          semester: selectedSemester != "ALL" ? selectedSemester : undefined,
          classId: selectedClass?.id,
          pageNo: currentPage,
          pageSize: 30,
          studentId: studentId ? parseInt(studentId) : undefined,
          finalizationStatus: "FINAL",
          startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
          endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
          ...filter,
        });
        console.log(response);

        setAttendanceHistoryData(response);
        if (response.totalPages > 0 && currentPage > response.totalPages) {
          updateUrlWithPage(response.totalPages);
          return;
        }
      } catch (error: any) {
        console.error("Error fetching requests:", error);
        toast.error("An error occurred while loading attendance history");
        setAttendanceHistoryData(null);
      } finally {
        setIsLoading(false);
      }
    },
    [
      debouncedSearchQuery,
      selectedClass,
      selectAcademicYear,
      currentPage,
      selectedSemester,
      startDate,
      endDate,
    ]
  );

  useEffect(() => {
    fetchAttendanceHistory({ pageNo: currentPage });
  }, [
    debouncedSearchQuery,
    selectedClass,
    selectAcademicYear,
    selectedSemester,
    currentPage,
    startDate,
    endDate,
  ]);

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

  const handleYearChange = (e: number) => {
    setSelectAcademicYear(e);
  };

  const handleScheduleChange = (e: ScheduleModel | null) => {
    setSelectedSchedule(e ?? undefined);
    updateUrlWithPage(1);
  };

  const handleCourseChange = (e: CourseModel | null) => {
    setSelectedCourse(e ?? undefined);
    updateUrlWithPage(1);
  };

  const clearStartDate = () => {
    setStartDate(undefined);
    updateUrlWithPage(1);
  };

  const clearEndDate = () => {
    setEndDate(undefined);
    updateUrlWithPage(1);
  };

  // Export to Excel - Fixed version
  const exportToExcel = async (): Promise<void> => {
    setIsSubmitting(true);

    try {
      setIsLoading(true);
      // Create a proper filter object for the API call
      const exportFilter: AttendanceHistoryFilter = {
        search: debouncedSearchQuery,
        academyYear: selectAcademicYear,
        finalizationStatus: "FINAL",
        semester: selectedSemester !== "ALL" ? selectedSemester : undefined,
        classId: selectedClass?.id,
        startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
        endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
      };

      // count data
      const countFilter = await getAllAttedanceHistoryCountService(
        exportFilter
      );

      if ((countFilter || 0) === 0) {
        toast.warning("No data available to export.");
        setIsSubmitting(false);
        return;
      }

      // EXCEL_LIMIT : limit data to export
      if (countFilter > Constants.EXCEL_LIMIT) {
        toast.info(
          `Only ${Constants.EXCEL_LIMIT} items were exported. Too many records. Please filter the data.`
        );
        setIsSubmitting(false);
        return;
      }

      // Fetch data for export
      const allDataResponse: AttendanceHistoryModel[] =
        await getAllAttedanceHistoryExcelService(exportFilter);

      console.log("Export response:", allDataResponse);

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
            console.warn("Date parsing failed for:", cell.value);
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
      console.error("Error exporting to Excel:", error);
      toast.error("Error exporting to Excel. Please try again.");
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <CardHeaderSection
        breadcrumbs={[
          { label: "Dashboard", href: ROUTE.DASHBOARD },
          { label: "Student Record", href: "" },
        ]}
        title="Student Record"
        customSelect={
          <div className="flex flex-col gap-4">
            {/* First row: Search, Class, Year, and Semester */}
            <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-end md:gap-2">
              <div className="relative w-full lg:min-w-[700px] min-w-[200px] md:w-auto md:flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name or ID..."
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="w-full min-w-[200px] md:w-auto md:flex-1">
                <ComboboxSelectSchedule
                  dataSelect={selectedSchedule ?? null}
                  onChangeSelected={handleScheduleChange}
                  disabled={isSubmitting}
                />
              </div>
              <div className="w-full min-w-[200px] md:w-auto md:flex-1">
                <ComboboxSelectCourse
                  dataSelect={selectedCourse ?? null}
                  onChangeSelected={handleCourseChange}
                  disabled={isSubmitting}
                />
              </div>
              <div className="w-full min-w-[200px] md:w-auto md:flex-1">
                <YearSelector
                  title="Select Year"
                  onChange={handleYearChange}
                  value={selectAcademicYear || 0}
                />
              </div>
              <div className="w-full min-w-[200px] md:w-auto md:flex-1">
                <Select
                  onValueChange={setSelectedSemester}
                  value={selectedSemester}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {SemesterFilter.map((semester) => (
                      <SelectItem key={semester.value} value={semester.value}>
                        {semester.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Second row: Date pickers */}
            <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-end md:gap-2 justify-between">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-2">
                <DateRangePicker
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                  clearStartDate={clearStartDate}
                  clearEndDate={clearEndDate}
                />
              </div>

              {/* export excel */}
              <div>
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-sm mr-2">Export Data by Class</span>
                  <Button
                    onClick={exportToExcel}
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 border-gray-200 py-5"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loading />
                    ) : (
                      <>
                        <img
                          src={AppIcons.Excel}
                          alt="excel Icon"
                          className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground flex-shrink-0"
                        />{" "}
                        <span className="ml-1 text-xs font-medium">Excel</span>
                        <Tally1 className="-mr-[12px] text-gray-300" />
                        <Download className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        }
      />

      <div className={`overflow-x-auto mt-4 ${useIsMobile() ? "pl-4" : ""}`}>
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
                    colSpan={9}
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
                      <TableCell>{history.identifyNumber || "---"}</TableCell>
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
                      <TableCell>{history.comment || "---"}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {attendanceHistoryData && (
        <div className="mt-8 flex justify-end animate-in slide-in-from-bottom-4 duration-500 delay-1000">
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
