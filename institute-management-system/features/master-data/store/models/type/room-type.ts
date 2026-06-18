import { AllRoomModel, RoomModel } from "@/model/master-data/room/all-room-model";

export interface RoomFilters {
  search: string;
  pageNo: number;
}

export interface RoomOperations {
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isFetchingDetail: boolean;
}

export interface RoomManagementState {
  data: AllRoomModel | null;
  rollbackSnapshot: AllRoomModel | null;
  selectedRoom: RoomModel | null;
  isLoading: boolean;
  error: string | null;
  filters: RoomFilters;
  operations: RoomOperations;
}
