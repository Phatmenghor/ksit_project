"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Download,
  Eye,
  Loader2,
  Pencil,
  RotateCcw,
  Tally1,
  Trash2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import {
  editStudentService,
  getAllStudentsListService,
  getAllStudentsService,
} from "@/service/user/student.service";
import { StatusEnum } from "@/constants/constant";
import { ROUTE } from "@/constants/routes";
import { ClassModel } from "@/model/master-data/class/all-class-model";
import { useDebounce } from "@/utils/debounce/debounce";
import ChangePasswordModal from "@/components/dashboard/users/shared/change-password-modal";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import {
  AllStudentModel,
  RequestAllStudent,
  StudentModel,
} from "@/model/user/student/student.request.model";
import Loading from "@/components/shared/loading";
import { ComboboxSelectClass } from "@/components/shared/ComboBox/combobox-class";
import { usePagination } from "@/hooks/use-pagination";
import { Constants } from "@/constants/text-string";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { format } from "date-fns";
import { StudentListExcelTableHeader } from "@/constants/excel/student-header";
import { AppIcons } from "@/constants/icons/icon";
import { formatDate } from "@/utils/date/date";
import { formatEnumLabel } from "@/utils/general/format-enum-label";
import { ComboboxSelectSchedule } from "@/components/shared/ComboBox/combobox-schedule";
import { ScheduleModel } from "@/model/schedules/all-schedule-model";
import { CollapsibleFilterPanel } from "@/components/shared/filter";
import { DataTable, TableColumn } from "@/components/shared/data-table";

