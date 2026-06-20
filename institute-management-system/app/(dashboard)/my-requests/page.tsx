"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTE } from "@/constants/routes";
import { REQUEST_TYPES } from "@/constants/constant";
import { RequestModel } from "@/model/request/request-model";
import { useDebounce } from "@/utils/debounce/debounce";
import { usePagination } from "@/hooks/use-pagination";
import { useCachedEffect } from "@/hooks/use-cached-list";
import { getUserId } from "@/utils/local-storage/user-info/userId";
import { Card, CardContent } from "@/components/ui/card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { CollapsibleFilterPanel } from "@/components/shared/filter";
import { DataTable } from "@/components/shared/data-table";
import { CreateRequestModal } from "@/components/dashboard/requests/create-request-modal";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { MyRequestDetailModal } from "@/components/dashboard/requests/my-request-detail-modal";
import { createMyRequestColumns } from "./columns";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectMyRequestData,
  selectMyRequestIsLoading,
  selectMyRequestFilters,
} from "@/features/requests/store/selectors/my-request-selectors";
import {
  setSearchFilter,
  setStatusFilter,
  setPageNo,
  resetFilters,
} from "@/features/requests/store/slice/my-request-slice";
import { fetchMyRequestsService } from "@/features/requests/store/thunks/my-request-thunks";
import { deleteRequestThunk } from "@/features/requests/store/thunks/request-thunks";

export default function MyRequestsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectMyRequestData);
  const isLoading = useAppSelector(selectMyRequestIsLoading);
  const filters = useAppSelector(selectMyRequestFilters);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingRequest, setDeletingRequest] = useState<RequestModel | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestModel | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const debouncedSearch = useDebounce(filters.search, 500);

  const { currentPage, currentPageSize, updateUrlWithPage, handlePageChange, handlePageSizeChange, getDisplayIndex } =
    usePagination({ baseRoute: ROUTE.MY_REQUESTS });

  const currentUserId = typeof window !== "undefined" ? Number(getUserId()) || undefined : undefined;

  useCachedEffect("my-requests", () => {
    dispatch(
      fetchMyRequestsService({
        search: debouncedSearch || undefined,
        status: filters.status,
        userId: currentUserId,
        pageNo: currentPage,
        pageSize: currentPageSize,
      })
    );
  }, [dispatch, debouncedSearch, filters.status, currentPage, currentPageSize, currentUserId]);

  const handleDeleteConfirm = async () => {
    if (!deletingRequest) return;
    try {
      setIsDeleting(true);
      await dispatch(deleteRequestThunk(deletingRequest.id)).unwrap();
      toast.success("Request cancelled successfully");
    } catch {
      toast.error("Failed to cancel request");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setDeletingRequest(null);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
    if (currentPage !== 1) updateUrlWithPage(1);
  };

  const tableColumns = createMyRequestColumns({
    getDisplayIndex,
    router,
    onViewDetail: (req) => {
      setSelectedRequest(req);
      setIsDetailOpen(true);
    },
    onDelete: (req) => {
      setDeletingRequest(req);
      setIsDeleteDialogOpen(true);
    },
  });

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-none bg-transparent p-0">
        <CardContent className="p-0">
          <PageBreadcrumb items={[{ label: "My Requests" }]} />
        </CardContent>
      </Card>

      <CollapsibleFilterPanel
        config={{
          title: "My Requests",
          totalCount: data?.totalElements,
          searchValue: filters.search,
          searchPlaceholder: "Search by title...",
          onSearchChange: handleSearchChange,
          buttonText: "Create Request",
          onButtonClick: () => setIsCreateModalOpen(true),
          filters: [
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
          onClearAll: () => dispatch(resetFilters()),
        }}
      />

      <DataTable
        data={data?.content ?? null}
        columns={tableColumns}
        loading={isLoading}
        currentPage={currentPage}
        totalPages={data?.totalPages ?? 0}
        totalElements={data?.totalElements}
        onPageChange={(page) => { dispatch(setPageNo(page)); handlePageChange(page); }}
        pageSize={currentPageSize}
        onPageSizeChange={handlePageSizeChange}
        emptyMessage="No requests found"
        getRowKey={(req: RequestModel) => req.id}
      />

      <CreateRequestModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => {
          dispatch(
            fetchMyRequestsService({
              search: debouncedSearch || undefined,
              status: filters.status,
              userId: currentUserId,
              pageNo: currentPage,
              pageSize: currentPageSize,
            })
          );
        }}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeletingRequest(null);
        }}
        onDelete={handleDeleteConfirm}
        title="Cancel Request"
        description="Are you sure you want to cancel this request?"
        isSubmitting={isDeleting}
      />

      <MyRequestDetailModal
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        request={selectedRequest}
        onSuccess={() => {
          dispatch(
            fetchMyRequestsService({
              search: debouncedSearch || undefined,
              status: filters.status,
              userId: currentUserId,
              pageNo: currentPage,
              pageSize: currentPageSize,
            })
          );
        }}
      />
    </div>
  );
}
