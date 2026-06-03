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
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCallback, useEffect, useState } from "react";
import { ROUTE } from "@/constants/routes";
import { YearSelector } from "@/components/shared/year-selector";
import { AllMajorFilterModel } from "@/model/master-data/major/type-major-model";
import {
  createClassService,
  deleteClassService,
  getAllClassService,
  updateClassService,
} from "@/service/master-data/class.service";
import { Constants } from "@/constants/text-string";
import {
  AllClassModel,
  ClassModel,
} from "@/model/master-data/class/all-class-model";
import { toast } from "sonner";
import { classTableHeader } from "@/constants/table/master-data";
import PaginationPage from "@/components/shared/pagination-page";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import {
  ClassFormData,
  ClassFormModal,
} from "@/components/dashboard/master-data/manage-class/class-form-modal";
import { DegreeEnum } from "@/constants/constant";
import Loading from "@/components/shared/loading";
import { useDebounce } from "@/utils/debounce/debounce";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePagination } from "@/hooks/use-pagination";
import { useSearchParams } from "next/navigation";
import { ComboboxSelectMajor } from "@/components/shared/ComboBox/combobox-major";
import { MajorModel } from "@/model/master-data/major/all-major-model";

export default function ManageClassPage() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassModel | null>(null);
  const [allClassData, setAllClassData] = useState<AllClassModel | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedMajor, setSelectedMajor] = useState<MajorModel | null>(null);
  const [initialData, setInitialData] = useState<ClassFormData | undefined>(
    undefined
  );
  const searchParams = useSearchParams();

  const { currentPage, updateUrlWithPage, handlePageChange, getDisplayIndex } =
    usePagination({
      baseRoute: ROUTE.MASTER_DATA.MANAGE_CLASS,
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

  const loadClass = useCallback(
    async (param: AllMajorFilterModel = {}) => {
      setIsLoading(true);
      try {
        const response = await getAllClassService({
          search: debouncedSearchQuery,
          status: Constants.ACTIVE,
          majorId: selectedMajor?.id,
          pageNo: currentPage,
          pageSize: 30,
          academyYear: selectedYear,
          ...param,
        });

        if (response) {
          setAllClassData(response);
          // Handle case where current page exceeds total pages
          if (response.totalPages > 0 && currentPage > response.totalPages) {
            updateUrlWithPage(response.totalPages);
            return;
          }
        } else {
          toast.error("Failed to fetch class data");
        }
      } catch (error) {
        console.error("Error fetching class data:", error);
        toast.error("An error occurred while loading class data");
      } finally {
        setIsLoading(false);
      }
    },
    [debouncedSearchQuery, currentPage, selectedYear, selectedMajor]
  );

  useEffect(() => {
    loadClass();
  }, [currentPage, debouncedSearchQuery, selectedYear, selectedMajor]);

  const handleOpenAddModal = () => {
    setModalMode("add");
    setInitialData(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (classData: ClassModel) => {
    setSelectedClass(classData);
    const formData: ClassFormData = {
      id: classData.id,
      academyYear: Number(classData.academyYear),
      code: classData.code,
      degree: classData.degree as DegreeEnum,
      status: Constants.ACTIVE,
      yearLevel: classData.yearLevel,
      majorId: classData.major.id,
      selectedMajor: classData.major,
    };
    setInitialData(formData);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  async function handleDeleteClass() {
    if (!selectedClass) return;

    setIsSubmitting(true);
    try {
      const originalData = allClassData;
      setAllClassData((prevData) => {
        if (!prevData) return null;
        const updatedContent = prevData.content.filter(
          (item) => item.id !== selectedClass.id
        );
        return {
          ...prevData,
          content: updatedContent,
          totalElements: prevData.totalElements - 1,
        };
      });

      const response = await deleteClassService(selectedClass.id);

      if (response) {
        toast.success(`Class ${selectedClass.code} deleted successfully`);
        if (
          allClassData &&
          allClassData.content.length === 1 &&
          currentPage > 1
        ) {
          updateUrlWithPage(currentPage - 1);
        } else {
          await loadClass({});
        }
      } else {
        setAllClassData(originalData);
        toast.error("Failed to delete class");
      }
    } catch (error) {
      console.error("Error deleting class:", error);
      toast.error("An error occurred while deleting the class");
      loadClass({});
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
    }
  }

  async function handleSubmit(formData: ClassFormData) {
    setIsSubmitting(true);

    try {
      const classData = {
        code: formData.code.trim(),
        academyYear: formData.academyYear,
        degree: formData.degree,
        majorId: formData.majorId,
        status: formData.status,
        yearLevel: formData.yearLevel,
      };

      let response: ClassModel | null = null;
      if (modalMode === "add") {
        try {
          response = await createClassService(classData);
          if (response) {
            setAllClassData((prevData) => {
              if (!prevData) return null;
              return {
                ...prevData,
                content: [response!, ...prevData.content],
                totalElements: prevData.totalElements + 1,
              };
            });
            toast.success(`Class ${response.code} added successfully`);
            if (
              allClassData &&
              allClassData.content.length === 1 &&
              currentPage > 1
            ) {
              updateUrlWithPage(currentPage - 1);
            } else {
              await loadClass({});
            }
            setIsModalOpen(false);
          }
        } catch (error: any) {
          toast.error(error.message || "Failed to add class");
        }
      } else if (modalMode === "edit" && formData.id) {
        try {
          response = await updateClassService(formData.id, classData);
          if (response) {
            setAllClassData((prevData) => {
              if (!prevData) return null;
              const updatedContent = prevData.content.map((cls) =>
                cls.id === formData.id && response ? response : cls
              );
              return {
                ...prevData,
                content: updatedContent,
              };
            });

            toast.success(`Class ${response.code} updated successfully`);
            setIsModalOpen(false);
          }
        } catch (error: any) {
          toast.error(error.message || "Failed to update class");
        }
      }
    } catch (error: any) {
      console.error("Error submitting class form:", error);
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleMajorChange = (major: MajorModel) => {
    setSelectedMajor(major);
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  return (
    <div className="space-y-4">
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
                <BreadcrumbPage>Manage Class</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h3 className="text-xl font-bold">Manage Class</h3>
          <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search class..."
                className="pl-8 w-[100%]"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <ComboboxSelectMajor
              dataSelect={selectedMajor}
              onChangeSelected={handleMajorChange}
              disabled={isSubmitting}
            />
            <div className="flex items-center gap-2">
              <YearSelector value={selectedYear} onChange={handleYearChange} />

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
                {classTableHeader.map((header, index) => (
                  <TableHead key={index} className={header.className}>
                    {header.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {allClassData?.content.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={classTableHeader.length}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No classes found
                  </TableCell>
                </TableRow>
              ) : (
                allClassData?.content.map((cls, index) => {
                  return (
                    <TableRow key={cls.id}>
                      <TableCell>{getDisplayIndex(index)}</TableCell>
                      <TableCell>
                        <span className="rounded bg-gray-100 px-2 py-1 font-medium">
                          {cls.code}
                        </span>
                      </TableCell>
                      <TableCell>{cls.major.name}</TableCell>
                      <TableCell>{cls.degree}</TableCell>
                      <TableCell>{cls.yearLevel}</TableCell>
                      <TableCell>{cls.academyYear}</TableCell>
                      <TableCell>
                        <div className="flex justify-start space-x-2">
                          <Button
                            onClick={() => handleOpenEditModal(cls)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-gray-200 hover:bg-gray-300"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedClass(cls);
                              setIsDeleteDialogOpen(true);
                            }}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-red-500 text-white hover:bg-red-600"
                            disabled={isSubmitting}
                            title="Delete"
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
      {!isLoading && allClassData && allClassData.totalPages > 1 && (
        <div className="mt-4 flex justify-end">
          <PaginationPage
            currentPage={currentPage}
            totalPages={allClassData.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Modals */}
      <ClassFormModal
        isOpen={isModalOpen}
        mode={modalMode}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={initialData}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={handleDeleteClass}
        title="Delete Class"
        description={`Are you sure you want to delete the class: ${selectedClass?.code}?`}
        itemName={selectedClass?.code}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
