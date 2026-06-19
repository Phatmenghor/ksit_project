"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { createAdminColumns } from "./columns";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RoleEnum } from "@/constants/constant";
import { ROUTE } from "@/constants/routes";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { useDebounce } from "@/utils/debounce/debounce";
import { StaffModel } from "@/model/user/staff/staff.respond.model";
import { useRouter } from "next/navigation";
import ResetPasswordModal from "@/components/dashboard/users/shared/change-password-modal";
import { usePagination } from "@/hooks/use-pagination";
import { CollapsibleFilterPanel } from "@/components/shared/filter";
import { DataTable } from "@/components/shared/data-table";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectStaffData,
  selectStaffIsLoading,
  selectStaffOperations,
  selectStaffFilters,
} from "@/features/users/store/selectors/staff-selectors";
import {
  setSearchFilter,
  setPageNo,
} from "@/features/users/store/slice/staff-slice";
import {
  fetchAllStaffService,
  deleteStaffService,
} from "@/features/users/store/thunks/staff-thunks";

export default function AdminsListPage() {
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectStaffData);
  const isLoading = useAppSelector(selectStaffIsLoading);
  const operations = useAppSelector(selectStaffOperations);
  const filters = useAppSelector(selectStaffFilters);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<StaffModel | null>(null);

  const router = useRouter();

  const { currentPage, currentPageSize, updateUrlWithPage, handlePageChange, handlePageSizeChange } = usePagination({
    baseRoute: ROUTE.USERS.ADMIN.INDEX,
  });

  const searchDebounce = useDebounce(filters.search, 500);

  useEffect(() => {
    dispatch(
      fetchAllStaffService({
        roles: [RoleEnum.ADMIN],
        search: searchDebounce,
        pageNo: currentPage,
        pageSize: currentPageSize,
        status: "ACTIVE",
      })
    );
  }, [dispatch, searchDebounce, currentPage]);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
    if (currentPage !== 1) updateUrlWithPage(1);
  };

  async function handleDeleteAdmin() {
    if (!selectedAdmin) return;
    const result = await dispatch(deleteStaffService(selectedAdmin.id));
    if (deleteStaffService.fulfilled.match(result)) {
      toast.success(`Admin ${selectedAdmin.username ?? ""} deleted successfully`);
      if (data && data.content.length === 1 && currentPage > 1) {
        updateUrlWithPage(currentPage - 1);
      }
    } else {
      toast.error("Failed to delete admin");
    }
    setIsDeleteDialogOpen(false);
    setSelectedAdmin(null);
  }

  const columns = createAdminColumns({
    currentPage,
    currentPageSize,
    isDeleting: operations.isDeleting,
    router,
    onResetPassword: (admin) => { setSelectedAdmin(admin); setIsChangePasswordDialogOpen(true); },
    onDelete: (admin) => { setSelectedAdmin(admin); setIsDeleteDialogOpen(true); },
  });

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-none bg-transparent p-0">
        <CardContent className="p-0 space-y-2">
          <PageBreadcrumb items={[{ label: "Admin List" }]} />
        </CardContent>
      </Card>

      <CollapsibleFilterPanel
        config={{
          title: "Manage Admins",
          totalCount: data?.totalElements,
          searchValue: filters.search,
          searchPlaceholder: "Search...",
          onSearchChange: handleSearchChange,
          buttonText: "Add New",
          onButtonClick: () => router.push(ROUTE.USERS.ADMIN.ADD_ADMIN),
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
        emptyMessage="No admin found"
        getRowKey={(admin) => admin.id}
      />

      <ResetPasswordModal
        isOpen={isChangePasswordDialogOpen}
        userName={selectedAdmin?.username}
        onClose={() => { setIsChangePasswordDialogOpen(false); setSelectedAdmin(null); }}
        userId={selectedAdmin?.id}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => { setIsDeleteDialogOpen(false); setSelectedAdmin(null); }}
        onDelete={handleDeleteAdmin}
        title="Delete Admin"
        description="Are you sure you want to delete the admin:"
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}
