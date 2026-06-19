import { AllScheduleModel } from "@/model/attendance/schedule/schedule-model";

export interface ScheduleFilters {
  search: string;
  dayOfWeek: string;
  semester: string;
  academicYear: number;
  courseId: number | undefined;
  classId: number | undefined;
  pageNo: number;
}

export interface ScheduleManagementState {
  data: AllScheduleModel | null;
  isLoading: boolean;
  error: string | null;
  filters: ScheduleFilters;
  selectedSchedule: any | null;
  operations: {
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
  };
}
