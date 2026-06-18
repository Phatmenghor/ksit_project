"use client";

import { Eye, Pencil, RotateCcw, Trash2 } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePagination } from "@/hooks/use-pagination";
import { CollapsibleFilterPanel } from "@/components/shared/filter";
import { DataTable, TableColumn } from "@/components/shared/data-table";
import { DateTimeFormatter } from "@/utils/date/date-time-format";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatEnumLabel } from "@/utils/general/format-enum-label";
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
  resetState,
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

  const { currentPage, updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTE.USERS.STUFF_OFFICER,
    defaultPageSize: 10,
  });

  const searchDebounce = useDebounce(filters.search, 500);

  useEffect(() => {
    dispatch(
      fetchAllStaffService({
        roles: [RoleEnum.STAFF],
        search: searchDebounce,
        status: "ACTIVE",
        pageNo: currentPage,
        pageSize: 30,
      })
    );
  }, [dispatch, searchDebounce, currentPage]);

  useEffect(() => {
    return () => { dispatch(resetState()); };
  }, [dispatch]);

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

  const columns: TableColumn<StaffModel>[] = [
    {
      key: "no",
      label: "#",
      width: "50px",
      render: (_, index) => (currentPage - 1) * 30 + index + 1,
    },
    {
      key: "profile",
      label: "Profile",
      width: "70px",
      render: (item) => {
        const url = item.profileUrl
          ? `${process.env.NEXT_PUBLIC_API_BASE_URL_IMAGE}${item.profileUrl}`
          : undefined;
        const initials =
          [item.englishFirstName, item.englishLastName]
            .filter(Boolean)
            .map((n) => n![0])
            .join("")
            .toUpperCase() ||
          item.username?.charAt(0).toUpperCase() ||
          "U";
        return (
          <Avatar className="h-8 w-8">
            <AvatarImage src={url} alt={item.username} className="object-cover" />
            <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        );
      },
    },
    {
      key: "username",
      label: "Username",
      render: (staff) => staff.username || "---",
    },
    {
      key: "khmerName",
      label: "Khmer Name",
      render: (staff) =>
        `${staff.khmerFirstName || ""} ${staff.khmerLastName || ""}`.trim() || "---",
    },
    {
      key: "englishName",
      label: "English Name",
      render: (staff) =>
        `${staff.englishFirstName ?? ""} ${staff.englishLastName ?? ""}`.trim() || "---",
    },
    {
      key: "gender",
      label: "Gender",
      render: (staff) => formatEnumLabel(staff.gender),
    },
    {
      key: "status",
      label: "Status",
      render: (staff) => (
        <Badge
          variant="outline"
          className={
            staff.status === "ACTIVE"
              ? "border-green-500 text-green-700 bg-green-50"
              : "border-gray-400 text-gray-500"
          }
        >
          {formatEnumLabel(staff.status)}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      render: (staff) => DateTimeFormatter(staff.createdAt),
    },
    {
      key: "actions",
      label: "",
      width: "160px",
      render: (staff) => (
        <div className="flex justify-start space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => router.push(ROUTE.USERS.VIEW_STAFF(String(staff.id)))}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-gray-200 hover:bg-gray-300"
                  disabled={operations.isDeleting}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Staff Detail</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => router.push(ROUTE.USERS.EDIT_STAFF(String(staff.id)))}
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
                  onClick={() => { setSelectedStaff(staff); setIsChangePasswordDialogOpen(true); }}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-gray-200 hover:bg-gray-300"
                  disabled={operations.isDeleting}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset Password</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => { setSelectedStaff(staff); setIsDeleteDialogOpen(true); }}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-red-500 text-white hover:text-gray-100 hover:bg-red-600"
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
