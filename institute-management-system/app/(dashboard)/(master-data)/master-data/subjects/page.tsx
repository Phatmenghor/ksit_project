"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTE } from "@/constants/routes";
import { createSubjectColumns } from "./columns";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { SubjectModel } from "@/model/master-data/subject/all-subject-model";
import { RoomFormData as SubjectFormData } from "@/components/dashboard/master-data/manage-room/room-form-model";
import { SubjectModal } from "@/components/dashboard/master-data/manage-subject/subject-form-model";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { usePagination } from "@/hooks/use-pagination";
import { CollapsibleFilterPanel } from "@/components/shared/filter";
import { DataTable } from "@/components/shared/data-table";
import { toast } from "sonner";
import { Constants } from "@/constants/text-string";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectSubjectData,
  selectSubjectIsLoading,
  selectSubjectOperations,
  selectSubjectFilters,
} from "@/features/master-data/store/selectors/subject-selectors";
import {
  setSearchFilter,
  setPageNo,
} from "@/features/master-data/store/slice/subject-slice";
import {
  fetchAllSubjectService,
  createSubjectService,
  updateSubjectService,
  deleteSubjectService,
} from "@/features/master-data/store/thunks/subject-thunks";
import { useDebounce } from "@/utils/debounce/debounce";

export default function ManageSubjectPage() {
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectSubjectData);
  const isLoading = useAppSelector(selectSubjectIsLoading);
  const operations = useAppSelector(selectSubjectOperations);
  const filters = useAppSelector(selectSubjectFilters);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingSubject, setDeletingSubject] = useState<SubjectModel | null>(null);
  const [initialData, setInitialData] = useState<SubjectFormData | undefined>(undefined);

  const { currentPage, currentPageSize, updateUrlWithPage, handlePageChange, handlePageSizeChange } = usePagination({
    baseRoute: ROUTE.MASTER_DATA.MANAGE_SUBJECT,
  });

  const searchDebounce = useDebounce(filters.search, 500);

  useEffect(() => {
    dispatch(
      fetchAllSubjectService({
        search: searchDebounce,
        status: Constants.ACTIVE,
        pageNo: currentPage,
        pageSize: currentPageSize,
      })
    );
  }, [dispatch, searchDebounce, currentPage, currentPageSize]);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
    if (currentPage !== 1) updateUrlWithPage(1);
  };

  async function handleSubmit(formData: SubjectFormData) {
    const payload = { name: formData.name, status: formData.status };

    if (modalMode === "add") {
      const result = await dispatch(createSubjectService(payload));
      if (createSubjectService.fulfilled.match(result)) {
        toast.success("Subject added successfully");
        setIsModalOpen(false);
      } else {
        toast.error((result.payload as string) || "Failed to add subject");
      }
    } else if (modalMode === "edit" && formData.id) {
      const result = await dispatch(updateSubjectService({ id: formData.id, data: payload }));
      if (updateSubjectService.fulfilled.match(result)) {
        toast.success("Subject updated successfully");
        setIsModalOpen(false);
      } else {
        toast.error((result.payload as string) || "Failed to update subject");
      }
    }
  }

  async function handleDeleteSubject() {
    if (!deletingSubject) return;
    const result = await dispatch(deleteSubjectService(deletingSubject.id));
    if (deleteSubjectService.fulfilled.match(result)) {
      toast.success("Subject deleted successfully");
      if (data && data.content.length === 1 && currentPage > 1) {
        updateUrlWithPage(currentPage - 1);
      }
    } else {
      toast.error("Failed to delete subject");
    }
    setIsDeleteDialogOpen(false);
    setDeletingSubject(null);
  }

  const columns = createSubjectColumns({
    currentPage,
    currentPageSize,
    isDeleting: operations.isDeleting,
    onEdit: (s) => { setInitialData({ id: s.id, name: s.name, status: s.status }); setModalMode("edit"); setIsModalOpen(true); },
    onDelete: (s) => { setDeletingSubject(s); setIsDeleteDialogOpen(true); },
  });

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-none bg-transparent p-0">
        <CardContent className="p-0 space-y-2">
          <PageBreadcrumb items={[{ label: "Manage Subject" }]} />
        </CardContent>
      </Card>

      <CollapsibleFilterPanel
        config={{
          title: "Manage Subjects",
          totalCount: data?.totalElements,
          searchValue: filters.search,
          searchPlaceholder: "Search subject...",
          onSearchChange: handleSearchChange,
          buttonText: "Add New",
          onButtonClick: () => { setModalMode("add"); setInitialData(undefined); setIsModalOpen(true); },
          filters: [],
          onClearAll: () => dispatch(setSearchFilter("")),
        }}
        essentialFilterIds={[]}
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
        emptyMessage="No subjects found"
        getRowKey={(s) => s.id}
      />

      <SubjectModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialData={initialData}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={operations.isCreating || operations.isUpdating}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => { setIsDeleteDialogOpen(false); setDeletingSubject(null); }}
        onDelete={handleDeleteSubject}
        title="Delete Subject"
        description="Are you sure you want to delete the subject:"
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}
