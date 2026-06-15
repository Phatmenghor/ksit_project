"use client";
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
import { useCallback, useEffect, useState } from "react";
import { RoomModel } from "@/model/master-data/room/all-room-model";
import { Constants } from "@/constants/text-string";
import { toast } from "sonner";
import { RoomFormData as SubjectFormData } from "@/components/dashboard/master-data/manage-room/room-form-model";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import {
  AllSubjectModel,
  SubjectModel,
} from "@/model/master-data/subject/all-subject-model";
import { AllSubjectFilterModel } from "@/model/master-data/subject/type-subject-mode";
import {
  createSubjectService,
  deletedSubjectService,
  getAllSubjectService,
  updateSubjectService,
} from "@/service/master-data/subject.service";
import { SubjectModal } from "@/components/dashboard/master-data/manage-subject/subject-form-model";
import { useDebounce } from "@/utils/debounce/debounce";
import { useSearchParams } from "next/navigation";
import { usePagination } from "@/hooks/use-pagination";
import { CollapsibleFilterPanel } from "@/components/shared/filter";
import { DataTable, TableColumn } from "@/components/shared/data-table";

export default function ManageSubjectPage() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [subject, setSubject] = useState<SubjectModel | null>(null);
  const [allSubjectData, setAllSubjectData] = useState<AllSubjectModel | null>(
    null
  );
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [initialData, setInitialData] = useState<SubjectFormData | undefined>(
    undefined
  );
  const searchParams = useSearchParams();

  const { currentPage, updateUrlWithPage, handlePageChange } =
    usePagination({
      baseRoute: ROUTE.MASTER_DATA.MANAGE_SUBJECT,
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

  const loadSubjects = useCallback(
    async (param: AllSubjectFilterModel) => {
      setIsLoading(true);

      try {
        const response = await getAllSubjectService({
          search: searchDebounce,
          status: Constants.ACTIVE,
          pageNo: currentPage,
          pageSize: 30,
          ...param,
        });

        if (response) {
          setAllSubjectData(response);
          if (response.totalPages > 0 && currentPage > response.totalPages) {
            updateUrlWithPage(response.totalPages);
            return;
          }
        }
      } catch (error) {
        toast.error("An error occurred while loading subject");
      } finally {
        setIsLoading(false);
      }
    },
    [searchDebounce, currentPage]
  );

  useEffect(() => {
    loadSubjects({});
  }, [searchDebounce, currentPage]);

  const handleOpenAddModal = () => {
    setModalMode("add");
    setInitialData(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (subjectData: SubjectModel) => {
    const formData: SubjectFormData = {
      id: subjectData.id,
      name: subjectData.name,
      status: subjectData.status,
    };

    setModalMode("edit");
    setInitialData(formData);
    setIsModalOpen(true);
  };

  async function handleSubmit(formData: SubjectFormData) {
    setIsSubmitting(true);

    try {
      const subjectData = {
        name: formData.name.trim(),
        status: formData.status,
      };

      let response: RoomModel | null = null;

      if (modalMode === "add") {
        try {
          response = await createSubjectService(subjectData);

          if (response) {
            setAllSubjectData((prevData) => {
              if (!prevData) return null;
              const updatedContent = response
                ? [response, ...prevData.content]
                : [...prevData.content];

              return {
                ...prevData,
                content: updatedContent,
                totalElements: prevData.totalElements + 1,
              } as AllSubjectModel;
            });

            toast.success("Subject added successfully");
            setIsModalOpen(false);
          }
        } catch (error: any) {
          toast.error(error.message || "Failed to add subject");
        }
      } else if (modalMode === "edit" && formData.id) {
        try {
          response = await updateSubjectService(formData.id, subjectData);
          if (response) {
            setAllSubjectData((prevData) => {
              if (!prevData) return null;

              const updatedContent = prevData.content.map((s) =>
                s.id === formData.id && response ? response : s
              );

              return {
                ...prevData,
                content: updatedContent,
              } as AllSubjectModel;
            });

            toast.success("Subject updated successfully");
            setIsModalOpen(false);
          }
        } catch (error: any) {
          toast.error(error.message || "Failed to update subject");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteSubject() {
    if (!subject) return;

    setIsSubmitting(true);
    try {
      const response = await deletedSubjectService(subject.id);

      if (response) {
        setAllSubjectData((prevData) => {
          if (!prevData) return null;

          const updatedContent = prevData.content.filter(
            (item) => item.id !== subject.id
          );

          return {
            ...prevData,
            content: updatedContent,
            totalElements: prevData.totalElements - 1,
          };
        });

        toast.success("Subject deleted successfully");
        if (
          allSubjectData &&
          allSubjectData.content.length === 1 &&
          currentPage > 1
        ) {
          updateUrlWithPage(currentPage - 1);
        } else {
          await loadSubjects({});
        }
      } else {
        toast.error("Failed to delete subject");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the subject.");
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
    }
  }

  const columns: TableColumn<SubjectModel>[] = [
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
      key: "name",
      label: "Name",
      render: (s) => s.name,
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
              setSubject(s);
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
                <BreadcrumbPage>Manage Subject</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </CardContent>
      </Card>

      <CollapsibleFilterPanel
        config={{
          title: "Manage Subjects",
          totalCount: allSubjectData?.totalElements,
          searchValue: searchQuery,
          searchPlaceholder: "Search subject...",
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
        data={allSubjectData?.content ?? null}
        columns={columns}
        loading={isLoading}
        currentPage={currentPage}
        totalPages={allSubjectData?.totalPages ?? 0}
        totalElements={allSubjectData?.totalElements}
        onPageChange={handlePageChange}
        emptyMessage="No subjects found"
        getRowKey={(s) => s.id}
      />

      <SubjectModal
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
        onDelete={handleDeleteSubject}
        title="Delete Subject"
        description="Are you sure you want to delete the subject:"
        itemName={subject?.name}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
