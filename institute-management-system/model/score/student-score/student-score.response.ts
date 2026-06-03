export interface AllStudentScoreModel {
  content: SubmissionScoreModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface SubmissionScoreModel {
  id: number;
  scheduleId: number;
  teacherId: number;
  teacherName: string;
  classId: number;
  classCode: string;
  courseId: number;
  courseName: string;
  semester: string;
  status: string;
  submissionDate: string;
  teacherComments: string;
  staffComments: string;
  studentScores: StudentScoreModel[];
  createdAt: string;
}

export interface StudentScoreModel {
  id: number;
  studentNameKhmer: string;
  studentNameEnglish: string;
  studentIdentityNumber: string;
  gender: string;
  studentId: number;
  dateOfBirth: string;
  attendanceScore: number;
  assignmentScore: number;
  midtermScore: number;
  finalScore: number;
  totalScore: number;
  grade: string;
  comments: string;
  createdAt: string;
}
