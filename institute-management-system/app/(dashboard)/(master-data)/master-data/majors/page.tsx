"use client";

import { useCallback, useEffect, useState } from "react";
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
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { ROUTE } from "@/constants/routes";
import {
  createMajorService,
  deletedMajorService,
  getAllMajorService,
  updateMajorService,
} from "@/service/master-data/major.service";
import { toast } from "sonner";
import { Constants } from "@/constants/text-string";
import { AllMajorFilterModel } from "@/model/master-data/major/type-major-model";
import {
  AllMajorModel,
  MajorModel,
} from "@/model/master-data/major/all-major-model";
import {
  MajorFormData,
  MajorFormModal,
} from "@/components/dashboard/master-data/manage-major/major-form-modal";
import { majorTableHeader } from "@/constants/table/master-data";
import Loading from "@/components/shared/loading";
import PaginationPage from "@/components/shared/pagination-page";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDebounce } from "@/utils/debounce/debounce";
import { useSearchParams } from "next/navigation";
import { usePagination } from "@/hooks/use-pagination";

export default function ManageMajorPage() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [majors, setMajors] = useState<MajorModel | null>(null);
  const [allMajorData, setAllMajorData] = useState<AllMajorModel | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [initialData, setInitialData] = useState<MajorFormData | undefined>(
    undefined
  );
  const searchParams = useSearchParams();

  const { currentPage, updateUrlWithPage, handlePageChange, getDisplayIndex } =
    usePagination({
      baseRoute: ROUTE.MASTER_DATA.MANAGE_MAJOR,
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

  const loadMajors = useCallback(
    async (param: AllMajorFilterModel) => {
      setIsLoading(true);
      try {
        const response = await getAllMajorService({
          search: searchDebounce,
          status: Constants.ACTIVE,
          pageNo: currentPage,
          pageSize: 30,
          ...param,
        });

        if (response) {
          setAllMajorData(response);
          if (response.totalPages > 0 && currentPage > response.totalPages) {
            updateUrlWithPage(response.totalPages);
            return;
          }
        } else {
        }
      } catch (error) {
        toast.error("An error occurred while loading rooms");
      } finally {
        setIsLoading(false);
      }
    },
    [searchDebounce, currentPage]
  );

  useEffect(() => {
    loadMajors({});
  }, [searchDebounce, currentPage]);

  const handleOpenAddModal = () => {
    setModalMode("add");
    setInitialData(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (majorData: MajorModel) => {
    const formData: MajorFormData = {
      id: majorData.id,
      name: majorData.name,
      code: majorData.code,
      departmentId: majorData.department.id,
      status: Constants.ACTIVE,
    };
    setModalMode("edit");
    setInitialData(formData);
    setIsModalOpen(true);
  };

  async function handleSubmit(formData: MajorFormData) {
    setIsSubmitting(true);

    try {
      const majorData = {
        code: formData.code,
        name: formData.name.trim(),
        departmentId: formData.departmentId,
        status: formData.status,
      };

      let response: MajorModel | null = null;

      if (modalMode === "add") {
        try {
          response = await createMajorService(majorData);

          if (response) {
            setAllMajorData((prevData) => {
              if (!prevData) return null;
              const updatedContent = response
                ? [response, ...prevData.content]
                : [...prevData.content];

              return {
                ...prevData,
                content: updatedContent,
                totalElements: prevData.totalElements + 1,
              } as AllMajorModel;
            });

            toast.success("Major added successfully");
            setIsModalOpen(false);
          }
        } catch (error: any) {
          toast.error(error.message || "Failed to add room");
        }
      } else if (modalMode === "edit" && formData.id) {
        try {
          response = await updateMajorService(formData.id, majorData);
          if (response) {
            setAllMajorData((prevData) => {
              if (!prevData) return null;

              const updatedContent = prevData.content.map((dept) =>
                dept.id === formData.id && response ? response : dept
              );

              return {
                ...prevData,
                content: updatedContent,
              } as AllMajorModel;
            });

            toast.success("Major updated successfully");
            setIsModalOpen(false);
          }
        } catch (error: any) {
          toast.error(error.message || "Failed to update major");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteMajor() {
    if (!majors) return;

    setIsSubmitting(true);
    try {
      const response = await deletedMajorService(majors.id);

      if (response) {
        setAllMajorData((prevData) => {
          if (!prevData) return null;

          const updatedContent = prevData.content.filter(
            (item) => item.id !== majors.id
          );

          return {
            ...prevData,
            content: updatedContent,
            totalElements: prevData.totalElements - 1,
          };
        });

        toast.success("Major deleted successfully");
        if (
          allMajorData &&
          allMajorData.content.length === 1 &&
          currentPage > 1
        ) {
          updateUrlWithPage(currentPage - 1);
        } else {
          await loadMajors({});
        }
      } else {
        toast.error("Failed to delete major");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the major");
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
                <BreadcrumbPage>Manage major</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h3 className="text-xl font-bold">Manage Major</h3>
          <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search major..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <Button
              onClick={handleOpenAddModal}
              className="bg-teal-900 text-white hover:bg-teal-950"
            >
              <Plus className="mr-2 h-2 w-2" />
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
                {majorTableHeader.map((header, index) => (
                  <TableHead key={index} className={header.className}>
                    {header.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {allMajorData?.content.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No Major found
                  </TableCell>
                </TableRow>
              ) : (
                allMajorData?.content.map((major, index) => {
                  return (
                    <TableRow key={major.id}>
                      <TableCell>{getDisplayIndex(index)}</TableCell>
                      <TableCell>
                        <span className="rounded bg-gray-100 px-2 py-1">
                          {major.code}
                        </span>
                      </TableCell>
                      <TableCell>{major.name}</TableCell>
                      <TableCell>{major.department.name}</TableCell>
                      <TableCell>
                        <div className="flex justify-start space-x-2">
                          <Button
                            onClick={() => handleOpenEditModal(major)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-gray-200"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => {
                              setMajors(major);
                              setIsDeleteDialogOpen(true);
                            }}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-red-500 text-white hover:bg-red-600"
                            disabled={isSubmitting}
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

      {/* Pagination */}
      {!isLoading && allMajorData && (
        <div className="mt-4 flex justify-end">
          <PaginationPage
            currentPage={currentPage}
            totalPages={allMajorData.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Add/Edit Major Modal */}
      <MajorFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={initialData}
        mode={modalMode}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={handleDeleteMajor}
        title="Delete Major"
        description="Are you sure you want to delete the major:"
        itemName={majors?.name}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
