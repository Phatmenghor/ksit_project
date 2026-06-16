"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { useDebounce } from "@/utils/debounce/debounce";
import { usePagination } from "@/hooks/use-pagination";
import { DateTimeFormatter } from "@/utils/date/date-time-format";
import { CollapsibleFilterPanel } from "@/components/shared/filter";
import { DataTable, TableColumn } from "@/components/shared/data-table";

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

  const { currentPage, updateUrlWithPage, handlePageChange } =
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
        }
      } catch (error) {
        toast.error("An error occurred while loading majors");
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
          toast.error(error.message || "Failed to add major");
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

  const columns: TableColumn<MajorModel>[] = [
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
      render: (major) => (
        <span className="rounded bg-gray-100 px-2 py-1">{major.code}</span>
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (major) => major.name,
    },
    {
      key: "department",
      label: "Department",
      render: (major) => major.department.name,
    },
    {
      key: "createdAt",
      label: "Created At",
      render: (major) => DateTimeFormatter(major.createdAt),
    },
    {
      key: "actions",
      label: "Actions",
      render: (major) => (
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
                <BreadcrumbPage>Manage Major</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </CardContent>
      </Card>

      <CollapsibleFilterPanel
        config={{
          title: "Manage Majors",
          totalCount: allMajorData?.totalElements,
          searchValue: searchQuery,
          searchPlaceholder: "Search major...",
          onSearchChange: handleSearchChange,
          buttonText: "Add New",
          onButtonClick: handleOpenAddModal,
          filters: [],
          onClearAll: () => {
            setSearchQuery("");
          },
        }}
        essentialFilterIds={[]}
      />

      <DataTable
        data={allMajorData?.content ?? null}
        columns={columns}
        loading={isLoading}
        currentPage={currentPage}
        totalPages={allMajorData?.totalPages ?? 0}
        totalElements={allMajorData?.totalElements}
        onPageChange={handlePageChange}
        emptyMessage="No majors found"
        getRowKey={(major) => major.id}
      />

      <MajorFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={initialData}
        mode={modalMode}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={handleDeleteMajor}
        title="Delete Major"
        description="Are you sure you want to delete the major:"
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
