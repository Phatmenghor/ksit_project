"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { toast } from "sonner";
import { getAllStudentsService } from "@/service/user/student.service";
import { RoleEnum, StatusEnum } from "@/constants/constant";
import { CardHeaderSection } from "@/components/shared/layout/card-header-section";
import { ROUTE } from "@/constants/routes";
import { YearSelector } from "@/components/shared/year-selector";
import { ClassModel } from "@/model/master-data/class/all-class-model";
import { BreadcrumbLink } from "@/components/ui/breadcrumb";
import PaginationPage from "@/components/shared/pagination-page";
import {
  AllStudentModel,
  RequestAllStudent,
} from "@/model/user/student/student.request.model";
import { useDebounce } from "@/utils/debounce/debounce";
import { ComboboxSelectClass } from "@/components/shared/ComboBox/combobox-class";
import Loading from "@/components/shared/loading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StudentTablePaymentHeader } from "@/constants/payment/payment";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRouter, useSearchParams } from "next/navigation";
import { usePagination } from "@/hooks/use-pagination";
import { getRoles } from "@/utils/local-storage/user-info/roles";
import { getUserId } from "@/utils/local-storage/user-info/userId";
import { ComboboxSelectCourse } from "@/components/shared/ComboBox/combobox-course";
import { ComboboxSelectSchedule } from "@/components/shared/ComboBox/combobox-schedule";
import { ScheduleModel } from "@/model/schedules/all-schedule-model";

export default function StudentsListPage() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectAcademicYear, setSelectAcademicYear] = useState<
    number | undefined
  >();
  const [selectedClass, setSelectedClass] = useState<ClassModel>();
  const [allStudentData, setAllStudentData] = useState<AllStudentModel | null>(
    null
  );
  const [selectedSchedule, setSelectedSchedule] = useState<
    ScheduleModel | undefined
  >(undefined);

  const isMobile = useIsMobile();
  const searchParams = useSearchParams();
  const router = useRouter();
  const roles = getRoles();
  const userId = getUserId();

  const isStudent = Array.isArray(roles) && roles.includes(RoleEnum.STUDENT);

  const { currentPage, updateUrlWithPage, handlePageChange, getDisplayIndex } =
    usePagination({
      baseRoute: ROUTE.PAYMENT.LIST,
      defaultPageSize: 10,
    });

  const debouncedSearchQuery = useDebounce(searchQuery, 500);
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

  const loadStudents = useCallback(
    async (param: RequestAllStudent) => {
      setIsLoading(true);

      try {
        const response = await getAllStudentsService({
          ...param,
          academicYear: selectAcademicYear,
          search: debouncedSearchQuery,
          status: StatusEnum.ACTIVE,
          pageNo: currentPage,
          scheduleId: selectedSchedule?.id,
          pageSize: 30,
          classId: selectedClass?.id,
        });

        if (response) {
          setAllStudentData(response);
          // Handle case where current page exceeds total pages
          if (response.totalPages > 0 && currentPage > response.totalPages) {
            updateUrlWithPage(response.totalPages);
            return;
          }
          console.log(">>>", response);
        } else {
          console.error("Failed to fetch departments:");
        }
      } catch (error) {
        toast.error("An error occurred while loading departments");
      } finally {
        setIsLoading(false);
      }
    },
    [
      debouncedSearchQuery,
      currentPage,
      selectedClass,
      selectAcademicYear,
      selectedSchedule,
      updateUrlWithPage,
    ]
  );

  useEffect(() => {
    loadStudents({});
  }, [
    isStudent,
    searchQuery,
    currentPage,
    debouncedSearchQuery,
    selectAcademicYear,
    selectedClass,
    selectedSchedule,
    loadStudents,
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

  const iconColor = "text-black";

  return (
    <div className="space-y-4">
      <CardHeaderSection
        breadcrumbs={[
          { label: "Dashboard", href: ROUTE.DASHBOARD },
          { label: "Payment", href: ROUTE.PAYMENT.LIST },
        ]}
        title="Payment"
        searchValue={searchQuery}
        searchPlaceholder="Search..."
        onSearchChange={handleSearchChange}
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

            <ComboboxSelectSchedule
              dataSelect={selectedSchedule ?? null}
              onChangeSelected={handleScheduleChange}
            />

            <div className="w-full min-w-[200px] md:w-1/2">
              <ComboboxSelectClass
                dataSelect={selectedClass ?? null}
                onChangeSelected={handleClassChange}
                disabled={isSubmitting}
              />
            </div>
          </div>
        }
      />

      <div className={`overflow-x-auto mt-4 ${isMobile ? "pl-4" : ""}`}>
        {isLoading ? (
          <div>
            <Loading />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {StudentTablePaymentHeader.map((header, index) => (
                  <TableHead key={index} className={header.className}>
                    {header.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {allStudentData?.totalElements === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={StudentTablePaymentHeader.length}
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
                        {`${student.khmerFirstName || ""} ${
                          student.khmerLastName || ""
                        }`.trim() || "---"}
                      </TableCell>
                      <TableCell>
                        {`${student.englishFirstName || ""} ${
                          student.englishLastName || ""
                        }`.trim() || "---"}
                      </TableCell>

                      <TableCell>{student.gender || "---"}</TableCell>
                      <TableCell>{student.dateOfBirth || "---"}</TableCell>

                      <TableCell>
                        <div className="flex justify-start space-x-2">
                          <BreadcrumbLink
                            href={ROUTE.PAYMENT.VIEW_PAYMENT(
                              String(student.id)
                            )}
                          >
                            <Button
                              variant="link"
                              size="icon"
                              className={`${iconColor} underline hover:text-blue-600 flex items-center`}
                            >
                              <Eye className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                              <span className="text-sm transition-all duration-200">
                                {" "}
                                Detail
                              </span>
                            </Button>
                          </BreadcrumbLink>
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

      {!isLoading && allStudentData && (
        <div className="mt-8 flex justify-end duration-500 delay-1000">
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
