"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, Plus, RotateCcw, Eye } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { CardHeaderSection } from "@/components/shared/layout/card-header-section";
import PaginationPage from "@/components/shared/pagination-page";
import { RoleEnum } from "@/constants/constant";
import { ROUTE } from "@/constants/routes";
import {
  addStaffService,
  deletedStaffService,
  getAllStaffService,
  updateStaffService,
} from "@/service/user/user.service";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import AdminModalForm from "@/components/dashboard/users/admin/admin-modal";
import { AdminTableHeader } from "@/constants/table/user";
import { useDebounce } from "@/utils/debounce/debounce";
import {
  AddStaffModel,
  EditStaffModel,
} from "@/model/user/staff/staff.request.model";
import { AdminFormData } from "@/model/user/staff/staff.schema";
import {
  AllStaffModel,
  StaffModel,
} from "@/model/user/staff/staff.respond.model";
import {
  cleanField,
  cleanRequiredFieldAdvance,
} from "@/utils/map-helper/student";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter, useSearchParams } from "next/navigation";
import Loading from "@/components/shared/loading";
import { useIsMobile } from "@/hooks/use-mobile";
import ResetPasswordModal from "@/components/dashboard/users/shared/change-password-modal";
import { usePagination } from "@/hooks/use-pagination";

export default function AdminsListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AllStaffModel | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [initialData, setInitialData] = useState<AdminFormData | undefined>(
    undefined
  );
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

  const handleOpenAddModal = () => {
    setModalMode("add");
    setInitialData(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (adminData: StaffModel) => {
    setSelectedAdmin(adminData);
    setInitialData({
      ...adminData,
      roles: adminData.roles ?? [RoleEnum.ADMIN],
      first_name: adminData.khmerFirstName || "",
      last_name: adminData.khmerLastName || "",
      confirmPassword: "",
    });
    setModalMode("edit");
    setIsModalOpen(true);
  };

  async function handleSubmit(formData: AdminFormData) {
    setIsSubmitting(true);
    try {
      const basePayload = {
        username: cleanRequiredFieldAdvance(formData.username, "username"),
        email: cleanRequiredFieldAdvance(formData.email, "email"),
        khmerFirstName: cleanField(formData.first_name),
        khmerLastName: cleanField(formData.last_name),
        englishFirstName: cleanField(formData.first_name),
        englishLastName: cleanField(formData.last_name),
        status: cleanRequiredFieldAdvance(formData.status, "status"),
        roles: formData.roles,
      };

      if (modalMode === "add") {
        const addPayload: AddStaffModel = {
          ...basePayload,
          roles: formData.roles ?? undefined,
          password: cleanRequiredFieldAdvance(formData.password, "password"),
        };

        const response = await addStaffService(addPayload);
        if (response) {
          // Refresh data instead of manual state update for consistency
          await loadData();
          toast.success(`Admin ${response.username} added successfully`);
          setIsModalOpen(false);
        }
      } else if (modalMode === "edit" && formData.id) {
        const updatePayload: EditStaffModel = {
          ...basePayload,
          status: formData.status ?? undefined,
          roles: formData.roles ?? undefined,
        };

        const response = await updateStaffService(formData.id, updatePayload);
        if (response) {
          // Refresh data instead of manual state update for consistency
          await loadData();
          toast.success(`Admin ${response.username} updated successfully`);
          setIsModalOpen(false);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

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

  return (
    <div className="space-y-4">
      <CardHeaderSection
        breadcrumbs={[
          { label: "Dashboard", href: ROUTE.DASHBOARD },
          { label: "Admin List", href: "" },
        ]}
        searchValue={searchQuery}
        searchPlaceholder="Search..."
        onSearchChange={handleSearchChange}
        buttonText="Add New"
        openModal={handleOpenAddModal}
        buttonIcon={<Plus className="mr-2 h-2 w-2" />}
      />

      <div className={`overflow-x-auto mt-4 ${useIsMobile() ? "pl-4" : ""}`}>
        {isLoading ? (
          <Loading />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {AdminTableHeader.map((header, index) => (
                  <TableHead key={index} className={header.className}>
                    {header.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.content.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={AdminTableHeader.length}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No admin found
                  </TableCell>
                </TableRow>
              ) : (
                data?.content.map((admin, index) => (
                  <TableRow key={admin.id}>
                    <TableCell>{getDisplayIndex(index)}</TableCell>
                    <TableCell>{admin.username.trim() || "---"}</TableCell>
                    <TableCell>{admin?.email || "---"}</TableCell>
                    <TableCell>
                      {`${admin.khmerFirstName || ""} ${
                        admin.khmerLastName || ""
                      }`.trim() || "---"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-start space-x-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={() => {
                                  router.push(
                                    `${ROUTE.USERS.ADMIN.ADMIN_VIEW(
                                      String(admin.id)
                                    )}`
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
                                onClick={() => handleOpenEditModal(admin)}
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
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {!isLoading && data && data.totalPages > 1 && (
        <div className="mt-4 flex justify-end">
          <PaginationPage
            currentPage={currentPage}
            totalPages={data.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      <AdminModalForm
        isOpen={isModalOpen}
        mode={modalMode}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={initialData}
        isSubmitting={isSubmitting}
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
        itemName={selectedAdmin?.username}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
