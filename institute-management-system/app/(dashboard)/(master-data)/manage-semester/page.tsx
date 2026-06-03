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

import {
  CalendarClock,
  CheckCircle,
  Loader,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import { useState, useEffect, useCallback } from "react";
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
import { format, parseISO } from "date-fns";
import { SemesterFormModal } from "@/components/dashboard/master-data/manage-semester/semester-form-modal";
import { YearSelector } from "@/components/shared/year-selector";
import { toast } from "sonner";
import {
  AllSemesterModel,
  SemesterModel,
} from "@/model/master-data/semester/semester-model";
import { AllSemesterFilterModel } from "@/model/master-data/semester/type-semester-model";
import {
  createSemesterService,
  deletedSemesterService,
  getAllSemesterService,
  updateSemesterService,
} from "@/service/master-data/semester.service";
import { Constants } from "@/constants/text-string";
import Loading from "@/components/shared/loading";
import { semesterTableHeader } from "@/constants/table/master-data";
import PaginationPage from "@/components/shared/pagination-page";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { SemesterType } from "@/constants/constant";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDebounce } from "@/utils/debounce/debounce";
import { useSearchParams } from "next/navigation";
import { usePagination } from "@/hooks/use-pagination";
export default function ManageSemester() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [initialData, setInitialData] = useState<SemesterModel | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [semesters, setSemesters] = useState<SemesterModel | null>(null);
  const [allSemesterData, setAllSemesterData] =
    useState<AllSemesterModel | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const searchParams = useSearchParams();

  const { currentPage, updateUrlWithPage, handlePageChange, getDisplayIndex } =
    usePagination({
      baseRoute: ROUTE.MASTER_DATA.MANAGE_SEMESTER,
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
  const loadSemester = useCallback(
    async (param: AllSemesterFilterModel) => {
      setIsLoading(true);
      try {
        const response = await getAllSemesterService({
          search: searchDebounce,
          academyYear: selectedYear,
          status: Constants.ACTIVE,
          pageNo: currentPage,
          pageSize: 30,
          ...param,
        });
        if (response) {
          setAllSemesterData(response);
          if (response.totalPages > 0 && currentPage > response.totalPages) {
            updateUrlWithPage(response.totalPages);
            return;
          }
        } else {
          console.error("Failed to fetch semesters:");
        }
      } catch (error) {
        toast.error("An error occurred while loading semester");
      } finally {
        setIsLoading(false);
      }
    },
    [searchDebounce, currentPage, selectedYear]
  );

  useEffect(() => {
    loadSemester({});
  }, [searchDebounce, currentPage, selectedYear]);

  const handleOpenAddModal = () => {
    setModalMode("add");
    setInitialData(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (semesterData: SemesterModel) => {
    setModalMode("edit");
    setInitialData(semesterData);
    setIsModalOpen(true);
  };

  async function handleSubmit(formData: SemesterModel) {
    setIsSubmitting(true);
    try {
      const semesterData = {
        semester: formData.semester,
        startDate: formData.startDate,
        endDate: formData.endDate,
        academyYear: formData.academyYear,
        status: formData.status,
      };

      let response: SemesterModel | null = null;
      if (modalMode === "add") {
        try {
          response = await createSemesterService(semesterData);
          if (response) {
            setAllSemesterData((prevData) => {
              if (!prevData) return null;

              const updatedContent = response
                ? [response, ...prevData.content]
                : [...prevData.content];

              return {
                ...prevData,
                content: updatedContent,
                totalElements: prevData.totalElements + 1,
              } as AllSemesterModel;
            });

            toast.success("Semester added successfully");
            setIsModalOpen(false);
          }
        } catch (error: any) {
          toast.error(error.message || "Failed to add semester");
        }
      } else if (modalMode === "edit" && formData.id) {
        try {
          response = await updateSemesterService(formData.id, semesterData);
          if (response) {
            setAllSemesterData((prevData) => {
              if (!prevData) return null;

              const updatedContent = prevData.content.map((dept) =>
                dept.id === formData.id && response ? response : dept
              );

              return {
                ...prevData,
                content: updatedContent,
              } as AllSemesterModel;
            });

            toast.success("Semester updated successfully");
            setIsModalOpen(false);
          }
        } catch (error: any) {
          toast.error(error.message || "Failed to update semester");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM dd, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  async function handleDeleteSemester() {
    if (!semesters) return;
    setIsSubmitting(true);
    try {
      const response = await deletedSemesterService(semesters.id);

      if (response) {
        setAllSemesterData((prevData) => {
          if (!prevData) return null;

          const updatedContent = prevData.content.filter(
            (item) => item.id !== semesters.id
          );

          return {
            ...prevData,
            content: updatedContent,
            totalElements: prevData.totalElements - 1,
          };
        });

        toast.success("Semester deleted successfully");
        if (
          allSemesterData &&
          allSemesterData.content.length === 1 &&
          currentPage > 1
        ) {
          updateUrlWithPage(currentPage - 1);
        } else {
          await loadSemester({});
        }
      } else {
        toast.error("Failed to delete semester");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the semester");
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
                <BreadcrumbPage>Manage Semester</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h3 className="text-xl font-bold">Manage Semester</h3>
          <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search semester..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <div className="flex items-center gap-2">
              <YearSelector value={selectedYear} onChange={setSelectedYear} />

              <Button
                onClick={handleOpenAddModal}
                className="bg-teal-900 text-white hover:bg-teal-950"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New
              </Button>
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
                {semesterTableHeader.map((header, index) => (
                  <TableHead key={index} className={header.className}>
                    {header.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {allSemesterData?.content.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No semester found
                  </TableCell>
                </TableRow>
              ) : (
                allSemesterData?.content.map((semesters, index) => {
                  return (
                    <TableRow key={semesters.id}>
                      <TableCell>{getDisplayIndex(index)}</TableCell>
                      <TableCell>{semesters.semester}</TableCell>
                      <TableCell>{formatDate(semesters.startDate)}</TableCell>
                      <TableCell>{formatDate(semesters.endDate)}</TableCell>
                      <TableCell>{semesters.academyYear}</TableCell>

                      <TableCell>
                        {semesters.semesterType === SemesterType.DONE && (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle size={16} />
                            <span>Done</span>
                          </div>
                        )}
                        {semesters.semesterType === SemesterType.PROCESSING && (
                          <div className="flex items-center gap-2 text-blue-600">
                            <Loader size={16} />
                            <span>Processing</span>
                          </div>
                        )}
                        {semesters.semesterType === SemesterType.PROGRESS && (
                          <div className="flex items-center gap-2 text-yellow-500">
                            <CalendarClock size={16} />
                            <span>Progress</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-start space-x-2">
                          <Button
                            onClick={() => handleOpenEditModal(semesters)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-gray-200 hover:bg-gray-300"
                            disabled={isSubmitting}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => {
                              setSemesters(semesters);
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
      {!isLoading && allSemesterData && (
        <div className="mt-4 flex justify-end">
          <PaginationPage
            currentPage={currentPage}
            totalPages={allSemesterData.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
      {/* The semester form modal */}
      <SemesterFormModal
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
        onDelete={handleDeleteSemester}
        title="Delete Semester"
        description="Are you sure you want to delete the semester:"
        itemName={semesters?.semester}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
