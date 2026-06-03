"use client";

import { Eye, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

import {
  deletedStaffService,
  getAllStaffService,
} from "@/service/user/user.service";
import { StaffTableHeader } from "@/constants/table/user";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import ChangePasswordModal from "@/components/dashboard/users/shared/change-password-modal";
import { useDebounce } from "@/utils/debounce/debounce";
import { CardHeaderSection } from "@/components/shared/layout/card-header-section";
import PaginationPage from "@/components/shared/pagination-page";
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
import Loading from "@/components/shared/loading";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePagination } from "@/hooks/use-pagination";

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
        } else {
          console.error("Failed to fetch staff:");
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
      console.error("Error deleting teacher:", error);
      toast.error("An error occurred while deleting the staff");
      loadData({});
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <CardHeaderSection
        breadcrumbs={[
          { label: "Dashboard", href: ROUTE.DASHBOARD },
          { label: "Stuff-Officer-List", href: "" },
        ]}
        searchValue={searchQuery}
        buttonHref={ROUTE.USERS.ADD_STAFF}
        searchPlaceholder="Search..."
        onSearchChange={handleSearchChange}
        buttonText="Add New"
        buttonIcon={<Plus className="mr-2 h-2 w-2" />}
      />

      <div className={`overflow-x-auto mt-4 ${useIsMobile() ? "pl-4" : ""}`}>
        {" "}
        {isLoading ? (
          <Loading />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {StaffTableHeader.map((header, index) => (
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
                    colSpan={StaffTableHeader.length}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No staff found
                  </TableCell>
                </TableRow>
              ) : (
                data?.content.map((staff, index) => {
                  return (
                    <TableRow key={staff.id}>
                      <TableCell>{getDisplayIndex(index)}</TableCell>
                      <TableCell>{staff.username.trim() || "---"}</TableCell>
                      <TableCell>
                        {`${staff.khmerFirstName || ""} ${
                          staff.khmerLastName || ""
                        }`.trim() || "---"}
                      </TableCell>
                      <TableCell>
                        {`${staff.englishFirstName ?? ""}
                        ${staff.englishLastName ?? ""}`.trim() || "---"}
                      </TableCell>
                      <TableCell>{staff.gender || "---"}</TableCell>

                      <TableCell>
                        <div className="flex justify-start space-x-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => {
                                    router.push(
                                      `${ROUTE.USERS.VIEW_STAFF(
                                        String(staff.id)
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
                              <TooltipContent>Staff Detail</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() =>
                                    router.push(
                                      ROUTE.USERS.EDIT_STAFF(String(staff.id))
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
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </div>

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
        itemName={selectedStaff?.username}
        isSubmitting={isSubmitting}
      />

      {!isLoading && data && (
        <div className="mt-4 flex justify-end">
          <PaginationPage
            currentPage={currentPage}
            totalPages={data.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
