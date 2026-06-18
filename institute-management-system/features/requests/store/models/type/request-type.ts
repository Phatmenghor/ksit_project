import { AllRequestModel } from "@/model/request/request-model";

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
}
