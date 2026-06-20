"use client";

import { useEffect, useState } from "react";
import { ExcelDownloadButton } from "@/components/shared/excel-download-button";
import { createStudentColumns } from "./columns";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { StatusEnum } from "@/constants/constant";
import { ROUTE } from "@/constants/routes";
import { ClassModel } from "@/model/master-data/class/all-class-model";
import ChangePasswordModal from "@/components/dashboard/users/shared/change-password-modal";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { StudentModel } from "@/model/user/student/student.request.model";
import { ComboboxSelectClass } from "@/components/shared/ComboBox/combobox-class";
import { usePagination } from "@/hooks/use-pagination";
import { useCachedEffect } from "@/hooks/use-cached-list";
import { Constants } from "@/constants/text-string";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { format } from "date-fns";
import { StudentListExcelTableHeader } from "@/constants/excel/student-header";
import { formatDate } from "@/utils/date/date";
import { formatEnumLabel } from "@/utils/general/format-enum-label";
import { ComboboxSelectSchedule } from "@/components/shared/ComboBox/combobox-schedule";
import { ScheduleModel } from "@/model/schedules/all-schedule-model";
import { CollapsibleFilterPanel } from "@/components/shared/filter";
import { AcademyYearFilter } from "@/components/shared/academy-year-filter";
import { DataTable } from "@/components/shared/data-table";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectStudentData,
  selectStudentIsLoading,
  selectStudentOperations,
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
import {
  fetchAllStudentsService,
  deleteStudentService,
  fetchStudentsListThunk,
} from "@/features/students/store/thunks/student-thunks";
import { useDebounce } from "@/utils/debounce/debounce";

