"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";
import { ROUTE } from "@/constants/routes";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { RoomModel } from "@/model/master-data/room/all-room-model";
import {
  RoomFormData,
  RoomModal,
} from "@/components/dashboard/master-data/manage-room/room-form-model";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { usePagination } from "@/hooks/use-pagination";
import { DateTimeFormatter } from "@/utils/date/date-time-format";
import { CollapsibleFilterPanel } from "@/components/shared/filter";
import { DataTable, TableColumn } from "@/components/shared/data-table";
import { toast } from "sonner";
import { Constants } from "@/constants/text-string";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectRoomData,
  selectRoomIsLoading,
  selectRoomOperations,
  selectRoomFilters,
} from "@/features/master-data/store/selectors/room-selectors";
import {
  setSearchFilter,
  setPageNo,
  resetState,
} from "@/features/master-data/store/slice/room-slice";
import {
  fetchAllRoomService,
  createRoomService,
  updateRoomService,
  deleteRoomService,
} from "@/features/master-data/store/thunks/room-thunks";
import { useDebounce } from "@/utils/debounce/debounce";

export default function ManageRoomPage() {
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectRoomData);
  const isLoading = useAppSelector(selectRoomIsLoading);
  const operations = useAppSelector(selectRoomOperations);
  const filters = useAppSelector(selectRoomFilters);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingRoom, setDeletingRoom] = useState<RoomModel | null>(null);
  const [initialData, setInitialData] = useState<RoomFormData | undefined>(undefined);

  const { currentPage, updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTE.MASTER_DATA.MANAGE_ROOM,
    defaultPageSize: 10,
  });

  const searchDebounce = useDebounce(filters.search, 500);

  useEffect(() => {
    dispatch(
      fetchAllRoomService({
        search: searchDebounce,
        status: Constants.ACTIVE,
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

  const handleOpenAddModal = () => {
    setModalMode("add");
    setInitialData(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (room: RoomModel) => {
    setInitialData({ id: room.id, name: room.name, status: room.status });
    setModalMode("edit");
    setIsModalOpen(true);
  };

  async function handleSubmit(formData: RoomFormData) {
    const payload = { name: formData.name, status: formData.status };

    if (modalMode === "add") {
      const result = await dispatch(createRoomService(payload));
      if (createRoomService.fulfilled.match(result)) {
        toast.success("Room added successfully");
        setIsModalOpen(false);
      } else {
        toast.error((result.payload as string) || "Failed to add room");
      }
    } else if (modalMode === "edit" && formData.id) {
      const result = await dispatch(updateRoomService({ id: formData.id, data: payload }));
      if (updateRoomService.fulfilled.match(result)) {
        toast.success("Room updated successfully");
        setIsModalOpen(false);
      } else {
        toast.error((result.payload as string) || "Failed to update room");
      }
    }
  }

  async function handleDeleteRoom() {
    if (!deletingRoom) return;
    const result = await dispatch(deleteRoomService(deletingRoom.id));
    if (deleteRoomService.fulfilled.match(result)) {
      toast.success("Room deleted successfully");
      if (data && data.content.length === 1 && currentPage > 1) {
        updateUrlWithPage(currentPage - 1);
      }
    } else {
      toast.error("Failed to delete room");
    }
    setIsDeleteDialogOpen(false);
    setDeletingRoom(null);
  }

  const columns: TableColumn<RoomModel>[] = [
    {
      key: "no",
      label: "#",
      width: "50px",
      render: (_, index) => (currentPage - 1) * 30 + index + 1,
    },
    { key: "name", label: "Name", render: (r) => r.name },
    { key: "createdAt", label: "Created At", render: (r) => DateTimeFormatter(r.createdAt) },
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
            disabled={operations.isDeleting}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => { setDeletingRoom(r); setIsDeleteDialogOpen(true); }}
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-red-500 text-white hover:bg-red-600"
            disabled={operations.isDeleting}
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
          totalCount: data?.totalElements,
          searchValue: filters.search,
          searchPlaceholder: "Search room...",
          onSearchChange: handleSearchChange,
          buttonText: "Add New",
          onButtonClick: handleOpenAddModal,
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
        emptyMessage="No rooms found"
        getRowKey={(r) => r.id}
      />

      <RoomModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialData={initialData}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={operations.isCreating || operations.isUpdating}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => { setIsDeleteDialogOpen(false); setDeletingRoom(null); }}
        onDelete={handleDeleteRoom}
        title="Delete Room"
        description="Are you sure you want to delete the room:"
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}
