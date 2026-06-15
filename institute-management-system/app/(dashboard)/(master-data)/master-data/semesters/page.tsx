"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CalendarClock,
  CheckCircle,
  Loader,
  Pencil,
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
import { ROUTE } from "@/constants/routes";
import { format, parseISO } from "date-fns";
import { SemesterFormModal } from "@/components/dashboard/master-data/manage-semester/semester-form-modal";
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
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { SemesterType } from "@/constants/constant";
import { useDebounce } from "@/utils/debounce/debounce";
import { useSearchParams } from "next/navigation";
import { usePagination } from "@/hooks/use-pagination";
import { CollapsibleFilterPanel } from "@/components/shared/filter";
import { DataTable, TableColumn } from "@/components/shared/data-table";

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

  const { currentPage, updateUrlWithPage, handlePageChange } =
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

  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    if (!pageParam) {
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

              const updatedContent = prevData.content.map((s) =>
                s.id === formData.id && response ? response : s
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

  const columns: TableColumn<SemesterModel>[] = [
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
      key: "semester",
      label: "Semester",
      render: (s) => s.semester,
    },
    {
      key: "startDate",
      label: "Start Date",
      render: (s) => formatDate(s.startDate),
    },
    {
      key: "endDate",
      label: "End Date",
      render: (s) => formatDate(s.endDate),
    },
    {
      key: "academyYear",
      label: "Academy Year",
      render: (s) => s.academyYear,
    },
    {
      key: "semesterType",
      label: "Status",
      render: (s) => (
        <>
          {s.semesterType === SemesterType.DONE && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle size={16} />
              <span>Done</span>
            </div>
          )}
          {s.semesterType === SemesterType.PROCESSING && (
            <div className="flex items-center gap-2 text-blue-600">
              <Loader size={16} />
              <span>Processing</span>
            </div>
          )}
          {s.semesterType === SemesterType.PROGRESS && (
            <div className="flex items-center gap-2 text-yellow-500">
              <CalendarClock size={16} />
              <span>Progress</span>
            </div>
          )}
        </>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (s) => (
        <div className="flex justify-start space-x-2">
          <Button
            onClick={() => handleOpenEditModal(s)}
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-gray-200 hover:bg-gray-300"
            disabled={isSubmitting}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => {
              setSemesters(s);
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
                <BreadcrumbPage>Manage Semester</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </CardContent>
      </Card>

      <CollapsibleFilterPanel
        config={{
          title: "Manage Semesters",
          totalCount: allSemesterData?.totalElements,
          searchValue: searchQuery,
          searchPlaceholder: "Search semester...",
          onSearchChange: handleSearchChange,
          buttonText: "Add New",
          onButtonClick: handleOpenAddModal,
          filters: [
            {
              id: "year",
              type: "year",
              label: "Academy Year",
              value: selectedYear,
              onChange: setSelectedYear,
            },
          ],
          onClearAll: () => {
            setSelectedYear(new Date().getFullYear());
            setSearchQuery("");
          },
        }}
        essentialFilterIds={["year"]}
      />

      <DataTable
        data={allSemesterData?.content ?? null}
        columns={columns}
        loading={isLoading}
        currentPage={currentPage}
        totalPages={allSemesterData?.totalPages ?? 0}
        totalElements={allSemesterData?.totalElements}
        onPageChange={handlePageChange}
        emptyMessage="No semesters found"
        getRowKey={(s) => s.id}
      />

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
