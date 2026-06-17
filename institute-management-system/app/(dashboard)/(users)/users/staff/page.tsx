"use client";

import { Eye, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";

import {
  deletedStaffService,
  getAllStaffService,
} from "@/service/user/user.service";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import ChangePasswordModal from "@/components/dashboard/users/shared/change-password-modal";
import { useDebounce } from "@/utils/debounce/debounce";
import { RoleEnum } from "@/constants/constant";
import { ROUTE } from "@/constants/routes";
import {
  AllStaffModel,
  StaffModel,
} from "@/model/user/staff/staff.respond.model";
import { StaffListRequest } from "@/model/user/staff/staff.request.model";
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

export default function StuffOfficerListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AllStaffModel | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] =
    useState(false);
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  const [selectedStaff, setSelectedStaff] = useState<StaffModel | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const { currentPage, updateUrlWithPage, handlePageChange, getDisplayIndex } =
    usePagination({
      baseRoute: ROUTE.USERS.STUFF_OFFICER,
      defaultPageSize: 10,
    });

  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (currentPage !== 1) {
      updateUrlWithPage(1);
    }
  };

  // Then add this effect for initial URL setup
  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    if (!pageParam) {
      // Use replace: true to avoid adding to browser history
      updateUrlWithPage(1, true);
    }
  }, [searchParams, updateUrlWithPage]);

  const loadData = useCallback(
    async (param: StaffListRequest) => {
      setIsLoading(true);
      try {
        const response = await getAllStaffService({
          ...param,
          roles: [RoleEnum.STAFF],
          search: searchQuery,
          status: statusFilter,
          pageNo: currentPage,
          pageSize: 30,
        });
        if (response) {
          setData(response);
          // Handle case where current page exceeds total pages
          if (response.totalPages > 0 && currentPage > response.totalPages) {
            updateUrlWithPage(response.totalPages);
            return;
          }
        }
      } catch (error) {
        toast.error("An error occurred while loading staff");
      } finally {
        setIsLoading(false);
      }
    },
    [debouncedSearchQuery, currentPage, statusFilter]
  );

  useEffect(() => {
    loadData({});
  }, [debouncedSearchQuery, currentPage, statusFilter]);

  const handleDeleteStaff = async () => {
    if (!selectedStaff) return;

    setIsSubmitting(true);
    try {
      const originalData = data;
      setData((prevData) => {
        if (!prevData) return null;
        const updatedContent = prevData.content.filter(
          (item) => item.id !== selectedStaff.id
        );
        return {
          ...prevData,
          content: updatedContent,
          totalElements: prevData.totalElements - 1,
        };
      });

      const response = await deletedStaffService(selectedStaff.id);

      if (response) {
        toast.success(
          `Staff ${selectedStaff.username ?? ""} deleted successfully`
        );

        if (data && data.content.length === 1 && currentPage > 1) {
          updateUrlWithPage(currentPage - 1);
        } else {
          await loadData({});
        }
      } else {
        setData(originalData);
        toast.error("Failed to delete staff");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the staff");
      loadData({});
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const columns: TableColumn<StaffModel>[] = [
    {
      key: "no",
      label: "#",
      width: "50px",
      render: (_, i) => getDisplayIndex(i),
    },
    {
      key: "profile",
      label: "",
      width: "50px",
      render: (item) => {
        const url = item.profileUrl
          ? `${process.env.NEXT_PUBLIC_API_BASE_URL_IMAGE}${item.profileUrl}`
          : undefined;
        const initials = [item.englishFirstName, item.englishLastName]
          .filter(Boolean).map(n => n![0]).join("").toUpperCase() || item.username?.charAt(0).toUpperCase() || "U";
        return (
          <Avatar className="h-8 w-8">
            <AvatarImage src={url} alt={item.username} className="object-cover" />
            <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">{initials}</AvatarFallback>
          </Avatar>
        );
      },
    },
    {
      key: "username",
      label: "Username",
      render: (staff) => staff.username.trim() || "---",
    },
    {
      key: "khmerName",
      label: "Khmer Name",
      render: (staff) =>
        `${staff.khmerFirstName || ""} ${staff.khmerLastName || ""}`.trim() ||
        "---",
    },
    {
      key: "englishName",
      label: "English Name",
      render: (staff) =>
        `${staff.englishFirstName ?? ""} ${staff.englishLastName ?? ""}`.trim() ||
        "---",
    },
    {
      key: "gender",
      label: "Gender",
      render: (staff) => staff.gender || "---",
    },
    {
      key: "status",
      label: "Status",
      render: (staff) => (
        <Badge variant="outline" className={staff.status === "ACTIVE" ? "border-green-500 text-green-700 bg-green-50" : "border-gray-400 text-gray-500"}>
          {staff.status || "N/A"}
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
                  onClick={() => {
                    router.push(
                      `${ROUTE.USERS.VIEW_STAFF(String(staff.id))}`
                    );
                  }}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-gray-200 hover:bg-gray-300"
                  disabled={isSubmitting}
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
                  onClick={() =>
                    router.push(ROUTE.USERS.EDIT_STAFF(String(staff.id)))
                  }
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-gray-200 hover:bg-gray-300"
                  disabled={isSubmitting}
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
                    setSelectedStaff(staff);
                    setIsChangePasswordDialogOpen(true);
                  }}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-gray-200 hover:bg-gray-300"
                  disabled={isSubmitting}
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
                  onClick={() => {
                    setSelectedStaff(staff);
                    setIsDeleteDialogOpen(true);
                  }}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-red-500 text-white hover:text-gray-100 hover:bg-red-600"
                  disabled={isSubmitting}
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
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={ROUTE.DASHBOARD}>Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Stuff-Officer-List</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </CardContent>
      </Card>

      <CollapsibleFilterPanel
        config={{
          title: "Manage Staff",
          totalCount: data?.totalElements,
          searchValue: searchQuery,
          searchPlaceholder: "Search...",
          onSearchChange: handleSearchChange,
          buttonText: "Add New",
          onButtonClick: () => router.push(ROUTE.USERS.ADD_STAFF),
          filters: [],
          onClearAll: () => {
            setSearchQuery("");
          },
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
        onPageChange={handlePageChange}
        emptyMessage="No staff found"
        getRowKey={(staff) => staff.id}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordDialogOpen}
        onClose={() => {
          setSelectedStaff(null);
          setIsChangePasswordDialogOpen(false);
        }}
        userId={selectedStaff?.id}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedStaff(null);
        }}
        onDelete={handleDeleteStaff}
        title="Disable Staff"
        description={`Are you sure you want to disable the staff: ${selectedStaff?.username}?`}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
