"use client";

import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { RoleEnum } from "@/constants/constant";
import { ROUTE } from "@/constants/routes";
import {
  deletedStaffService,
  getAllStaffService,
} from "@/service/user/user.service";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { useDebounce } from "@/utils/debounce/debounce";
import {
  AllStaffModel,
  StaffModel,
} from "@/model/user/staff/staff.respond.model";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter, useSearchParams } from "next/navigation";
import ResetPasswordModal from "@/components/dashboard/users/shared/change-password-modal";
import { usePagination } from "@/hooks/use-pagination";
import { CollapsibleFilterPanel } from "@/components/shared/filter";
import { DataTable, TableColumn } from "@/components/shared/data-table";
import { DateTimeFormatter } from "@/utils/date/date-time-format";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function AdminsListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AllStaffModel | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] =
    useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<StaffModel | null>(null);
  const [statusFilter, setStatusFilter] = useState("ACTIVE");

  const searchParams = useSearchParams();
  const router = useRouter();

  const { currentPage, updateUrlWithPage, handlePageChange, getDisplayIndex } =
    usePagination({
      baseRoute: ROUTE.USERS.ADMIN.INDEX,
      defaultPageSize: 10,
    });

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Reset to page 1 when searching
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

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllStaffService({
        roles: [RoleEnum.ADMIN],
        search: debouncedSearchQuery,
        pageNo: currentPage,
        pageSize: 30,
        status: statusFilter,
      });

      if (response) {
        setData(response);

        // Handle case where current page exceeds total pages
        if (response.totalPages > 0 && currentPage > response.totalPages) {
          updateUrlWithPage(response.totalPages);
          return;
        }
      } else {
        setData(null);
      }
    } catch (error) {
      toast.error("An error occurred while loading admins");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery, currentPage, statusFilter, updateUrlWithPage]);

  useEffect(() => {
    loadData();
  }, [currentPage]);

  async function handleDeleteAdmin() {
    if (!selectedAdmin) return;

    setIsSubmitting(true);
    try {
      const response = await deletedStaffService(selectedAdmin.id);

      if (response) {
        toast.success(
          `Admin ${selectedAdmin.username ?? ""} deleted successfully`
        );

        // After deletion, check if we need to go back a page
        if (data && data.content.length === 1 && currentPage > 1) {
          updateUrlWithPage(currentPage - 1);
        } else {
          await loadData();
        }
      } else {
        toast.error("Failed to delete admin");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the admin");
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
    }
  }

  const columns: TableColumn<StaffModel>[] = [
    {
      key: "no",
      label: "#",
      width: "50px",
      render: (_, i) => getDisplayIndex(i),
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
            <AvatarImage
              src={url}
              alt={item.username}
              className="object-cover"
            />
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
      render: (admin) => admin.username.trim() || "---",
    },
    {
      key: "email",
      label: "Email",
      render: (admin) => admin?.email || "---",
    },
    {
      key: "name",
      label: "Name",
      render: (admin) =>
        `${admin.khmerFirstName || ""} ${admin.khmerLastName || ""}`.trim() ||
        "---",
    },
    {
      key: "createdAt",
      label: "Created At",
      render: (admin) => DateTimeFormatter(admin.createdAt),
    },
    {
      key: "actions",
      label: "",
      width: "160px",
      render: (admin) => (
        <div className="flex justify-start space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => {
                    router.push(
                      `${ROUTE.USERS.ADMIN.ADMIN_VIEW(String(admin.id))}`
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
              <TooltipContent>Admin Detail</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() =>
                    router.push(
                      ROUTE.USERS.ADMIN.EDIT_ADMIN(String(admin.id))
                    )
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
                    setSelectedAdmin(admin);
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
                    setSelectedAdmin(admin);
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
                <BreadcrumbPage>Admin List</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </CardContent>
      </Card>

      <CollapsibleFilterPanel
        config={{
          title: "Manage Admins",
          totalCount: data?.totalElements,
          searchValue: searchQuery,
          searchPlaceholder: "Search...",
          onSearchChange: handleSearchChange,
          buttonText: "Add New",
          onButtonClick: () => router.push(ROUTE.USERS.ADMIN.ADD_ADMIN),
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
        emptyMessage="No admin found"
        getRowKey={(admin) => admin.id}
      />

      <ResetPasswordModal
        isOpen={isChangePasswordDialogOpen}
        userName={selectedAdmin?.username}
        onClose={() => {
          setIsChangePasswordDialogOpen(false);
          setSelectedAdmin(null);
        }}
        userId={selectedAdmin?.id}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={handleDeleteAdmin}
        title="Delete Admin"
        description={`Are you sure you want to delete the admin: ${selectedAdmin?.username}?`}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