export default function StudentsListPage() {
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectStudentData);
  const isLoading = useAppSelector(selectStudentIsLoading);
  const operations = useAppSelector(selectStudentOperations);
  const filters = useAppSelector(selectStudentFilters);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentModel | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const [selectedClass, setSelectedClass] = useState<ClassModel | undefined>(undefined);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleModel | undefined>(undefined);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);

  const router = useRouter();

  const { currentPage, currentPageSize, updateUrlWithPage, handlePageChange, handlePageSizeChange } =
    usePagination({ baseRoute: ROUTE.STUDENTS.LIST });

  const searchDebounce = useDebounce(filters.search, 500);

  useCachedEffect("students", () => {
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

  async function handleDeleteStudent() {
    if (!selectedStudent) return;
    const result = await dispatch(deleteStudentService(selectedStudent.id));
    if (deleteStudentService.fulfilled.match(result)) {
      toast.success(`Student ${selectedStudent.username ?? ""} deleted successfully`);
      if (data && data.content.length === 1 && currentPage > 1) {
        updateUrlWithPage(currentPage - 1);
      }
    } else {
      toast.error("Failed to delete student");
    }
    setIsDeleteDialogOpen(false);
    setSelectedStudent(null);
  }

  const exportToExcel = async (): Promise<void> => {
    setIsExporting(true);
    try {
      const studentData = data?.content?.length;
      if ((studentData || 0) === 0) {
        toast.warning("No data available to export.");
        return;
      }
      if ((studentData ?? 0) > Constants.EXCEL_LIMIT) {
        toast.info(`Only ${Constants.EXCEL_LIMIT} items were exported. Too many records. Please filter the data.`);
        return;
      }

      const allStudentsRes = await dispatch(
        fetchStudentsListThunk({
          academicYear: filters.academicYear,
          classId: filters.classId,
          search: filters.search || undefined,
          status: StatusEnum.ACTIVE,
          scheduleId: filters.scheduleId,
        })
      ).unwrap();

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Student list Data");
      const columns: string[] = StudentListExcelTableHeader;
      const PRIMARY_COLOR = "FF024D3E";
      const PRIMARY_COLOR_DARK = "FF013328";

      worksheet.mergeCells(1, 1, 1, columns.length);
      const titleCell = worksheet.getCell("A1");
      titleCell.value = "List Student Data";
      titleCell.font = { size: 16, bold: true, color: { argb: "FFFFFFFF" } };
      titleCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
      titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: PRIMARY_COLOR_DARK } };
      worksheet.getRow(1).height = 26;

      const headerRow = worksheet.getRow(3);
      const columnWidths = [5, 15, 25, 20, 30, 30, 12, 18, 15, 15, 30, 16, 22];
      columns.forEach((text: string, idx: number) => {
        const cell = headerRow.getCell(idx + 1);
        cell.value = text;
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: PRIMARY_COLOR } };
        cell.border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
        worksheet.getColumn(idx + 1).width = columnWidths[idx];
      });
      headerRow.height = 22;

      allStudentsRes?.forEach((item: StudentModel, i: number) => {
        const khmerFullName = `${item.khmerFirstName || ""} ${item.khmerLastName || ""}`.trim() || "---";
        const englishFullName = `${item.englishFirstName || ""} ${item.englishLastName || ""}`.trim() || "---";

        const row = worksheet.addRow([
          i + 1,
          item.username || "---",
          item.email || "---",
          item.identifyNumber || "---",
          khmerFullName,
          englishFullName,
          formatEnumLabel(item.gender),
          formatEnumLabel(item.studentStatus),
          item.dateOfBirth ? formatDate(item.dateOfBirth) : "---",
          item.phoneNumber || "---",
          `${item?.studentClass?.code || ""} - ${item?.studentClass?.major?.name || ""}` || "---",
          formatEnumLabel(item.status),
          item.createdAt ? formatDate(item.createdAt) : "---",
        ]);

        row.eachCell((cell) => {
          cell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
          cell.border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: i % 2 === 0 ? "FFF3F3F3" : "FFFFFFFF" } };
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      saveAs(blob, `student_list_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
      toast.success(`Excel file exported successfully! Total records: ${allStudentsRes?.length}`);
    } catch {
      toast.error("Error exporting to Excel. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const tableColumns = createStudentColumns({
    currentPage,
    currentPageSize,
    isDeleting: operations.isDeleting,
    router,
    onResetPassword: (s) => { setSelectedStudent(s); setIsChangePasswordDialogOpen(true); },
    onDelete: (s) => { setSelectedStudent(s); setIsDeleteDialogOpen(true); },
  });

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-none bg-transparent p-0">
        <CardContent className="p-0 space-y-2">
          <PageBreadcrumb items={[{ label: "Student List" }]} />
        </CardContent>
      </Card>

      <CollapsibleFilterPanel
        config={{
          title: "Student List",
          totalCount: data?.totalElements,
          searchValue: filters.search,
          searchPlaceholder: "Search...",
          onSearchChange: handleSearchChange,
          buttonText: "Add New",
          onButtonClick: () => router.push(ROUTE.STUDENTS.ADD_NEW),
          filters: [
            {
              id: "year",
              type: "custom",
              label: "Academic Year",
              value: selectedYear ?? 0,
              onChange: (v: unknown) => handleYearChange((v as number) || 0),
              render: ({ value, onChange }: { value: unknown; onChange: (v: unknown) => void }) => (
                <AcademyYearFilter
                  value={(value as number) ?? 0}
                  onChange={(y) => onChange(y)}
                />
              ),
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
                  <ComboboxSelectClass dataSelect={value} onChangeSelected={onChange} disabled={operations.isDeleting} />
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
                  <ComboboxSelectSchedule dataSelect={value} onChangeSelected={onChange} disabled={operations.isDeleting} />
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
            <ExcelDownloadButton onClick={exportToExcel} isLoading={isExporting} />
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

      <ChangePasswordModal
        isOpen={isChangePasswordDialogOpen}
        onClose={() => { setSelectedStudent(null); setIsChangePasswordDialogOpen(false); }}
        userId={selectedStudent?.id}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => { setIsDeleteDialogOpen(false); setSelectedStudent(null); }}
        onDelete={handleDeleteStudent}
        title="Delete Student"
        description="Are you sure you want to delete the student:"
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}
