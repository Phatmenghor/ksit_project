"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTE } from "@/constants/routes";
import { createDepartmentColumns } from "./columns";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { useEffect } from "react";
import {
  DepartmentFormData,
  DepartmentFormModal,
} from "@/components/dashboard/master-data/manage-department/department-form-modal";
import { DepartmentModel } from "@/model/master-data/department/all-department-model";
import { toast } from "sonner";
import { Constants } from "@/constants/text-string";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { usePagination } from "@/hooks/use-pagination";
import { CollapsibleFilterPanel } from "@/components/shared/filter";
import { DataTable } from "@/components/shared/data-table";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectDepartmentData,
  selectDepartmentIsLoading,
  selectDepartmentOperations,
  selectDepartmentFilters,
  selectSelectedDepartment,
} from "@/features/master-data/store/selectors/department-selectors";
import {
  setSearchFilter,
  setPageNo,
  clearSelectedDepartment,
  resetState,
} from "@/features/master-data/store/slice/department-slice";
import {
  fetchAllDepartmentService,
  createDepartmentService,
  updateDepartmentService,
  deleteDepartmentService,
} from "@/features/master-data/store/thunks/department-thunks";
import { useDebounce } from "@/utils/debounce/debounce";
import { useCachedEffect } from "@/hooks/use-cached-list";
import { useState } from "react";

export default function ManageDepartmentPage() {
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectDepartmentData);
  const isLoading = useAppSelector(selectDepartmentIsLoading);
  const operations = useAppSelector(selectDepartmentOperations);
  const filters = useAppSelector(selectDepartmentFilters);
  const selectedDepartment = useAppSelector(selectSelectedDepartment);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingDepartment, setDeletingDepartment] =
    useState<DepartmentModel | null>(null);
  const [initialData, setInitialData] = useState<
    DepartmentFormData | undefined
  >(undefined);

  const { currentPage, currentPageSize, updateUrlWithPage, handlePageChange, handlePageSizeChange } = usePagination({
    baseRoute: ROUTE.MASTER_DATA.MANAGE_DEPARTMENT,
  });

  const searchDebounce = useDebounce(filters.search, 500);

  useCachedEffect("master-data-departments", () => {
    dispatch(
      fetchAllDepartmentService({
        search: searchDebounce,
        status: Constants.ACTIVE,
        pageNo: currentPage,
      })
    );
  }, [dispatch, searchDebounce, currentPage]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
    if (currentPage !== 1) updateUrlWithPage(1);
  };

  const handleOpenAddModal = () => {
    dispatch(clearSelectedDepartment());
    setModalMode("add");
    setInitialData(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (dept: DepartmentModel) => {
    setInitialData({
      id: dept.id,
      code: dept.code,
      name: dept.name,
      urlLogo: dept.urlLogo,
      status: dept.status,
    });
    setModalMode("edit");
    setIsModalOpen(true);
  };

  async function handleSubmit(formData: DepartmentFormData) {
    if (modalMode === "add") {
      const result = await dispatch(
        createDepartmentService({
          code: formData.code,
          name: formData.name,
          urlLogo: formData.urlLogo || undefined,
          status: formData.status,
        })
      );
      if (createDepartmentService.fulfilled.match(result)) {
        toast.success("Department added successfully");
        setIsModalOpen(false);
      } else {
        toast.error((result.payload as string) || "Failed to add department");
      }
    } else if (modalMode === "edit" && formData.id) {
      const result = await dispatch(
        updateDepartmentService({
          id: Number(formData.id),
          data: {
            code: formData.code,
            name: formData.name,
            urlLogo: formData.urlLogo || undefined,
            status: formData.status,
          },
        })
      );
      if (updateDepartmentService.fulfilled.match(result)) {
        toast.success("Department updated successfully");
        setIsModalOpen(false);
      } else {
        toast.error(
          (result.payload as string) || "Failed to update department"
        );
      }
    }
  }

  async function handleDeleteDepartment() {
    if (!deletingDepartment) return;
    const result = await dispatch(
      deleteDepartmentService(deletingDepartment.id)
    );
    if (deleteDepartmentService.fulfilled.match(result)) {
      toast.success("Department deleted successfully");
      if (data && data.content.length === 1 && currentPage > 1) {
        updateUrlWithPage(currentPage - 1);
      }
    } else {
      toast.error("Failed to delete department");
    }
    setIsDeleteDialogOpen(false);
    setDeletingDepartment(null);
  }

  const columns = createDepartmentColumns({
    currentPage,
    currentPageSize,
    isDeleting: operations.isDeleting,
    onEdit: handleOpenEditModal,
    onDelete: (dept) => { setDeletingDepartment(dept); setIsDeleteDialogOpen(true); },
  });

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-none bg-transparent p-0">
        <CardContent className="p-0 space-y-2">
          <PageBreadcrumb items={[{ label: "Manage Department" }]} />
        </CardContent>
      </Card>

      <CollapsibleFilterPanel
        config={{
          title: "Manage Departments",
          totalCount: data?.totalElements,
          searchValue: filters.search,
          searchPlaceholder: "Search department...",
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
        onPageChange={(page) => {
          dispatch(setPageNo(page));
          handlePageChange(page);
        }}
        pageSize={currentPageSize}
        onPageSizeChange={handlePageSizeChange}
        emptyMessage="No departments found"
        getRowKey={(dept) => dept.id}
      />

      <DepartmentFormModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialData={initialData}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={operations.isCreating || operations.isUpdating}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeletingDepartment(null);
        }}
        onDelete={handleDeleteDepartment}
        title="Delete Department"
        description="Are you sure you want to delete the department:"
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}
