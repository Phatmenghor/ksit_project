import { AllStudentScoreModel } from "@/model/score/student-score/student-score.response";

export interface SubmittedScoreFilters {
  search: string;
  classId: number | undefined;
  scheduleId: number | undefined;
  academicYear: number;
  semester: string;
  status: string;
  pageNo: number;
}

export interface SubmittedScoreState {
  data: AllStudentScoreModel | null;
  isLoading: boolean;
  error: string | null;
  filters: SubmittedScoreFilters;
}
