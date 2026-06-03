import { StudentScoreModel } from "../student-score/student-score.response";

export interface AllScoreSubmittedAPI {
  status: string;
  message: string;
  data: AllScoreSubmittedModel;
}

export interface AllScoreSubmittedModel {
  content: ScoreSubmittedModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ScoreSubmittedModel {
  id: number;
  scheduleId: number;
  classCode: string;
  courseName: string;
  teacherId: number;
  teacherName: string;
  status: string;
  teacherComments: string;
  staffComments: string;
  submissionDate: string;
  createdAt: string;
  updatedAt: string;
  semester: Semester;
  studentScores: StudentScoreModel[];
}

interface Semester {
  id: number;
  semester: string;
  startDate: string;
  endDate: string;
  academyYear: number;
  semesterType: string;
  status: string;
  createdAt: string;
}

export interface ScoreConfigurationModel {
  id: number
  attendancePercentage: number
  assignmentPercentage: number
  midtermPercentage: number
  finalPercentage: number
  totalPercentage: number
  status: string
  createdAt: string
}