export default function StudentsListPage() {
  // Core state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
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

  // Main student data from API
  const [allStudentData, setAllStudentData] = useState<AllStudentModel | null>(
    null
  );

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

  const { currentPage, currentPageSize, updateUrlWithPage, handlePageChange, handlePageSizeChange, getDisplayIndex } =
    usePagination({
      baseRoute: ROUTE.STUDENTS.LIST,
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
      setIsLoading(true);

      try {
        const response = await getAllStudentsService({
          ...param,
          pageNo: currentPage,
          pageSize: currentPageSize,
          academicYear: selectAcademicYear,
          scheduleId: selectedSchedule?.id,
          search: debouncedSearchQuery,
          status: StatusEnum.ACTIVE,
          classId: selectedClass?.id,
        });

        if (response) {
          setAllStudentData(response);
          // Handle case where current page exceeds total pages
          if (response.totalPages > 0 && currentPage > response.totalPages) {
            updateUrlWithPage(response.totalPages);
            return;
          }
        }
      } catch (error) {
        toast.error("An error occurred while loading student");
      } finally {
        setIsLoading(false);
      }
    },
    [
      debouncedSearchQuery,
      currentPage,
      selectedClass,
      selectedSchedule,
      selectAcademicYear,
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

  const handleYearChange = (year: number) => {
    setSelectAcademicYear(year);
  };

  const handleClassChange = (e: ClassModel | null) => {
    setSelectedClass(e ?? undefined);
  };

  const handleScheduleChange = (e: ScheduleModel | null) => {
    setSelectedSchedule(e ?? undefined);
  };

  // Delete selected student (optimistic UI update)
  async function handleDeleteStudent() {
    if (!selectedStudent) return;

    setIsSubmitting(true);
    try {
      const originalData = allStudentData;

      // Optimistically remove student from UI
      setAllStudentData((prevData) => {
        if (!prevData) return null;
        const updatedContent = prevData.content.filter(
          (item) => item.id !== selectedStudent.id
        );
        return {
          ...prevData,
          content: updatedContent,
          totalElements: prevData.totalElements - 1,
        };
      });

      const response = await editStudentService(selectedStudent.id, {
        status: StatusEnum.INACTIVE,
      });

      if (response) {
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
        setAllStudentData(originalData);
        toast.error("Failed to delete student");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the student");
      loadStudents({});
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
    }
  }

  // Export to Excel
  const exportToExcel = async (): Promise<void> => {
    setIsExporting(true);

    try {
      const studentData = allStudentData?.content?.length;

      if ((studentData || 0) === 0) {
        toast.warning("No data available to export.");
        return;
      }

      // EXCEL_LIMIT : limit data to export
      if ((studentData ?? 0) > Constants.EXCEL_LIMIT) {
        toast.info(
          `Only ${Constants.EXCEL_LIMIT} items were exported. Too many records. Please filter the data.`
        );
        return;
      }

      const allStudentsRes = await getAllStudentsListService({
        academicYear: selectAcademicYear || undefined,
        classId: selectedClass?.id || undefined,
        search: debouncedSearchQuery || undefined,
        status: StatusEnum.ACTIVE || undefined,
        scheduleId: selectedSchedule?.id || undefined,
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Student list Data");

      // Header table excel
      const columns: string[] = StudentListExcelTableHeader;
      const PRIMARY_COLOR = "FF024D3E";
      const PRIMARY_COLOR_DARK = "FF013328";

      // Add title row at Row 1
      worksheet.mergeCells(1, 1, 1, columns.length);
      const titleCell = worksheet.getCell("A1");
      titleCell.value = "List Student Data";
      titleCell.font = { size: 16, bold: true, color: { argb: "FFFFFFFF" } };
      titleCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
      titleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: PRIMARY_COLOR_DARK },
      };
      worksheet.getRow(1).height = 26;

      // Add header row at Row 3
      const headerRow = worksheet.getRow(3);
      const columnWidths = [
        5, 15, 25, 20, 30, 30, 12, 18, 15, 15, 30, 16, 22,
      ];
      columns.forEach((text: string, idx: number) => {
        const cell = headerRow.getCell(idx + 1);
        cell.value = text;
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: PRIMARY_COLOR },
        };
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };

        worksheet.getColumn(idx + 1).width = columnWidths[idx];
      });
      headerRow.height = 22;

      allStudentsRes?.forEach((item: StudentModel, i: number) => {
        const khmerFullName =
          `${item.khmerFirstName || ""} ${item.khmerLastName || ""}`.trim() ||
          "---";
        const englishFullName =
          `${item.englishFirstName || ""} ${item.englishLastName || ""}`.trim() ||
          "---";

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
          `${item?.studentClass?.code || ""} - ${
            item?.studentClass?.major?.name || ""
          }` || "---",
          formatEnumLabel(item.status),
          item.createdAt ? formatDate(item.createdAt) : "---",
        ]);

        row.eachCell((cell) => {
          cell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
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
      setIsExporting(false);
    }
  };

  const tableColumns: TableColumn<StudentModel>[] = [
    {
      key: "index",
      label: "#",
      width: "50px",
      render: (_item, index) => getDisplayIndex(index),
    },
    {
      key: "username",
      label: "Username",
      render: (student) => student.username || "---",
    },
    {
      key: "fullnameKH",
      label: "Fullname (KH)",
      render: (student) =>
        `${student.khmerFirstName || ""} ${student.khmerLastName || ""}`.trim() ||
        "---",
    },
    {
      key: "fullnameEN",
      label: "Fullname (EN)",
      render: (student) =>
        `${student.englishFirstName || ""} ${student.englishLastName || ""}`.trim() ||
        "---",
    },
    {
      key: "gender",
      label: "Gender",
      render: (student) => formatEnumLabel(student.gender),
    },
    {
      key: "dateOfBirth",
      label: "Date Of Birth",
      render: (student) =>
        student.dateOfBirth ? formatDate(student.dateOfBirth) : "---",
    },
    {
      key: "classCode",
      label: "Class code",
      render: (student) =>
        `${student?.studentClass?.code || ""} - ${student?.studentClass?.major?.name || ""}` ||
        "---",
    },
    {
      key: "actions",
      label: "Actions",
      width: "160px",
      render: (student) => (
        <div className="flex justify-start space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => {
                    router.push(
                      `${ROUTE.STUDENTS.VIEW(String(student.id))}`
                    );
                  }}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-gray-200 hover:bg-gray-300"
                  disabled={isSubmitting}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Student Detail</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() =>
                    router.push(
                      `${ROUTE.STUDENTS.EDIT_STUDENT(String(student.id))}`
                    )
                  }
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-gray-200 hover:bg-gray-300"
                  disabled={isSubmitting}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => {
                    setSelectedStudent(student);
                    setIsChangePasswordDialogOpen(true);
                  }}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-gray-200 hover:bg-gray-300"
                  disabled={isSubmitting}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset Password</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => {
                    setSelectedStudent(student);
                    setIsDeleteDialogOpen(true);
                  }}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-red-500 text-white hover:text-gray-100 hover:bg-red-600"
                  disabled={isSubmitting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ];

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
          totalCount: allStudentData?.totalElements,
          searchValue: searchQuery,
          searchPlaceholder: "Search...",
          onSearchChange: handleSearchChange,
          buttonText: "Add New",
          onButtonClick: () => router.push(ROUTE.STUDENTS.ADD_NEW),
          filters: [
            {
              id: "year",
              type: "year",
              label: "Academic Year",
              value: selectAcademicYear ?? 0,
              onChange: handleYearChange,
            },
            {
              id: "class",
              type: "custom",
              label: "Class",
              value: selectedClass ?? null,
              onChange: (v) => setSelectedClass(v ?? undefined),
              render: ({ value, onChange }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-foreground/80">Class</label>
                  <ComboboxSelectClass
                    dataSelect={value}
                    onChangeSelected={onChange}
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
              onChange: (v) => setSelectedSchedule(v ?? undefined),
              render: ({ value, onChange }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-foreground/80">Schedule</label>
                  <ComboboxSelectSchedule
                    dataSelect={value}
                    onChangeSelected={onChange}
                    disabled={isSubmitting}
                  />
                </div>
              ),
            },
          ],
          onClearAll: () => {
            setSelectAcademicYear(undefined);
            setSelectedClass(undefined);
            setSelectedSchedule(undefined);
            setSearchQuery("");
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
          ),
        }}
        essentialFilterIds={["year", "class"]}
      />

      <DataTable
        data={allStudentData?.content ?? null}
        columns={tableColumns}
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
