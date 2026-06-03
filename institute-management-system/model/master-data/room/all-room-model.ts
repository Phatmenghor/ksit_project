export interface AllRoomModel {
  content: RoomModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface RoomModel {
  id: number;
  name: string;
  status: string;
  createdAt?: string;
  updatedAt?: any;
}
