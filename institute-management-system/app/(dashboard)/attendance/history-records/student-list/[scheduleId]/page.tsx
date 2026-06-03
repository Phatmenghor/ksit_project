"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  editStudentService,
  getAllStudentsListService,
  getAllStudentsService,
} from "@/service/user/student.service";
import { StatusEnum } from "@/constants/constant";
import { CardHeaderSection } from "@/components/shared/layout/card-header-section";
import { ROUTE } from "@/constants/routes";
import { YearSelector } from "@/components/shared/year-selector";
import { ClassModel } from "@/model/master-data/class/all-class-model";
import { useDebounce } from "@/utils/debounce/debounce";
import { StudentTableHeader } from "@/constants/table/user";
import ChangePasswordModal from "@/components/dashboard/users/shared/change-password-modal";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import {
  AllStudentModel,
  RequestAllStudent,
  StudentModel,
} from "@/model/user/student/student.request.model";
import Loading from "@/components/shared/loading";
import { ComboboxSelectClass } from "@/components/shared/ComboBox/combobox-class";
import PaginationPage from "@/components/shared/pagination-page";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePagination } from "@/hooks/use-pagination";
import { Constants } from "@/constants/text-string";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { format } from "date-fns";
import { StudentListExcelTableHeader } from "@/constants/excel/student-header";
import { formatDate } from "@/utils/date/date";
import { ComboboxSelectSchedule } from "@/components/shared/ComboBox/combobox-schedule";
import { ScheduleModel } from "@/model/schedules/all-schedule-model";

export default function StudentsListPage() {
  // Core state
  const [isLoading, setIsLoading] = useState<boolean>(true);
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
  const params = useParams();
  const scheduleId = params?.scheduleId ? Number(params.scheduleId) : null;

  const { currentPage, updateUrlWithPage, handlePageChange, getDisplayIndex } =
    usePagination({
      baseRoute: ROUTE.ATTENDANCE.STUDENT_LIST_HISTORY_RECORD(
        String(scheduleId)
      ),
      defaultPageSize: 10,
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
          pageSize: 30,
          academicYear: selectAcademicYear,
          scheduleId: scheduleId ? scheduleId : selectedSchedule?.id,
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
        } else {
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

  const handleYearChange = (e: number) => {
    setSelectAcademicYear(e);
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

  // Export to Excel - Fixed version
  const exportToExcel = async (): Promise<void> => {
    setIsSubmitting(true);

    try {
      setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <CardHeaderSection
        breadcrumbs={[
          { label: "Dashboard", href: ROUTE.DASHBOARD },
          { label: "Attendance", href: ROUTE.ATTENDANCE.STUDENT_LIST_RECORD },
          { label: "Student List", href: "" },
        ]}
        searchValue={searchQuery}
        searchPlaceholder="Search..."
        onSearchChange={handleSearchChange}
        buttonHref={ROUTE.STUDENTS.ADD_NEW}
        customSelect={
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-4">
            <div className="w-full min-w-[200px] md:w-1/2">
              <div className="w-full min-w-[200px]">
                <YearSelector
                  title="Select Year"
                  onChange={handleYearChange}
                  value={selectAcademicYear || 0}
                />
              </div>
            </div>

            <div className="w-full min-w-[200px] md:w-1/2">
              <ComboboxSelectClass
                dataSelect={selectedClass ?? null}
                onChangeSelected={handleClassChange}
                disabled={isSubmitting}
              />
            </div>
            <div className="w-full min-w-[200px] md:w-1/2">
              <ComboboxSelectSchedule
                dataSelect={selectedSchedule ?? null}
                onChangeSelected={handleScheduleChange}
                disabled={isSubmitting}
              />
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
                {StudentTableHeader.map((header, index) => (
                  <TableHead key={index} className={header.className}>
                    {header.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {allStudentData?.content.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={StudentTableHeader.length}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No student found
                  </TableCell>
                </TableRow>
              ) : (
                allStudentData?.content.map((student, index) => {
                  return (
                    <TableRow key={student.id}>
                      <TableCell>{getDisplayIndex(index)}</TableCell>
                      <TableCell>{student.username || "---"}</TableCell>
                      <TableCell>
                        {`${student.khmerFirstName || ""} ${student.khmerLastName || ""
                          }`.trim() || "---"}
                      </TableCell>
                      <TableCell>
                        {`${student.englishFirstName || ""} ${student.englishLastName || ""
                          }`.trim() || "---"}
                      </TableCell>
                      <TableCell>{student.gender || "---"}</TableCell>
                      <TableCell>{student.dateOfBirth || "---"}</TableCell>
                      <TableCell>
                        {`${(student || student)?.studentClass.code} - ${(student || student)?.studentClass.major.name
                          }` || "---"}
                      </TableCell>

                      <TableCell>
                        <div className="flex justify-start space-x-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => {
                                    router.push(
                                      `${ROUTE.ATTENDANCE.HISTORY_RECORD_DETAIL(
                                        String(scheduleId),
                                        String(student.id)
                                      )}`
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
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
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
        itemName={selectedStudent?.username}
        isSubmitting={isSubmitting}
      />

      {!isLoading && allStudentData && (
        <div className="mt-4 flex justify-end">
          <PaginationPage
            currentPage={currentPage}
            totalPages={allStudentData.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
