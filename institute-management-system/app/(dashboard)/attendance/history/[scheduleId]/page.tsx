"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { StatusEnum } from "@/constants/constant";
import { ROUTE } from "@/constants/routes";
import { ClassModel } from "@/model/master-data/class/all-class-model";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchAllStudentsService,
  fetchStudentsListThunk,
  deleteStudentService,
} from "@/features/students/store/thunks/student-thunks";
import { useDebounce } from "@/utils/debounce/debounce";
import { createAttendanceHistoryColumns } from "./columns";
import ChangePasswordModal from "@/components/dashboard/users/shared/change-password-modal";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import {
  AllStudentModel,
  RequestAllStudent,
  StudentModel,
} from "@/model/user/student/student.request.model";
import { ComboboxSelectClass } from "@/components/shared/ComboBox/combobox-class";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePagination } from "@/hooks/use-pagination";
import { Constants } from "@/constants/text-string";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { format } from "date-fns";
import { StudentListExcelTableHeader } from "@/constants/excel/student-header";
import { formatDate } from "@/utils/date/date";
import { ComboboxSelectSchedule } from "@/components/shared/ComboBox/combobox-schedule";
import { ScheduleModel } from "@/model/attendance/schedule/schedule-model";
import { DataTable } from "@/components/shared/data-table";
import { CollapsibleFilterPanel } from "@/components/shared/filter";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { AcademyYearFilter } from "@/components/shared/academy-year-filter";
import { ExcelDownloadButton } from "@/components/shared/excel-download-button";

