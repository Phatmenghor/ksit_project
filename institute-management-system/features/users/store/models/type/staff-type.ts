import {
  AllStaffModel,
  StaffModel,
} from "@/model/user/staff/staff.respond.model";

export interface StaffFilters {
  search: string;
  pageNo: number;
  status: string;
  roles: string[];
}

export interface StaffOperations {
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isFetchingDetail: boolean;
  isResettingPassword: boolean;
}

export interface StaffManagementState {
  data: AllStaffModel | null;
  rollbackSnapshot: AllStaffModel | null;
  selectedStaff: StaffModel | null;
  isLoading: boolean;
  error: string | null;
  filters: StaffFilters;
  operations: StaffOperations;
}
