"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ROUTE } from "@/constants/routes";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { useEffect } from "react";
import {
  DepartmentFormData,
  DepartmentFormModal,
} from "@/components/dashboard/master-data/manage-department/department-form-modal";
import { DepartmentModel } from "@/model/master-data/department/all-department-model";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DateTimeFormatter } from "@/utils/date/date-time-format";
import { Constants } from "@/constants/text-string";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { baseAPI } from "@/constants/api";
import { usePagination } from "@/hooks/use-pagination";
import { CollapsibleFilterPanel } from "@/components/shared/filter";
import { DataTable, TableColumn } from "@/components/shared/data-table";
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

  useEffect(() => {
    dispatch(
      fetchAllDepartmentService({
        search: searchDebounce,
        status: Constants.ACTIVE,
        pageNo: currentPage,
      })
    );
  }, [dispatch, searchDebounce, currentPage]);

  useEffect(() => {
    return () => {
      dispatch(resetState());
    };
  }, [dispatch]);

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

  const columns: TableColumn<DepartmentModel>[] = [
    {
      key: "no",
      label: "#",
      width: "50px",
      render: (_, index) => (currentPage - 1) * currentPageSize + index + 1,
    },
    { key: "code", label: "Code", render: (dept) => dept.code },
    { key: "name", label: "Name", render: (dept) => dept.name },
    {
      key: "logo",
      label: "Logo",
      render: (dept) => (
        <Avatar className="h-12 w-12">
          <AvatarImage
            src={
              dept.urlLogo
                ? `${baseAPI.BASE_IMAGE}${dept.urlLogo}`
                : baseAPI.NO_IMAGE
            }
            alt={dept.name}
          />
          <AvatarFallback>{dept.name?.charAt(0)}</AvatarFallback>
        </Avatar>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      render: (dept) => DateTimeFormatter(dept.createdAt),
    },
    {
      key: "actions",
      label: "Actions",
      render: (dept) => (
        <div className="flex justify-start space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => handleOpenEditModal(dept)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-gray-200 hover:bg-gray-300"
                  disabled={operations.isDeleting}
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
                    setDeletingDepartment(dept);
                    setIsDeleteDialogOpen(true);
                  }}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-red-500 text-white hover:bg-red-600"
                  disabled={operations.isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ];

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
