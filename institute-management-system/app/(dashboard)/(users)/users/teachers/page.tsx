"use client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { CardHeaderSection } from "@/components/shared/layout/card-header-section";
import { ROUTE } from "@/constants/routes";
import {
  deletedStaffService,
  getAllStaffService,
} from "@/service/user/user.service";
import { RoleEnum, StatusEnum } from "@/constants/constant";
import PaginationPage from "@/components/shared/pagination-page";
import ChangePasswordModal from "@/components/dashboard/users/shared/change-password-modal";
import { StaffTableHeader, TeacherTableHeader } from "@/constants/table/user";
import {
  AllStaffModel,
  StaffModel,
} from "@/model/user/staff/staff.respond.model";
import { useDebounce } from "@/utils/debounce/debounce";
import { StaffListRequest } from "@/model/user/staff/staff.request.model";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import Loading from "@/components/shared/loading";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePagination } from "@/hooks/use-pagination";

export default function TeachersListPage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [allTeachersData, setAllTeachersData] = useState<AllStaffModel | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] =
    useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<StaffModel | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const router = useRouter();
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const searchParams = useSearchParams();

  const { currentPage, updateUrlWithPage, handlePageChange, getDisplayIndex } =
    usePagination({
      baseRoute: ROUTE.USERS.TEACHERS,
      defaultPageSize: 10,
    });

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

  const loadTeachers = useCallback(
    async (param: StaffListRequest) => {
      setIsLoading(true);
      try {
        const response = await getAllStaffService({
          roles: [RoleEnum.TEACHER],
          search: searchQuery,
          status: StatusEnum.ACTIVE,
          pageNo: currentPage,
          pageSize: 30,
          ...param,
        });

        if (response) {
          setAllTeachersData(response);
          // Handle case where current page exceeds total pages
          if (response.totalPages > 0 && currentPage > response.totalPages) {
            updateUrlWithPage(response.totalPages);
            return;
          }
        } else {
        }
      } catch (error) {
        toast.error("An error occurred while loading teachers");
      } finally {
        setIsLoading(false);
      }
    },
    [debouncedSearchQuery, currentPage]
  );

  useEffect(() => {
    loadTeachers({});
  }, [debouncedSearchQuery, currentPage]);

  async function handleDeleteTeacher() {
    if (!selectedTeacher) return;

    setIsSubmitting(true);
    try {
      const originalData = allTeachersData;
      setAllTeachersData((prevData) => {
        if (!prevData) return null;
        const updatedContent = prevData.content.filter(
          (item) => item.id !== selectedTeacher.id
        );
        return {
          ...prevData,
          content: updatedContent,
          totalElements: prevData.totalElements - 1,
        };
      });

      const response = await deletedStaffService(selectedTeacher.id);

      if (response) {
        toast.success(
          `Teacher ${selectedTeacher.username ?? ""} deleted successfully`
        );
        if (
          allTeachersData &&
          allTeachersData.content.length === 1 &&
          currentPage > 1
        ) {
          updateUrlWithPage(currentPage - 1);
        } else {
          await loadTeachers({});
        }
      } else {
        setAllTeachersData(originalData);
        toast.error("Failed to delete teacher");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the teacher");
      loadTeachers({});
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
          { label: "Teacher List", href: "" },
        ]}
        searchValue={searchQuery}
        searchPlaceholder="Search..."
        onSearchChange={handleSearchChange}
        buttonText="Add New"
        buttonHref={ROUTE.USERS.ADD_TEACHER}
        buttonIcon={<Plus className="mr-2 h-2 w-2" />}
      />

      <div className={`overflow-x-auto mt-4 ${useIsMobile() ? "pl-4" : ""}`}>
        {isLoading ? (
          <Loading />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {TeacherTableHeader.map((header, index) => (
                  <TableHead key={index} className={header.className}>
                    {header.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {allTeachersData?.content.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={TeacherTableHeader.length}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No teacher found
                  </TableCell>
                </TableRow>
              ) : (
                allTeachersData?.content.map((teacher, index) => {
                  return (
                    <TableRow key={teacher.id}>
                      <TableCell>{getDisplayIndex(index)}</TableCell>
                      <TableCell>{teacher.username.trim() || "---"}</TableCell>
                      <TableCell>
                        {`${teacher.khmerFirstName || ""} ${
                          teacher.khmerLastName || ""
                        }`.trim() || "---"}
                      </TableCell>
                      <TableCell>
                        {`${teacher.englishFirstName ?? ""}
                        ${teacher.englishLastName ?? ""}`.trim() || "---"}
                      </TableCell>
                      <TableCell>{teacher.identifyNumber || "---"}</TableCell>
                      <TableCell>{teacher.gender || "---"}</TableCell>
                      <TableCell>{teacher.dateOfBirth || "---"}</TableCell>
                      <TableCell>
                        {teacher.phoneNumber?.trim() || "---"}
                      </TableCell>
                      <TableCell>
                        {teacher.department?.name?.trim() || "---"}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-start space-x-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => {
                                    router.push(
                                      `${ROUTE.USERS.VIEW_TEACHER(
                                        String(teacher.id)
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
                              <TooltipContent>teacher Detail</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() =>
                                    router.push(
                                      ROUTE.USERS.EDIT_TEACHER(
                                        String(teacher.id)
                                      )
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
                                    setSelectedTeacher(teacher);
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
                                    setSelectedTeacher(teacher);
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
          setSelectedTeacher(null);
          setIsChangePasswordDialogOpen(false);
        }}
        userId={selectedTeacher?.id}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedTeacher(null);
        }}
        onDelete={handleDeleteTeacher}
        title="Disable Staff"
        description={`Are you sure you want to disable the staff: ${selectedTeacher?.username}?`}
        itemName={selectedTeacher?.username}
        isSubmitting={isSubmitting}
      />

      {!isLoading && allTeachersData && (
        <div className="mt-4 flex justify-end">
          <PaginationPage
            currentPage={currentPage}
            totalPages={allTeachersData.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
