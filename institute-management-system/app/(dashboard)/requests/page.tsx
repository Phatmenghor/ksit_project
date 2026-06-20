"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTE } from "@/constants/routes";
import { REQUEST_TYPES } from "@/constants/constant";
import { useDebounce } from "@/utils/debounce/debounce";
import { usePagination } from "@/hooks/use-pagination";
import { useCachedEffect } from "@/hooks/use-cached-list";
import { StudentModel } from "@/model/user/student/student.request.model";
import { ComboboxSelectStudent } from "@/components/shared/ComboBox/combobox-student";
import { CollapsibleFilterPanel } from "@/components/shared/filter";
import { DataTable } from "@/components/shared/data-table";
import { RequestModel } from "@/model/request/request-model";
import { Card, CardContent } from "@/components/ui/card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { CreateRequestModal } from "@/components/dashboard/requests/create-request-modal";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { createRequestColumns } from "./columns";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectRequestData,
  selectRequestIsLoading,
  selectRequestFilters,
} from "@/features/requests/store/selectors/request-selectors";
import {
  setSearchFilter,
  setStatusFilter,
  setUserFilter,
  setPageNo,
  resetFilters,
} from "@/features/requests/store/slice/request-slice";
import { fetchAllRequestsService, deleteRequestThunk } from "@/features/requests/store/thunks/request-thunks";

export default function RequestPage() {
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectRequestData);
  const isLoading = useAppSelector(selectRequestIsLoading);
  const filters = useAppSelector(selectRequestFilters);

  const [selectedUser, setSelectedUser] = useState<StudentModel | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingRequest, setDeletingRequest] = useState<RequestModel | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();

  const { currentPage, currentPageSize, updateUrlWithPage, handlePageChange, handlePageSizeChange, getDisplayIndex } =
    usePagination({ baseRoute: ROUTE.REQUESTS });

  const searchDebounce = useDebounce(filters.search, 500);

  useCachedEffect("requests", () => {
    dispatch(
      fetchAllRequestsService({
        search: searchDebounce,
        pageNo: currentPage,
        userId: filters.userId,
        pageSize: currentPageSize,
        status: filters.status,
      })
    );
  }, [dispatch, searchDebounce, filters.status, filters.userId, currentPage, currentPageSize]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
    if (currentPage !== 1) updateUrlWithPage(1);
  };

  const handleUserChange = (user: StudentModel | null) => {
    setSelectedUser(user);
    dispatch(setUserFilter(user?.id ? Number(user.id) : undefined));
    updateUrlWithPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingRequest) return;
    try {
      setIsDeleting(true);
      await dispatch(deleteRequestThunk(deletingRequest.id)).unwrap();
      toast.success("Request deleted successfully");
    } catch {
      toast.error("Failed to delete request");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setDeletingRequest(null);
    }
  };

  const columns = createRequestColumns({
    getDisplayIndex,
    router,
    onDelete: (req) => {
      setDeletingRequest(req);
      setIsDeleteDialogOpen(true);
    },
  });

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-none bg-transparent p-0">
        <CardContent className="p-0 space-y-2">
          <PageBreadcrumb items={[{ label: "Request List" }]} />
        </CardContent>
      </Card>

      <CollapsibleFilterPanel
        config={{
          title: "Request List",
          totalCount: data?.totalElements,
          searchValue: filters.search,
          searchPlaceholder: "Search by name or ID...",
          onSearchChange: handleSearchChange,
          buttonText: "Create Request",
          onButtonClick: () => setIsCreateModalOpen(true),
          filters: [
            {
              id: "student",
              type: "custom",
              label: "Student",
              value: selectedUser,
              onChange: (v) => handleUserChange(v),
              render: ({ value, onChange }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-foreground/85">Student</label>
                  <ComboboxSelectStudent
                    dataSelect={value ?? null}
                    onChangeSelected={(u) => onChange(u)}
                  />
                </div>
              ),
            },
            {
              id: "status",
              type: "select",
              label: "Status",
              value: filters.status,
              onChange: (v) => {
                dispatch(setStatusFilter(v as string));
                updateUrlWithPage(1);
              },
              options: REQUEST_TYPES.map((t) => ({
                value: t.value,
                label: t.label,
              })),
            },
          ],
          onClearAll: () => {
            dispatch(resetFilters());
            setSelectedUser(null);
          },
        }}
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
        emptyMessage="No Record"
        getRowKey={(req: RequestModel) => req.id}
      />

      <CreateRequestModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => {
          dispatch(fetchAllRequestsService({
            search: searchDebounce,
            pageNo: currentPage,
            userId: filters.userId,
            pageSize: currentPageSize,
            status: filters.status,
          }));
        }}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeletingRequest(null);
        }}
        onDelete={handleDeleteConfirm}
        title="Delete Request"
        description="Are you sure you want to delete this request?"
        isSubmitting={isDeleting}
      />
    </div>
  );
}
