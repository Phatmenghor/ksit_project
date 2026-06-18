"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { toast } from "sonner";
import { getAllStudentsService } from "@/service/user/student.service";
import { RoleEnum, StatusEnum } from "@/constants/constant";
import { ROUTE } from "@/constants/routes";
import { ClassModel } from "@/model/master-data/class/all-class-model";
import { BreadcrumbLink } from "@/components/ui/breadcrumb";
import {
  AllStudentModel,
  RequestAllStudent,
  StudentModel as StudentListModel,
} from "@/model/user/student/student.request.model";
import { useDebounce } from "@/utils/debounce/debounce";
import { ComboboxSelectClass } from "@/components/shared/ComboBox/combobox-class";
import { useRouter, useSearchParams } from "next/navigation";
import { usePagination } from "@/hooks/use-pagination";
import { getRoles } from "@/utils/local-storage/user-info/roles";
import { getUserId } from "@/utils/local-storage/user-info/userId";
import { ComboboxSelectSchedule } from "@/components/shared/ComboBox/combobox-schedule";
import { ComboboxSelectCourse } from "@/components/shared/ComboBox/combobox-course";
import { ScheduleModel } from "@/model/schedules/all-schedule-model";
import { CourseModel } from "@/model/master-data/course/all-course-model";
import { CollapsibleFilterPanel } from "@/components/shared/filter";
import { DataTable, TableColumn } from "@/components/shared/data-table";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { Card, CardContent } from "@/components/ui/card";

type StudentItem = StudentListModel;

export default function StudentsListPage() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectAcademicYear, setSelectAcademicYear] = useState<
    number | undefined
  >();
  const [selectedClass, setSelectedClass] = useState<ClassModel | undefined>();
  const [allStudentData, setAllStudentData] = useState<AllStudentModel | null>(
    null
  );
  const [selectedSchedule, setSelectedSchedule] = useState<
    ScheduleModel | undefined
  >(undefined);
  const [selectedCourse, setSelectedCourse] = useState<CourseModel | undefined>(undefined);

  const searchParams = useSearchParams();
  const router = useRouter();
  const roles = getRoles();
  const userId = getUserId();

  const isStudent = Array.isArray(roles) && roles.includes(RoleEnum.STUDENT);

  const { currentPage, currentPageSize, updateUrlWithPage, handlePageChange, handlePageSizeChange, getDisplayIndex } =
    usePagination({
      baseRoute: ROUTE.PAYMENT.LIST,
    });

  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (currentPage !== 1) {
      updateUrlWithPage(1);
    }
  };

  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    if (!pageParam) {
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
          pageSize: currentPageSize,
          classId: selectedClass?.id,
          courseId: selectedCourse?.id,
        });

        if (response) {
          setAllStudentData(response);
          if (response.totalPages > 0 && currentPage > response.totalPages) {
            updateUrlWithPage(response.totalPages);
            return;
          }
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
      selectedCourse,
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
    selectedCourse,
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

  const columns: TableColumn<StudentItem>[] = [
    {
      key: "no",
      label: "#",
      width: "50px",
      render: (_, index) => getDisplayIndex(index),
    },
    {
      key: "username",
      label: "Username",
      render: (s) => s.username || "---",
    },
    {
      key: "khmerName",
      label: "Khmer Name",
      render: (s) =>
        `${s.khmerFirstName || ""} ${s.khmerLastName || ""}`.trim() || "---",
    },
    {
      key: "englishName",
      label: "English Name",
      render: (s) =>
        `${s.englishFirstName || ""} ${s.englishLastName || ""}`.trim() || "---",
    },
    {
      key: "gender",
      label: "Gender",
      render: (s) => s.gender || "---",
    },
    {
      key: "dateOfBirth",
      label: "Date of Birth",
      render: (s) => s.dateOfBirth || "---",
    },
    {
      key: "action",
      label: "Action",
      width: "100px",
      render: (s) => (
        <BreadcrumbLink href={ROUTE.PAYMENT.VIEW_PAYMENT(String(s.id))}>
          <Button
            variant="link"
            size="icon"
            className="text-black underline hover:text-blue-600 flex items-center"
          >
            <Eye className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
            <span className="text-sm transition-all duration-200"> Detail</span>
          </Button>
        </BreadcrumbLink>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-none bg-transparent p-0">
        <CardContent className="p-0 space-y-2">
          <PageBreadcrumb items={[{ label: "Payment" }]} />
        </CardContent>
      </Card>

      <CollapsibleFilterPanel
        config={{
          title: "Payment",
          totalCount: allStudentData?.totalElements,
          searchValue: searchQuery,
          searchPlaceholder: "Search...",
          onSearchChange: handleSearchChange,
          filters: [
            {
              id: "class",
              type: "custom",
              label: "Class",
              value: selectedClass,
              onChange: (v) => setSelectedClass(v),
              render: ({ value, onChange }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-foreground/80">Class</label>
                  <ComboboxSelectClass
                    dataSelect={value ?? null}
                    onChangeSelected={(e) => onChange(e ?? undefined)}
                    disabled={isSubmitting}
                  />
                </div>
              ),
            },
            {
              id: "schedule",
              type: "custom",
              label: "Schedule",
              value: selectedSchedule,
              onChange: (v) => setSelectedSchedule(v),
              render: ({ value, onChange }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-foreground/80">Schedule</label>
                  <ComboboxSelectSchedule
                    dataSelect={value ?? null}
                    onChangeSelected={(e) => onChange(e ?? undefined)}
                  />
                </div>
              ),
            },
            {
              id: "course",
              type: "custom",
              label: "Course",
              value: selectedCourse,
              onChange: (v) => setSelectedCourse(v),
              render: ({ value, onChange }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-foreground/80">Course</label>
                  <ComboboxSelectCourse
                    dataSelect={value ?? null}
                    onChangeSelected={(e) => onChange(e ?? undefined)}
                  />
                </div>
              ),
            },
            {
              id: "year",
              type: "year",
              label: "Academic Year",
              value: selectAcademicYear ?? new Date().getFullYear(),
              onChange: handleYearChange,
            },
          ],
          onClearAll: () => {
            setSelectedClass(undefined);
            setSelectedSchedule(undefined);
            setSelectedCourse(undefined);
            setSelectAcademicYear(undefined);
            setSearchQuery("");
          },
        }}
        essentialFilterIds={["class", "schedule", "course", "year"]}
      />

      <DataTable
        data={allStudentData?.content ?? null}
        columns={columns}
        loading={isLoading}
        currentPage={currentPage}
        totalPages={allStudentData?.totalPages ?? 0}
        totalElements={allStudentData?.totalElements}
        onPageChange={handlePageChange}
        pageSize={currentPageSize}
        onPageSizeChange={handlePageSizeChange}
        emptyMessage="No student found"
        getRowKey={(s) => s.id}
      />
    </div>
  );
}
