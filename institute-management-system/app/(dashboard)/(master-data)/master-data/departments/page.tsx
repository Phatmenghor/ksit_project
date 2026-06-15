"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ROUTE } from "@/constants/routes";
import { Input } from "@/components/ui/input";
import { useCallback, useEffect, useState } from "react";
import {
  DepartmentFormData,
  DepartmentFormModal,
} from "@/components/dashboard/master-data/manage-department/department-form-modal";
import {
  AllDepartmentModel,
  DepartmentModel,
} from "@/model/master-data/department/all-department-model";
import { toast } from "sonner";
import { departmentTableHeader } from "@/constants/table/master-data";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AllDepartmentFilterModel,
  CreateDepartmentModel,
} from "@/model/master-data/department/type-department-model";
import {
  getAllDepartmentService,
  createDepartmentService,
  updateDepartmentService,
  deletedDepartmentService,
} from "@/service/master-data/department.service";
import PaginationPage from "@/components/shared/pagination-page";
import { DateTimeFormatter } from "@/utils/date/date-time-format";
import { Constants } from "@/constants/text-string";
import Loading from "@/components/shared/loading";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { baseAPI } from "@/constants/api";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDebounce } from "@/utils/debounce/debounce";
import { usePagination } from "@/hooks/use-pagination";
import { useSearchParams } from "next/navigation";

export default function ManageDepartmentPage() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [department, setDepartment] = useState<DepartmentModel | null>(null);
  const [allDepartmentData, setAllDepartmentData] =
    useState<AllDepartmentModel | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [initialData, setInitialData] = useState<
    DepartmentFormData | undefined
  >(undefined);
  const searchParams = useSearchParams();

  const { currentPage, updateUrlWithPage, handlePageChange, getDisplayIndex } =
    usePagination({
      baseRoute: ROUTE.MASTER_DATA.MANAGE_DEPARTMENT,
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

  // Fetch departments with filters
  const loadDepartments = useCallback(
    async (param: AllDepartmentFilterModel) => {
      setIsLoading(true);

      try {
        const response = await getAllDepartmentService({
          search: searchDebounce,
          status: Constants.ACTIVE,
          pageNo: currentPage,
          ...param,
        });

        if (response) {
          setAllDepartmentData(response);
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
    [searchDebounce, currentPage]
  );

  useEffect(() => {
    loadDepartments({});
  }, [searchDebounce, currentPage]);

  const handleOpenAddModal = () => {
    setModalMode("add");
    setInitialData(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (dept: DepartmentModel) => {
    const formData: DepartmentFormData = {
      id: dept.id,
      code: dept.code,
      name: dept.name,
      urlLogo: dept.urlLogo,
      status: dept.status,
    };

    setModalMode("edit");
    setInitialData(formData);
    setIsModalOpen(true);
  };

  async function handleSubmit(formData: DepartmentFormData) {
    setIsSubmitting(true);

    try {
      const departmentData: CreateDepartmentModel = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        urlLogo: formData.urlLogo ? formData.urlLogo.trim() : undefined,
        status: formData.status,
      };

      let response: DepartmentModel | null = null;

      if (modalMode === "add") {
        try {
          response = await createDepartmentService(departmentData);

          if (response) {
            setAllDepartmentData((prevData) => {
              if (!prevData) return null;
              const updatedContent = response
                ? [response, ...prevData.content]
                : [...prevData.content];

              return {
                ...prevData,
                content: updatedContent,
                totalElements: prevData.totalElements + 1,
              } as AllDepartmentModel;
            });

            toast.success("Department added successfully");
            setIsModalOpen(false);
          }
        } catch (error: any) {
          // Display the specific error message from the API
          toast.error(error.message || "Failed to add department");
        }
      } else if (modalMode === "edit" && formData.id) {
        try {
          response = await updateDepartmentService(formData.id, departmentData);

          if (response) {
            setAllDepartmentData((prevData) => {
              if (!prevData) return null;
              const updatedContent = prevData.content.map((dept) =>
                dept.id === formData.id && response ? response : dept
              );

              return {
                ...prevData,
                content: updatedContent,
              } as AllDepartmentModel;
            });

            toast.success("Department updated successfully");
            setIsModalOpen(false);
          }
        } catch (error: any) {
          // Display the specific error message from the API
          toast.error(error.message || "Failed to update department");
        }
      }
    } catch (error: any) {
      // This catch block will handle any other errors not caught above
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteDepartment() {
    if (!department) return;

    setIsSubmitting(true);
    try {
      const response = await deletedDepartmentService(department.id);

      if (response) {
        setAllDepartmentData((prevData) => {
          if (!prevData) return null;

          const updatedContent = prevData.content.filter(
            (item) => item.id !== department.id
          );

          return {
            ...prevData,
            content: updatedContent,
            totalElements: prevData.totalElements - 1,
          };
        });

        toast.success("Department deleted successfully");
        if (
          allDepartmentData &&
          allDepartmentData.content.length === 1 &&
          currentPage > 1
        ) {
          updateUrlWithPage(currentPage - 1);
        } else {
          await loadDepartments({});
        }
      } else {
        toast.error("Failed to delete department");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the department");
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
    }
  }

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
                <BreadcrumbPage>Manage Department</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h3 className="text-xl font-bold">Manage Department</h3>
          <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search department..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>

            <Button
              onClick={handleOpenAddModal}
              className="bg-teal-900 text-white hover:bg-teal-950"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Add New
            </Button>
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
                {departmentTableHeader.map((header, index) => (
                  <TableHead key={index} className={header.className}>
                    {header.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {allDepartmentData?.content.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No departments found
                  </TableCell>
                </TableRow>
              ) : (
                allDepartmentData?.content.map((dept, index) => {
                  return (
                    <TableRow key={dept.id || index}>
                      <TableCell>{getDisplayIndex(index)}</TableCell>
                      <TableCell>
                        <span className="rounded bg-gray-100 px-2 py-1">
                          {dept.code}
                        </span>
                      </TableCell>
                      <TableCell>{dept.name}</TableCell>
                      <TableCell>
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={
                              dept.urlLogo
                                ? `${baseAPI.BASE_IMAGE}${dept.urlLogo}`
                                : baseAPI.NO_IMAGE
                            }
                            alt={dept.name}
                          />
                          <AvatarFallback>
                            {dept.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell>{DateTimeFormatter(dept.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex justify-start space-x-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => handleOpenEditModal(dept)}
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
                                    setDepartment(dept);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 bg-red-500 text-white hover:bg-red-600"
                                  disabled={isSubmitting}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete</TooltipContent>
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

      {/* Pagination */}
      {!isLoading && allDepartmentData && (
        <div className="mt-4 flex justify-end">
          <PaginationPage
            currentPage={currentPage}
            totalPages={allDepartmentData.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Department Edit/Add Modal */}
      <DepartmentFormModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialData={initialData}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={handleDeleteDepartment}
        title="Delete Department"
        description="Are you sure you want to delete the department:"
        itemName={department?.name}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
