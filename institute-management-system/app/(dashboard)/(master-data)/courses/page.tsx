"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ROUTE } from "@/constants/routes";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
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
import { CourseTableHeader } from "@/constants/table/master-data";
import { useRouter, useSearchParams } from "next/navigation";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import PaginationPage from "@/components/shared/pagination-page";
import Loading from "@/components/shared/loading";
import { ComboboxSelectDepartment } from "@/components/shared/ComboBox/combobox-department";
import { DepartmentModel } from "@/model/master-data/department/all-department-model";
import { useForm } from "react-hook-form";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDebounce } from "@/utils/debounce/debounce";
import { string } from "zod";
import { usePagination } from "@/hooks/use-pagination";

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
  type FormValues = {
    departmentId: number;
  };

  const searchParams = useSearchParams();

  const { currentPage, updateUrlWithPage, handlePageChange, getDisplayIndex } =
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

  // Then add this effect for initial URL setup
  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    if (!pageParam) {
      // Use replace: true to avoid adding to browser history
      updateUrlWithPage(1, true);
    }
  }, [searchParams, updateUrlWithPage]);

  const { setValue } = useForm<FormValues>();

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
        } else {
        }
      } catch (error) {
        toast.error("An error occurred while loading departments");
      } finally {
        setIsLoading(false);
      }
    },
    [searchDebounce, currentPage, selectedDepartment]
  );

  useEffect(() => {
    loadCourses({});
  }, [searchDebounce, currentPage, selectedDepartment]);

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

  const handleDepartmentChange = (department: DepartmentModel | null) => {
    if (!department) {
      // If combobox cleared selection
      setSelectedDepartment(null);
      setValue("departmentId", 0 as number, {
        shouldValidate: true,
      });
      return;
    }

    if (selectedDepartment?.id === department.id) {
      // Unselect if the same department is clicked
      setSelectedDepartment(null);
      setValue("departmentId", 0 as number, {
        shouldValidate: true,
      });
    } else {
      // Select new department
      setSelectedDepartment(department);
      setValue("departmentId", department.id as number, {
        shouldValidate: true,
      });
    }
  };

  return (
    <div>
      <Card>
        <CardContent className="p-6 space-y-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={ROUTE.DASHBOARD}>
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Manage Course</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h3 className="text-xl font-bold">Manage Course</h3>
          <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search course..."
                className="pl-8 w-full"
                value={searchQuery || ""} // Handle null/undefined searchQuery
                onChange={handleSearchChange}
              />
            </div>
            <div className="flex items-center gap-2">
              <ComboboxSelectDepartment
                dataSelect={selectedDepartment}
                onChangeSelected={handleDepartmentChange}
              />

              <Link href={ROUTE.MASTER_DATA.COURSES.ADD}>
                <Button className="bg-green-900 text-white hover:bg-green-950">
                  <Plus className="mr-2 h-2 w-2" />
                  Add New
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className={`overflow-x-auto mt-4 ${useIsMobile() ? "pl-4" : ""}`}>
        {isLoading ? (
          <Loading />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {CourseTableHeader?.map(
                  (
                    header,
                    index // Handle null CourseTableHeader
                  ) => (
                    <TableHead key={index} className={header?.className || ""}>
                      {header?.label || ""}
                    </TableHead>
                  )
                ) || null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Handle null/empty allCourseData */}
              {!allCourseData?.content || allCourseData.content.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No Course found
                  </TableCell>
                </TableRow>
              ) : (
                allCourseData.content.map((course, index) => {
                  // Handle null course object
                  if (!course) return null;

                  return (
                    <TableRow key={course.id || index}>
                      <TableCell>
                        {getDisplayIndex ? getDisplayIndex(index) : index + 1}
                      </TableCell>

                      <TableCell>
                        <span className="rounded bg-gray-100 px-2 py-1">
                          {course?.code || "---"}
                        </span>
                      </TableCell>
                      <TableCell>{course?.nameKH || "---"}</TableCell>
                      <TableCell>{course?.nameEn || "---"}</TableCell>

                      <TableCell>
                        {course?.credit || "---"} ({course?.theory},
                        {course?.execute},{course?.apply})
                      </TableCell>
                      <TableCell>
                        {course?.user?.englishFirstName &&
                        course?.user?.englishLastName
                          ? `${course?.user?.englishFirstName} ${course?.user?.englishLastName}`
                          : course?.user?.khmerFirstName &&
                            course?.user?.khmerLastName
                          ? `${course?.user?.khmerFirstName} ${course?.user?.khmerLastName}`
                          : course?.user?.username || "---"}
                      </TableCell>

                      <TableCell>
                        <div className="flex justify-start space-x-2">
                          <Button
                            onClick={() =>
                              router.push(
                                ROUTE.MASTER_DATA.COURSES.VIEW(
                                  String(course.id || "")
                                )
                              )
                            }
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-gray-200"
                            disabled={!course.id} // Disable if no ID
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() =>
                              router.push(
                                ROUTE.MASTER_DATA.COURSES.UPDATE(
                                  String(course.id || "")
                                )
                              )
                            }
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-gray-200"
                            disabled={!course.id} // Disable if no ID
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
                            disabled={isSubmitting || !course.id} // Disable if no ID or submitting
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

      {/* Handle null allCourseData for pagination */}
      {!isLoading && allCourseData && allCourseData.totalPages > 1 && (
        <div className="mt-4 flex justify-end">
          <PaginationPage
            currentPage={currentPage || 1} // Handle null currentPage
            totalPages={allCourseData.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={handleDeleteClass}
        title="Delete Course"
        description={`Are you sure you want to delete the course:`}
        itemName={selectedCourse?.nameEn || "Unknown Course"} // Handle null nameEn
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
