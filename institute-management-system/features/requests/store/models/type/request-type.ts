import { AllRequestModel, RequestModel, AllHistoryReqModel } from "@/model/request/request-model";
import { TranscriptModel } from "@/model/request/request-transcript";

export interface RequestFilters {
  search: string;
  status: string;
  userId: number | undefined;
  pageNo: number;
}

export interface RequestManagementState {
  data: AllRequestModel | null;
  isLoading: boolean;
  error: string | null;
  filters: RequestFilters;
  isCreating: boolean;
  selectedRequest: RequestModel | null;
  isFetchingDetail: boolean;
  isUpdating: boolean;
  transcript: TranscriptModel | null;
  isFetchingTranscript: boolean;
  history: AllHistoryReqModel | null;
  isFetchingHistory: boolean;
}

export interface MyRequestFilters {
  search: string;
  status: string;
  pageNo: number;
}

export interface MyRequestState {
  data: AllRequestModel | null;
  isLoading: boolean;
  error: string | null;
  filters: MyRequestFilters;
  isCreating: boolean;
}
