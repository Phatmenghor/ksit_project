"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROUTE } from "@/constants/routes";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { CourseModel } from "@/model/master-data/course/all-course-model";
import { useEffect, useState } from "react";
import { Constants } from "@/constants/text-string";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DateTimeFormatter } from "@/utils/date/date-time-format";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { ComboboxSelectDepartment } from "@/components/shared/ComboBox/combobox-department";
import { DepartmentModel } from "@/model/master-data/department/all-department-model";
import { useDebounce } from "@/utils/debounce/debounce";
import { usePagination } from "@/hooks/use-pagination";
import { CollapsibleFilterPanel } from "@/components/shared/filter";
import { DataTable, TableColumn } from "@/components/shared/data-table";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectCourseData,
  selectCourseIsLoading,
  selectCourseOperations,
  selectCourseFilters,
} from "@/features/school/store/selectors/course-selectors";
import {
  setSearchFilter,
  setDepartmentFilter,
  setPageNo,
  resetFilters,
  resetState,
} from "@/features/school/store/slice/course-slice";
import {
  fetchAllCoursesService,
  deleteCourseService,
} from "@/features/school/store/thunks/course-thunks";

export default function CoursesPage() {
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectCourseData);
  const isLoading = useAppSelector(selectCourseIsLoading);
  const operations = useAppSelector(selectCourseOperations);
  const filters = useAppSelector(selectCourseFilters);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseModel | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentModel | null>(null);

  const router = useRouter();

  const { currentPage, currentPageSize, updateUrlWithPage, handlePageChange, handlePageSizeChange } =
    usePagination({ baseRoute: ROUTE.MASTER_DATA.COURSES.INDEX });

  const searchDebounce = useDebounce(filters.search, 500);

  useEffect(() => {
    dispatch(
      fetchAllCoursesService({
        search: searchDebounce,
        departmentId: filters.departmentId,
        status: Constants.ACTIVE,
        pageNo: currentPage,
        pageSize: currentPageSize,
      })
    );
  }, [dispatch, searchDebounce, filters.departmentId, currentPage, currentPageSize]);

  useEffect(() => {
    return () => { dispatch(resetState()); };
  }, [dispatch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
    if (currentPage !== 1) updateUrlWithPage(1);
  };

  const handleDepartmentChange = (dept: DepartmentModel | null) => {
    setSelectedDepartment(dept);
    dispatch(setDepartmentFilter(dept?.id));
  };

  async function handleDeleteCourse() {
    if (!selectedCourse) return;
    const result = await dispatch(deleteCourseService(selectedCourse.id));
    if (deleteCourseService.fulfilled.match(result)) {
      toast.success(`Course ${selectedCourse.code} deleted successfully`);
      if (data && data.content.length === 1 && currentPage > 1) {
        updateUrlWithPage(currentPage - 1);
      }
    } else {
      toast.error("Failed to delete course");
    }
    setIsDeleteDialogOpen(false);
    setSelectedCourse(null);
  }

  const columns: TableColumn<CourseModel>[] = [
    {
      key: "no",
      label: "#",
      width: "50px",
      render: (_, index) => (currentPage - 1) * currentPageSize + index + 1,
    },
    { key: "code", label: "Code", render: (c) => c?.code || "—" },
    { key: "nameKH", label: "Name (KH)", render: (c) => c?.nameKH || "---" },
    { key: "nameEn", label: "Name (EN)", render: (c) => c?.nameEn || "---" },
    {
      key: "credit",
      label: "Credit",
      render: (c) => `${c?.credit || "---"} (${c?.theory},${c?.execute},${c?.apply})`,
    },
    {
      key: "instructor",
      label: "Instructor",
      render: (c) =>
        c?.user?.englishFirstName && c?.user?.englishLastName
          ? `${c.user.englishFirstName} ${c.user.englishLastName}`
          : c?.user?.khmerFirstName && c?.user?.khmerLastName
          ? `${c.user.khmerFirstName} ${c.user.khmerLastName}`
          : c?.user?.username || "---",
    },
    {
      key: "createdAt",
      label: "Created At",
      render: (c) => DateTimeFormatter(c.createdAt),
    },
    {
      key: "actions",
      label: "Actions",
      render: (c) => (
        <div className="flex justify-start space-x-2">
          <Button
            onClick={() => router.push(ROUTE.MASTER_DATA.COURSES.VIEW(String(c.id)))}
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-gray-200"
            disabled={operations.isDeleting}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => router.push(ROUTE.MASTER_DATA.COURSES.UPDATE(String(c.id)))}
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-gray-200"
            disabled={operations.isDeleting}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => { setSelectedCourse(c); setIsDeleteDialogOpen(true); }}
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-red-500 text-white hover:bg-red-600"
            disabled={operations.isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-none bg-transparent p-0">
        <CardContent className="p-0 space-y-2">
          <PageBreadcrumb items={[{ label: "Manage Course" }]} />
        </CardContent>
      </Card>

      <CollapsibleFilterPanel
        config={{
          title: "Manage Courses",
          totalCount: data?.totalElements,
          searchValue: filters.search,
          searchPlaceholder: "Search course...",
          onSearchChange: handleSearchChange,
          buttonText: "Add New",
          onButtonClick: () => router.push(ROUTE.MASTER_DATA.COURSES.ADD),
          filters: [
            {
              id: "department",
              type: "custom",
              label: "Department",
              value: selectedDepartment,
              onChange: handleDepartmentChange,
              render: ({ value, onChange }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-foreground/80">Department</label>
                  <ComboboxSelectDepartment dataSelect={value} onChangeSelected={onChange} />
                </div>
              ),
            },
          ],
          onClearAll: () => {
            dispatch(resetFilters());
            setSelectedDepartment(null);
          },
        }}
        essentialFilterIds={["department"]}
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
        emptyMessage="No courses found"
        getRowKey={(c) => c.id}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => { setIsDeleteDialogOpen(false); setSelectedCourse(null); }}
        onDelete={handleDeleteCourse}
        title="Delete Course"
        description="Are you sure you want to delete the course:"
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}
