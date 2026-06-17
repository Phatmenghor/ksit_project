"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";
import { ROUTE } from "@/constants/routes";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
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
import { useDebounce } from "@/utils/debounce/debounce";
import { usePagination } from "@/hooks/use-pagination";
import { DateTimeFormatter } from "@/utils/date/date-time-format";
import { CollapsibleFilterPanel } from "@/components/shared/filter";
import { DataTable, TableColumn } from "@/components/shared/data-table";

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

  const { currentPage, updateUrlWithPage, handlePageChange } =
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
  }, [loadRooms]);

  const handleOpenAddModal = () => {
    setModalMode("add");
    setInitialData(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (roomData: RoomModel) => {
    const formData: RoomFormData = {
      id: roomData.id,
      name: roomData.name,
      status: roomData.status,
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

              const updatedContent = prevData.content.map((r) =>
                r.id === formData.id && response ? response : r
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

  const columns: TableColumn<RoomModel>[] = [
    {
      key: "no",
      label: "#",
      width: "50px",
      render: (_, index) => {
        const page = currentPage ?? 1;
        return (page - 1) * 30 + index + 1;
      },
    },
    {
      key: "name",
      label: "Name",
      render: (r) => r?.name,
    },
    {
      key: "createdAt",
      label: "Created At",
      render: (r) => DateTimeFormatter(r.createdAt),
    },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex justify-start space-x-2">
          <Button
            onClick={() => handleOpenEditModal(r)}
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-gray-200 hover:bg-gray-300"
            disabled={isSubmitting}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => {
              setRoom(r);
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
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-none bg-transparent p-0">
        <CardContent className="p-0 space-y-2">
          <PageBreadcrumb items={[{ label: "Manage Room" }]} />
        </CardContent>
      </Card>

      <CollapsibleFilterPanel
        config={{
          title: "Manage Rooms",
          totalCount: allRoomData?.totalElements,
          searchValue: searchQuery,
          searchPlaceholder: "Search room...",
          onSearchChange: handleSearchChange,
          buttonText: "Add New",
          onButtonClick: handleOpenAddModal,
          filters: [],
          onClearAll: () => {
            setSearchQuery("");
          },
        }}
        essentialFilterIds={[]}
      />

      <DataTable
        data={allRoomData?.content ?? null}
        columns={columns}
        loading={isLoading}
        currentPage={currentPage}
        totalPages={allRoomData?.totalPages ?? 0}
        totalElements={allRoomData?.totalElements}
        onPageChange={handlePageChange}
        emptyMessage="No rooms found"
        getRowKey={(r) => r.id}
      />

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
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
