"use client";

import { createStaffColumns } from "./columns";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import ChangePasswordModal from "@/components/dashboard/users/shared/change-password-modal";
import { useDebounce } from "@/utils/debounce/debounce";
import { RoleEnum } from "@/constants/constant";
import { ROUTE } from "@/constants/routes";
import { StaffModel } from "@/model/user/staff/staff.respond.model";
import { usePagination } from "@/hooks/use-pagination";
import { useCachedEffect } from "@/hooks/use-cached-list";
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

export default function StuffOfficerListPage() {
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectStaffData);
  const isLoading = useAppSelector(selectStaffIsLoading);
  const operations = useAppSelector(selectStaffOperations);
  const filters = useAppSelector(selectStaffFilters);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffModel | null>(null);

  const router = useRouter();

  const { currentPage, currentPageSize, updateUrlWithPage, handlePageChange, handlePageSizeChange } = usePagination({
    baseRoute: ROUTE.USERS.STUFF_OFFICER,
  });

  const searchDebounce = useDebounce(filters.search, 500);

  useCachedEffect("users-staff", () => {
    dispatch(
      fetchAllStaffService({
        roles: [RoleEnum.STAFF],
        search: searchDebounce,
        status: "ACTIVE",
        pageNo: currentPage,
        pageSize: currentPageSize,
      })
    );
  }, [dispatch, searchDebounce, currentPage, currentPageSize]);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
    if (currentPage !== 1) updateUrlWithPage(1);
  };

  const handleDeleteStaff = async () => {
    if (!selectedStaff) return;
    const result = await dispatch(deleteStaffService(selectedStaff.id));
    if (deleteStaffService.fulfilled.match(result)) {
      toast.success(`Staff ${selectedStaff.username ?? ""} deleted successfully`);
      if (data && data.content.length === 1 && currentPage > 1) {
        updateUrlWithPage(currentPage - 1);
      }
    } else {
      toast.error("Failed to delete staff");
    }
    setIsDeleteDialogOpen(false);
    setSelectedStaff(null);
  };

  const columns = createStaffColumns({
    currentPage,
    currentPageSize,
    isDeleting: operations.isDeleting,
    router,
    onResetPassword: (staff) => { setSelectedStaff(staff); setIsChangePasswordDialogOpen(true); },
    onDelete: (staff) => { setSelectedStaff(staff); setIsDeleteDialogOpen(true); },
  });

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-none bg-transparent p-0">
        <CardContent className="p-0 space-y-2">
          <PageBreadcrumb items={[{ label: "Staff List" }]} />
        </CardContent>
      </Card>

      <CollapsibleFilterPanel
        config={{
          title: "Manage Staff",
          totalCount: data?.totalElements,
          searchValue: filters.search,
          searchPlaceholder: "Search...",
          onSearchChange: handleSearchChange,
          buttonText: "Add New",
          onButtonClick: () => router.push(ROUTE.USERS.ADD_STAFF),
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
        emptyMessage="No staff found"
        getRowKey={(staff) => staff.id}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordDialogOpen}
        onClose={() => { setSelectedStaff(null); setIsChangePasswordDialogOpen(false); }}
        userId={selectedStaff?.id}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => { setIsDeleteDialogOpen(false); setSelectedStaff(null); }}
        onDelete={handleDeleteStaff}
        title="Disable Staff"
        description="Are you sure you want to disable the staff:"
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}
