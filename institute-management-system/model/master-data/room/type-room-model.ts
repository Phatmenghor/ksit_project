export interface AllRoomFilterModel {
  search?: string;
  status?: string;
  pageNo?: number;
  pageSize?: number;
}

export interface CreateRoomModel {
  name?: string;
  status?: string;
}

export interface UpdateRoomModel {
  name?: string;
  status?: string;
}
