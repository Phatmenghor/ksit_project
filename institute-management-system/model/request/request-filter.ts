export interface RequestFilterModel {
  search?: string;
  status?: string;
  userId?: number;
  pageNo?: number;
  pageSize?: number;
}

export interface HistoryReqFilterModel {
  userId?: number;
  requestId?: number;
  search?: string;
  status?: string;
  startDate?: string; 
  endDate?: string;
  pageNo?: number;
  pageSize?: number;
}

export interface TranscriptReqFilterModel {
  studentId?: number;
}