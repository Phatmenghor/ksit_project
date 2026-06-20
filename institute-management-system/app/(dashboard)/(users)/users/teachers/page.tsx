"use client";

import { Button } from "@/components/ui/button";
import { createTeacherColumns } from "./columns";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { ROUTE } from "@/constants/routes";
import { RoleEnum } from "@/constants/constant";
import ChangePasswordModal from "@/components/dashboard/users/shared/change-password-modal";
import { StaffModel } from "@/model/user/staff/staff.respond.model";
import { useDebounce } from "@/utils/debounce/debounce";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
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

export default function TeachersListPage() {
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectStaffData);
  const isLoading = useAppSelector(selectStaffIsLoading);
  const operations = useAppSelector(selectStaffOperations);
  const filters = useAppSelector(selectStaffFilters);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<StaffModel | null>(null);

  const router = useRouter();

  const { currentPage, currentPageSize, updateUrlWithPage, handlePageChange, handlePageSizeChange } = usePagination({
    baseRoute: ROUTE.USERS.TEACHERS,
  });

  const searchDebounce = useDebounce(filters.search, 500);

  useCachedEffect("users-teachers", () => {
    dispatch(
      fetchAllStaffService({
        roles: [RoleEnum.TEACHER],
        search: searchDebounce,
        status: "ACTIVE",
        pageNo: currentPage,
        pageSize: currentPageSize,
      })
    );
  }, [dispatch, searchDebounce, currentPage]);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
    if (currentPage !== 1) updateUrlWithPage(1);
  };

  async function handleDeleteTeacher() {
    if (!selectedTeacher) return;
    const result = await dispatch(deleteStaffService(selectedTeacher.id));
    if (deleteStaffService.fulfilled.match(result)) {
      toast.success(`Teacher ${selectedTeacher.username ?? ""} deleted successfully`);
      if (data && data.content.length === 1 && currentPage > 1) {
        updateUrlWithPage(currentPage - 1);
      }
    } else {
      toast.error("Failed to delete teacher");
    }
    setIsDeleteDialogOpen(false);
    setSelectedTeacher(null);
  }

  const columns = createTeacherColumns({
    currentPage,
    currentPageSize,
    isDeleting: operations.isDeleting,
    router,
    onResetPassword: (teacher) => { setSelectedTeacher(teacher); setIsChangePasswordDialogOpen(true); },
    onDelete: (teacher) => { setSelectedTeacher(teacher); setIsDeleteDialogOpen(true); },
  });

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-none bg-transparent p-0">
        <CardContent className="p-0 space-y-2">
          <PageBreadcrumb items={[{ label: "Teacher List" }]} />
        </CardContent>
      </Card>

      <CollapsibleFilterPanel
        config={{
          title: "Manage Teachers",
          totalCount: data?.totalElements,
          searchValue: filters.search,
          searchPlaceholder: "Search...",
          onSearchChange: handleSearchChange,
          buttonText: "Add New",
          onButtonClick: () => router.push(ROUTE.USERS.ADD_TEACHER),
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
        emptyMessage="No teacher found"
        getRowKey={(teacher) => teacher.id}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordDialogOpen}
        onClose={() => { setSelectedTeacher(null); setIsChangePasswordDialogOpen(false); }}
        userId={selectedTeacher?.id}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => { setIsDeleteDialogOpen(false); setSelectedTeacher(null); }}
        onDelete={handleDeleteTeacher}
        title="Disable Teacher"
        description="Are you sure you want to disable the teacher:"
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}
