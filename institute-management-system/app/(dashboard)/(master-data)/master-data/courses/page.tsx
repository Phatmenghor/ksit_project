"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ROUTE } from "@/constants/routes";
import { Eye, Pencil, Trash2 } from "lucide-react";
import {
  AllCourseModel,
  CourseModel,
} from "@/model/master-data/course/all-course-model";
import { useCallback, useEffect, useState } from "react";
import { AllCourseFilterModel } from "@/model/master-data/course/type-course-model";
import {
  deletedCourseService,
  getAllCourseService,
} from "@/service/master-data/course.service";
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

export default function CoursesPage() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [allCourseData, setAllCourseData] = useState<AllCourseModel | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState<CourseModel | null>(
    null
  );
  const [selectedDepartment, setSelectedDepartment] =
    useState<DepartmentModel | null>(null);

  const { currentPage, updateUrlWithPage, handlePageChange } =
    usePagination({
      baseRoute: ROUTE.MASTER_DATA.COURSES.INDEX,
      defaultPageSize: 10,
    });

  const searchDebounce = useDebounce(searchQuery, 500);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (currentPage !== 1) {
      updateUrlWithPage(1);
    }
  };

  const loadCourses = useCallback(
    async (param: AllCourseFilterModel) => {
      setIsLoading(true);

      try {
        const response = await getAllCourseService({
          search: searchDebounce,
          departmentId: selectedDepartment?.id,
          status: Constants.ACTIVE,
          pageNo: currentPage,
          pageSize: 30,
          ...param,
        });

        if (response) {
          setAllCourseData(response);
          if (response.totalPages > 0 && currentPage > response.totalPages) {
            updateUrlWithPage(response.totalPages);
            return;
          }
        }
      } catch (error) {
        toast.error("An error occurred while loading courses");
      } finally {
        setIsLoading(false);
      }
    },
    [searchDebounce, currentPage, selectedDepartment]
  );

  useEffect(() => {
    loadCourses({});
  }, [loadCourses]);

  async function handleDeleteClass() {
    if (!selectedCourse) return;
    setIsSubmitting(true);
    try {
      const originalData = allCourseData;
      setAllCourseData((prevData) => {
        if (!prevData) return null;
        const updatedContent = prevData.content.filter(
          (item) => item.id !== selectedCourse.id
        );
        return {
          ...prevData,
          content: updatedContent,
          totalElements: prevData.totalElements - 1,
        };
      });

      const response = await deletedCourseService(selectedCourse.id);

      if (response) {
        toast.success(`Class ${selectedCourse.code} deleted successfully`);
        if (
          allCourseData &&
          allCourseData.content.length === 1 &&
          currentPage > 1
        ) {
          updateUrlWithPage(currentPage - 1);
        } else {
          await loadCourses({});
        }
      } else {
        setAllCourseData(originalData);
        toast.error("Failed to delete class");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the course");
      loadCourses({});
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
    }
  }

  const handleOpenAddCourse = () => {
    router.push(ROUTE.MASTER_DATA.COURSES.ADD);
  };

  const columns: TableColumn<CourseModel>[] = [
    {
      key: "no",
      label: "#",
      width: "50px",
      render: (_, index) => {
        const page = currentPage ?? 1;
        return (page - 1) * 30 + index + 1;
      },
    },
    {
      key: "code",
      label: "Code",
      render: (course) => (
        <span className="rounded bg-gray-100 px-2 py-1">{course?.code || "---"}</span>
      ),
    },
    {
      key: "nameKH",
      label: "Name (KH)",
      render: (course) => course?.nameKH || "---",
    },
    {
      key: "nameEn",
      label: "Name (EN)",
      render: (course) => course?.nameEn || "---",
    },
    {
      key: "credit",
      label: "Credit",
      render: (course) =>
        `${course?.credit || "---"} (${course?.theory},${course?.execute},${course?.apply})`,
    },
    {
      key: "instructor",
      label: "Instructor",
      render: (course) =>
        course?.user?.englishFirstName && course?.user?.englishLastName
          ? `${course.user.englishFirstName} ${course.user.englishLastName}`
          : course?.user?.khmerFirstName && course?.user?.khmerLastName
          ? `${course.user.khmerFirstName} ${course.user.khmerLastName}`
          : course?.user?.username || "---",
    },
    {
      key: "createdAt",
      label: "Created At",
      render: (course) => DateTimeFormatter(course.createdAt),
    },
    {
      key: "actions",
      label: "Actions",
      render: (course) => (
        <div className="flex justify-start space-x-2">
          <Button
            onClick={() =>
              router.push(ROUTE.MASTER_DATA.COURSES.VIEW(String(course.id || "")))
            }
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-gray-200"
            disabled={!course.id}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            onClick={() =>
              router.push(ROUTE.MASTER_DATA.COURSES.UPDATE(String(course.id || "")))
            }
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-gray-200"
            disabled={!course.id}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => {
              setSelectedCourse(course);
              setIsDeleteDialogOpen(true);
            }}
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-red-500 text-white hover:bg-red-600"
            disabled={isSubmitting || !course.id}
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
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={ROUTE.DASHBOARD}>Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Manage Course</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </CardContent>
      </Card>

      <CollapsibleFilterPanel
        config={{
          title: "Manage Courses",
          totalCount: allCourseData?.totalElements,
          searchValue: searchQuery,
          searchPlaceholder: "Search course...",
          onSearchChange: handleSearchChange,
          buttonText: "Add New",
          onButtonClick: handleOpenAddCourse,
          filters: [
            {
              id: "department",
              type: "custom",
              label: "Department",
              value: selectedDepartment,
              onChange: (v) => setSelectedDepartment(v),
              render: ({ value, onChange }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-foreground/80">Department</label>
                  <ComboboxSelectDepartment
                    dataSelect={value}
                    onChangeSelected={onChange}
                  />
                </div>
              ),
            },
          ],
          onClearAll: () => {
            setSelectedDepartment(null);
            setSearchQuery("");
          },
        }}
        essentialFilterIds={["department"]}
      />

      <DataTable
        data={allCourseData?.content ?? null}
        columns={columns}
        loading={isLoading}
        currentPage={currentPage}
        totalPages={allCourseData?.totalPages ?? 0}
        totalElements={allCourseData?.totalElements}
        onPageChange={handlePageChange}
        emptyMessage="No courses found"
        getRowKey={(course) => course.id}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={handleDeleteClass}
        title="Delete Course"
        description="Are you sure you want to delete the course:"
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
