"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { toast } from "sonner";
import { RoleEnum, StatusEnum } from "@/constants/constant";
import { ROUTE } from "@/constants/routes";
import { ClassModel } from "@/model/master-data/class/all-class-model";
import { BreadcrumbLink } from "@/components/ui/breadcrumb";
import { StudentModel } from "@/model/user/student/student.request.model";
import { ComboboxSelectClass } from "@/components/shared/ComboBox/combobox-class";
import { useRouter } from "next/navigation";
import { usePagination } from "@/hooks/use-pagination";
import { getRoles } from "@/utils/local-storage/user-info/roles";
import { ComboboxSelectSchedule } from "@/components/shared/ComboBox/combobox-schedule";
import { ComboboxSelectCourse } from "@/components/shared/ComboBox/combobox-course";
import { ScheduleModel } from "@/model/schedules/all-schedule-model";
import { CourseModel } from "@/model/master-data/course/all-course-model";
import { CollapsibleFilterPanel } from "@/components/shared/filter";
import { DataTable, TableColumn } from "@/components/shared/data-table";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
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
  setCourseFilter,
  setAcademicYearFilter,
  setPageNo,
  resetFilters,
  resetState,
} from "@/features/students/store/slice/student-slice";
import { fetchAllStudentsService } from "@/features/students/store/thunks/student-thunks";
import { useDebounce } from "@/utils/debounce/debounce";

export default function PaymentStudentListPage() {
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectStudentData);
  const isLoading = useAppSelector(selectStudentIsLoading);
  const filters = useAppSelector(selectStudentFilters);

  const [selectedClass, setSelectedClass] = useState<ClassModel | undefined>(undefined);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleModel | undefined>(undefined);
  const [selectedCourse, setSelectedCourse] = useState<CourseModel | undefined>(undefined);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);

  const router = useRouter();
  const roles = getRoles();
  const isStudent = Array.isArray(roles) && roles.includes(RoleEnum.STUDENT);

  const { currentPage, currentPageSize, updateUrlWithPage, handlePageChange, handlePageSizeChange } =
    usePagination({ baseRoute: ROUTE.PAYMENT.LIST });

  const searchDebounce = useDebounce(filters.search, 500);

  useEffect(() => {
    dispatch(
      fetchAllStudentsService({
        search: searchDebounce,
        classId: filters.classId,
        scheduleId: filters.scheduleId,
        courseId: filters.courseId,
        academicYear: filters.academicYear,
        status: StatusEnum.ACTIVE,
        pageNo: currentPage,
        pageSize: currentPageSize,
      })
    );
  }, [dispatch, searchDebounce, filters.classId, filters.scheduleId, filters.courseId, filters.academicYear, currentPage, currentPageSize]);

  useEffect(() => {
    return () => { dispatch(resetState()); };
  }, [dispatch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
    if (currentPage !== 1) updateUrlWithPage(1);
  };

  const columns: TableColumn<StudentModel>[] = [
    {
      key: "no",
      label: "#",
      width: "50px",
      render: (_, index) => (currentPage - 1) * currentPageSize + index + 1,
    },
    { key: "username", label: "Username", render: (s) => s.username || "---" },
    {
      key: "khmerName",
      label: "Khmer Name",
      render: (s) => `${s.khmerFirstName || ""} ${s.khmerLastName || ""}`.trim() || "---",
    },
    {
      key: "englishName",
      label: "English Name",
      render: (s) => `${s.englishFirstName || ""} ${s.englishLastName || ""}`.trim() || "---",
    },
    { key: "gender", label: "Gender", render: (s) => s.gender || "---" },
    { key: "dateOfBirth", label: "Date of Birth", render: (s) => s.dateOfBirth || "---" },
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
            <Eye className="h-4 w-4" />
            <span className="text-sm"> Detail</span>
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
          totalCount: data?.totalElements,
          searchValue: filters.search,
          searchPlaceholder: "Search...",
          onSearchChange: handleSearchChange,
          filters: [
            {
              id: "class",
              type: "custom",
              label: "Class",
              value: selectedClass ?? null,
              onChange: (v) => {
                setSelectedClass(v ?? undefined);
                dispatch(setClassFilter(v?.id));
              },
              render: ({ value, onChange }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-foreground/80">Class</label>
                  <ComboboxSelectClass dataSelect={value ?? null} onChangeSelected={(e) => onChange(e ?? undefined)} />
                </div>
              ),
            },
            {
              id: "schedule",
              type: "custom",
              label: "Schedule",
              value: selectedSchedule ?? null,
              onChange: (v) => {
                setSelectedSchedule(v ?? undefined);
                dispatch(setScheduleFilter(v?.id));
              },
              render: ({ value, onChange }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-foreground/80">Schedule</label>
                  <ComboboxSelectSchedule dataSelect={value ?? null} onChangeSelected={(e) => onChange(e ?? undefined)} />
                </div>
              ),
            },
            {
              id: "course",
              type: "custom",
              label: "Course",
              value: selectedCourse ?? null,
              onChange: (v) => {
                setSelectedCourse(v ?? undefined);
                dispatch(setCourseFilter(v?.id));
              },
              render: ({ value, onChange }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-foreground/80">Course</label>
                  <ComboboxSelectCourse dataSelect={value ?? null} onChangeSelected={(e) => onChange(e ?? undefined)} />
                </div>
              ),
            },
            {
              id: "year",
              type: "year",
              label: "Academic Year",
              value: selectedYear ?? new Date().getFullYear(),
              onChange: (year) => {
                setSelectedYear(year);
                dispatch(setAcademicYearFilter(year));
              },
            },
          ],
          onClearAll: () => {
            dispatch(resetFilters());
            setSelectedClass(undefined);
            setSelectedSchedule(undefined);
            setSelectedCourse(undefined);
            setSelectedYear(undefined);
          },
        }}
        essentialFilterIds={["class", "schedule", "course", "year"]}
      />

      <DataTable
        data={data?.content ?? null}
        columns={columns}
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