export default function StudentsListPage() {
  const dispatch = useAppDispatch();
  const allStudentData = useAppSelector((state) => state.studentList.data);
  const isLoading = useAppSelector((state) => state.studentList.isLoading);

  // Core state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectAcademicYear, setSelectAcademicYear] = useState<
    number | undefined
  >();
  const [selectedClass, setSelectedClass] = useState<ClassModel | undefined>(
    undefined
  );
  const [selectedSchedule, setSelectedSchedule] = useState<
    ScheduleModel | undefined
  >(undefined);

  // Dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] =
    useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentModel | null>(
    null
  );

  // Debounced search to reduce API call frequency
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const scheduleId = params?.scheduleId ? Number(params.scheduleId) : null;

  const { currentPage, currentPageSize, updateUrlWithPage, handlePageChange, handlePageSizeChange, getDisplayIndex } =
    usePagination({
      baseRoute: ROUTE.ATTENDANCE.STUDENT_LIST_HISTORY_RECORD(
        String(scheduleId)
      ),
    });

  // Handlers for search, year, class change
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

  // Fetch student data from server
  const loadStudents = useCallback(
    async (param: RequestAllStudent) => {
      try {
        const response = await dispatch(fetchAllStudentsService({
          ...param,
          pageNo: currentPage,
          pageSize: currentPageSize,
          academicYear: selectAcademicYear,
          scheduleId: scheduleId ? scheduleId : selectedSchedule?.id,
          search: debouncedSearchQuery,
          status: StatusEnum.ACTIVE,
          classId: selectedClass?.id,
        })).unwrap();

        if (response) {
          // Handle case where current page exceeds total pages
          if (response.totalPages > 0 && currentPage > response.totalPages) {
            updateUrlWithPage(response.totalPages);
            return;
          }
        }
      } catch (error) {
        toast.error("An error occurred while loading student");
      }
    },
    [
      debouncedSearchQuery,
      currentPage,
      currentPageSize,
      selectedClass,
      selectedSchedule,
      selectAcademicYear,
      scheduleId,
      updateUrlWithPage,
      dispatch,
    ]
  );

  // Run fetch on mount and when filters change
  useEffect(() => {
    loadStudents({});
  }, [
    selectedClass,
    currentPage,
    debouncedSearchQuery,
    selectAcademicYear,
    selectedSchedule,
  ]);

  const handleYearChange = (e: number) => {
    setSelectAcademicYear(e);
  };

  const handleClassChange = (e: ClassModel | null) => {
    setSelectedClass(e ?? undefined);
  };

  const handleScheduleChange = (e: ScheduleModel | null) => {
    setSelectedSchedule(e ?? undefined);
  };
  // Delete (soft-deactivate) selected student
  async function handleDeleteStudent() {
    if (!selectedStudent) return;

    setIsSubmitting(true);
    try {
      const result = await dispatch(deleteStudentService(selectedStudent.id));

      if (deleteStudentService.fulfilled.match(result)) {
        toast.success(
          `Student ${selectedStudent.username ?? ""} deleted successfully`
        );
        if (
          allStudentData &&
          allStudentData.content.length === 1 &&
          currentPage > 1
        ) {
          updateUrlWithPage(currentPage - 1);
        } else {
          await loadStudents({});
        }
      } else {
        toast.error("Failed to delete student");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the student");
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
    }
  }

  // Export to Excel - Fixed version
  const exportToExcel = async (): Promise<void> => {
    setIsSubmitting(true);

    try {
      // Create a proper filter object for the API call

      const studentData = allStudentData?.content?.length;

      if ((studentData || 0) === 0) {
        toast.warning("No data available to export.");
        setIsSubmitting(false);
        return;
      }

      // EXCEL_LIMIT : limit data to export
      if ((studentData ?? 0) > Constants.EXCEL_LIMIT) {
        toast.info(
          `Only ${Constants.EXCEL_LIMIT} items were exported. Too many records. Please filter the data.`
        );
        setIsSubmitting(false);
        return;
      }

      const allStudentsRes = await dispatch(fetchStudentsListThunk({
        academicYear: selectAcademicYear || undefined,
        classId: selectedClass?.id || undefined,
        search: debouncedSearchQuery || undefined,
        status: StatusEnum.ACTIVE || undefined,
        scheduleId: selectedSchedule?.id || undefined,
      })).unwrap();

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Student list Data");

      // Header table excel
      const columns: string[] = StudentListExcelTableHeader;

      // Add title row at Row 1
      worksheet.mergeCells(1, 1, 1, columns.length);
      const titleCell = worksheet.getCell("A1");
      titleCell.value = "List Student Data";
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

        const columnWidths = [5, 15, 25, 27, 20, 15, 15, 30, 40];
        worksheet.getColumn(idx + 1).width = columnWidths[idx];
      });

      allStudentsRes?.forEach((item: StudentModel, i: number) => {
        const row = worksheet.addRow([
          i + 1,
          item.username || "---",
          item.email || "---",
          item.status || "---",
          item.identifyNumber || "---",
          item.khmerFirstName || "---",
          item.khmerLastName || "---",
          item.englishFirstName || "---",
          item.englishLastName || "---",
          item.gender || "---",
          item.studentStatus || "---",
          item.dateOfBirth || "---",
          item.phoneNumber || "---",
          `${(item || item)?.studentClass?.code} - ${(item || item)?.studentClass?.major?.name
          }` || "---",
          formatDate(item.createdAt) || "---",
        ]);

        row.eachCell((cell) => {
          cell.alignment = { vertical: "middle", horizontal: "center" };
          cell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: i % 2 === 0 ? "FFF3F3F3" : "FFFFFFFF" },
          };
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // File name
      const fileName = `student_list_${format(new Date(), "yyyy-MM-dd")}.xlsx`;
      saveAs(blob, fileName);

      toast.success(
        `Excel file exported successfully! Total records: ${allStudentsRes?.length}`
      );
    } catch (error: unknown) {
      toast.error("Error exporting to Excel. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keep the roster in a stable order by student ID, ascending.
  const sortedStudents = allStudentData?.content
    ? [...allStudentData.content].sort((a, b) => a.id - b.id)
    : null;

  const columns = createAttendanceHistoryColumns({
    getDisplayIndex,
    router,
    scheduleId: String(scheduleId),
    isSubmitting,
  });

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
          onBack: () => router.back(),
          totalCount: allStudentData?.totalElements,
          searchValue: searchQuery,
          searchPlaceholder: "Search...",
          onSearchChange: handleSearchChange,
          filters: [
            {
              id: "year",
              type: "custom",
              label: "Academic Year",
              value: selectAcademicYear ?? 0,
              onChange: (v) => handleYearChange((v as number) || 0),
              render: ({ value, onChange }) => (
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
              value: selectedClass,
              onChange: handleClassChange,
              render: () => (
                <ComboboxSelectClass
                  dataSelect={selectedClass ?? null}
                  onChangeSelected={(item) => handleClassChange(item)}
                  disabled={isSubmitting}
                />
              ),
            },
            {
              id: "schedule",
              type: "custom",
              label: "Schedule",
              value: selectedSchedule,
              onChange: handleScheduleChange,
              render: () => (
                <ComboboxSelectSchedule
                  dataSelect={selectedSchedule ?? null}
                  onChangeSelected={handleScheduleChange}
                  disabled={isSubmitting}
                  allowClear
                />
              ),
            },
          ],
          extraActions: (
            <ExcelDownloadButton onClick={exportToExcel} isLoading={isSubmitting} />
          ),
        }}
      />

      <div className={`overflow-x-auto mt-4 ${useIsMobile() ? "pl-4" : ""}`}>
        <DataTable
          data={sortedStudents}
          columns={columns}
          loading={isLoading}
          currentPage={currentPage}
          totalPages={allStudentData?.totalPages ?? 0}
          totalElements={allStudentData?.totalElements}
          onPageChange={handlePageChange}
          pageSize={currentPageSize}
          onPageSizeChange={handlePageSizeChange}
          emptyMessage="No student found"
          getRowKey={(student) => student.id}
        />
      </div>

      <ChangePasswordModal
        isOpen={isChangePasswordDialogOpen}
        onClose={() => {
          setSelectedStudent(null);
          setIsChangePasswordDialogOpen(false);
        }}
        userId={selectedStudent?.id}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={handleDeleteStudent}
        title="Delete Student"
        description={`Are you sure you want to delete the student: ${selectedStudent?.username}?`}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
