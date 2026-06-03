// request
export interface SurveyReportHeadersRequest {
  hiddenHeaders?: string[];
}

export interface AllSurveyFilterModel {
  search?: string;
  userId?: number;
  scheduleId?: number;
  courseId?: number;
  classId?: number;
  teacherId?: number;
  departmentId?: number;
  majorId?: number;
  semester?: string;
  academyYear?: number;
  startDate?: string;
  endDate?: string;
  pageNo?: number;
  pageSize?: number;
}

// response
export interface SurveyReportHeader {
  key: string;
  label: string;
  type: string;
  category: string;
  questionId: number;
  displayOrder: number;
}

export interface SurveyResponseData {
  content: SurveyResponseItem[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface SurveyResponseItem {
  responseId: number;
  studentId: number;
  identifyNumber: string;
  studentNameEnglish: string;
  studentNameKhmer: string;
  studentEmail: string;
  studentPhone: string;
  className: string;
  majorName: string;
  departmentName: string;
  scheduleId: number;
  courseCode: string;
  courseName: string;
  teacherName: string;
  roomName: string;
  dayOfWeek: string;
  timeSlot: string;
  semester: string;
  academyYear: number;
  surveyTitle: string;
  submittedAt: string;
  overallComment: string;
  createdAt: string;
  Q1_Answer: number | null;
  Q2_Answer: number | null;
  Q3_Answer: number | null;
  Q4_Answer: number | null;
  Q5_Answer: number | null;
  Q6_Answer: number | null;
  Q7_Answer: number | null;
  Q8_Answer: number | null;
  Q9_Answer: number | null;
  Q10_Answer: string | null;
  Q11_Answer: string | null;
  Q12_Answer: string | null;
  Q13_Answer: string | null;
  Q14_Answer: string | null;
  Q16_Answer: string | null;
}
