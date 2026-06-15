"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ROUTE } from "@/constants/routes";
import { useCallback, useEffect, useState } from "react";
import {
  AllRoomModel,
  RoomModel,
} from "@/model/master-data/room/all-room-model";
import { AllRoomFilterModel } from "@/model/master-data/room/type-room-model";
import {
  createRoomService,
  deletedRoomService,
  getAllRoomService,
  updateRoomService,
} from "@/service/master-data/room.service";
import { Constants } from "@/constants/text-string";
import { toast } from "sonner";
import {
  RoomFormData,
  RoomModal,
} from "@/components/dashboard/master-data/manage-room/room-form-model";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { roomTableHeader } from "@/constants/table/master-data";
import PaginationPage from "@/components/shared/pagination-page";
import Loading from "@/components/shared/loading";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDebounce } from "@/utils/debounce/debounce";
import { useSearchParams } from "next/navigation";
import { usePagination } from "@/hooks/use-pagination";

export default function ManageRoomPage() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [room, setRoom] = useState<RoomModel | null>(null);
  const [allRoomData, setAllRoomData] = useState<AllRoomModel | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [initialData, setInitialData] = useState<RoomFormData | undefined>(
    undefined
  );

  const searchParams = useSearchParams();

  const { currentPage, updateUrlWithPage, handlePageChange, getDisplayIndex } =
    usePagination({
      baseRoute: ROUTE.MASTER_DATA.MANAGE_ROOM,
      defaultPageSize: 10,
    });

  const searchDebounceQuery = useDebounce(searchQuery, 500);

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

  const loadRooms = useCallback(
    async (param: AllRoomFilterModel) => {
      setIsLoading(true);

      try {
        const response = await getAllRoomService({
          search: searchDebounceQuery,
          status: Constants.ACTIVE,
          pageNo: currentPage,
          pageSize: 30,
          ...param,
        });

        if (response) {
          setAllRoomData(response);
          if (response.totalPages > 0 && currentPage > response.totalPages) {
            updateUrlWithPage(response.totalPages);
            return;
          }
        } else {
        }
      } catch (error) {
        toast.error("An error occurred while loading rooms");
      } finally {
        setIsLoading(false);
      }
    },
    [searchDebounceQuery, currentPage]
  );

  useEffect(() => {
    loadRooms({});
  }, [searchDebounceQuery, currentPage]);

  const handleOpenAddModal = () => {
    setModalMode("add");
    setInitialData(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (room: RoomModel) => {
    const formData: RoomFormData = {
      id: room.id,
      name: room.name,
      status: room.status,
    };

    setModalMode("edit");
    setInitialData(formData);
    setIsModalOpen(true);
  };

  async function handleSubmit(formData: RoomFormData) {
    setIsSubmitting(true);

    try {
      const roomData = {
        name: formData.name.trim(),
        status: formData.status,
      };

      let response: RoomModel | null = null;

      if (modalMode === "add") {
        try {
          response = await createRoomService(roomData);

          if (response) {
            setAllRoomData((prevData) => {
              if (!prevData) return null;

              const updatedContent = response
                ? [response, ...prevData.content]
                : [...prevData.content];

              return {
                ...prevData,
                content: updatedContent,
                totalElements: prevData.totalElements + 1,
              } as AllRoomModel;
            });

            toast.success("Room added successfully");
            setIsModalOpen(false);
          }
        } catch (error: any) {
          toast.error(error.message || "Failed to add room");
        }
      } else if (modalMode === "edit" && formData.id) {
        try {
          response = await updateRoomService(formData.id, roomData);

          if (response) {
            setAllRoomData((prevData) => {
              if (!prevData) return null;

              const updatedContent = prevData.content.map((dept) =>
                dept.id === formData.id && response ? response : dept
              );

              return {
                ...prevData,
                content: updatedContent,
              } as AllRoomModel;
            });

            toast.success("Room updated successfully");
            setIsModalOpen(false);
          }
        } catch (error: any) {
          toast.error(error.message || "Failed to update room");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteRoom() {
    if (!room) return;
    setIsSubmitting(true);

    try {
      const response = await deletedRoomService(room.id);

      if (response) {
        setAllRoomData((prevData) => {
          if (!prevData) return null;

          const updatedContent = prevData.content.filter(
            (item) => item.id !== room.id
          );

          return {
            ...prevData,
            content: updatedContent,
            totalElements: prevData.totalElements - 1,
          };
        });

        toast.success("Room deleted successfully");
        if (
          allRoomData &&
          allRoomData.content.length === 1 &&
          currentPage > 1
        ) {
          updateUrlWithPage(currentPage - 1);
        } else {
          await loadRooms({});
        }
      } else {
        toast.error("Failed to delete Room");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the Room");
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
    }
  }

  return (
    <div>
      <Card>
        <CardContent className="p-6 space-y-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={ROUTE.DASHBOARD}>
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Manage room</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <h3 className="text-xl font-bold">Manage Room</h3>
          <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search room..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <Button
              onClick={handleOpenAddModal}
              className="bg-teal-900 text-white hover:bg-teal-950"
            >
              <Plus className="mr-2 h-2 w-2" />
              Add New
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className={`overflow-x-auto mt-4 ${useIsMobile() ? "pl-4" : ""}`}>
        {isLoading ? (
          <Loading />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {roomTableHeader.map((header, index) => (
                  <TableHead key={index} className={header.className}>
                    {header.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {allRoomData?.content.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No Room found
                  </TableCell>
                </TableRow>
              ) : (
                allRoomData?.content.map((room, index) => {
                  return (
                    <TableRow key={room.id}>
                      <TableCell>{getDisplayIndex(index)}</TableCell>
                      <TableCell>{room?.name}</TableCell>

                      <TableCell>
                        <div className="flex justify-start space-x-2">
                          <Button
                            onClick={() => handleOpenEditModal(room)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-gray-200 hover:bg-gray-300"
                            disabled={isSubmitting}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => {
                              setRoom(room);
                              setIsDeleteDialogOpen(true);
                            }}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-red-500 text-white hover:bg-red-600"
                            disabled={isSubmitting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

      {/* Pagination */}
      {!isLoading && allRoomData && (
        <div className="mt-4 flex justify-end">
          <PaginationPage
            currentPage={currentPage}
            totalPages={allRoomData.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Room Edit/Add Modal */}
      <RoomModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialData={initialData}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={handleDeleteRoom}
        title="Delete Room"
        description="Are you sure you want to delete the room:"
        itemName={room?.name}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
