"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTE } from "@/constants/routes";
import { createMajorColumns } from "./columns";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { MajorModel } from "@/model/master-data/major/all-major-model";
import {
  MajorFormData,
  MajorFormModal,
} from "@/components/dashboard/master-data/manage-major/major-form-modal";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { usePagination } from "@/hooks/use-pagination";
import { useCachedEffect } from "@/hooks/use-cached-list";
import { CollapsibleFilterPanel } from "@/components/shared/filter";
import { DataTable } from "@/components/shared/data-table";
import { toast } from "sonner";
import { Constants } from "@/constants/text-string";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectMajorData,
  selectMajorIsLoading,
  selectMajorOperations,
  selectMajorFilters,
} from "@/features/master-data/store/selectors/major-selectors";
import {
  setSearchFilter,
  setPageNo,
} from "@/features/master-data/store/slice/major-slice";
import {
  fetchAllMajorService,
  createMajorService,
  updateMajorService,
  deleteMajorService,
} from "@/features/master-data/store/thunks/major-thunks";
import { useDebounce } from "@/utils/debounce/debounce";

export default function ManageMajorPage() {
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectMajorData);
  const isLoading = useAppSelector(selectMajorIsLoading);
  const operations = useAppSelector(selectMajorOperations);
  const filters = useAppSelector(selectMajorFilters);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingMajor, setDeletingMajor] = useState<MajorModel | null>(null);
  const [initialData, setInitialData] = useState<MajorFormData | undefined>(undefined);

  const { currentPage, currentPageSize, updateUrlWithPage, handlePageChange, handlePageSizeChange } = usePagination({
    baseRoute: ROUTE.MASTER_DATA.MANAGE_MAJOR,
  });

  const searchDebounce = useDebounce(filters.search, 500);

  useCachedEffect("md-majors", () => {
    dispatch(
      fetchAllMajorService({
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

  const handleOpenAddModal = () => {
    setModalMode("add");
    setInitialData(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (major: MajorModel) => {
    setInitialData({
      id: major.id,
      name: major.name,
      code: major.code,
      departmentId: major.department.id,
      status: Constants.ACTIVE,
    });
    setModalMode("edit");
    setIsModalOpen(true);
  };

  async function handleSubmit(formData: MajorFormData) {
    const payload = {
      code: formData.code,
      name: formData.name,
      departmentId: formData.departmentId,
      status: formData.status,
    };

    if (modalMode === "add") {
      const result = await dispatch(createMajorService(payload));
      if (createMajorService.fulfilled.match(result)) {
        toast.success("Major added successfully");
        setIsModalOpen(false);
      } else {
        toast.error((result.payload as string) || "Failed to add major");
      }
    } else if (modalMode === "edit" && formData.id) {
      const result = await dispatch(updateMajorService({ id: formData.id, data: payload }));
      if (updateMajorService.fulfilled.match(result)) {
        toast.success("Major updated successfully");
        setIsModalOpen(false);
      } else {
        toast.error((result.payload as string) || "Failed to update major");
      }
    }
  }

  async function handleDeleteMajor() {
    if (!deletingMajor) return;
    const result = await dispatch(deleteMajorService(deletingMajor.id));
    if (deleteMajorService.fulfilled.match(result)) {
      toast.success("Major deleted successfully");
      if (data && data.content.length === 1 && currentPage > 1) {
        updateUrlWithPage(currentPage - 1);
      }
    } else {
      toast.error("Failed to delete major");
    }
    setIsDeleteDialogOpen(false);
    setDeletingMajor(null);
  }

  const columns = createMajorColumns({
    currentPage,
    currentPageSize,
    isDeleting: operations.isDeleting,
    onEdit: handleOpenEditModal,
    onDelete: (m) => { setDeletingMajor(m); setIsDeleteDialogOpen(true); },
  });

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-none bg-transparent p-0">
        <CardContent className="p-0 space-y-2">
          <PageBreadcrumb items={[{ label: "Manage Major" }]} />
        </CardContent>
      </Card>

      <CollapsibleFilterPanel
        config={{
          title: "Manage Majors",
          totalCount: data?.totalElements,
          searchValue: filters.search,
          searchPlaceholder: "Search major...",
          onSearchChange: handleSearchChange,
          buttonText: "Add New",
          onButtonClick: handleOpenAddModal,
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
        emptyMessage="No majors found"
        getRowKey={(m) => m.id}
      />

      <MajorFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={initialData}
        mode={modalMode}
        isSubmitting={operations.isCreating || operations.isUpdating}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => { setIsDeleteDialogOpen(false); setDeletingMajor(null); }}
        onDelete={handleDeleteMajor}
        title="Delete Major"
        description="Are you sure you want to delete the major:"
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}
