export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface PaginationResponse<T> {
  content: T[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
