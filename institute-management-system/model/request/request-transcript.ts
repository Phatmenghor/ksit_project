export interface TranscriptModel {
  studentId: number;
  studentName: string;
  studentCode: string;
  className: string;
  majorName: string;
  departmentName: string;
  dateOfBirth: any;
  degree: string;
  numberOfCreditsStudied: number;
  numberOfCreditsTransferred: number;
  totalNumberOfCreditsEarned: number;
  cumulativeGradePointAverage: number;
  academicStatus: string;
  semesters: Semester[];
  generatedAt: string;
}

export interface Semester {
  academyYear: number;
  semester: string;
  semesterName: string;
  yearLevel: string;
  totalCredits: number;
  gpa: number;
  gpax: number;
  courses: Course[];
}

export interface Course {
  courseId: number;
  courseCode: string;
  courseName: string;
  courseNameKH: string;
  credit: number;
  theory: number;
  execute: number;
  apply: number;
  totalHour: number;
  scheduleId: number;
  dayOfWeek: string;
  timeSlot: string;
  roomName: string;
  teacherName: string;
  totalScore: number;
  letterGrade: any;
  gradePoints: number;
  status: string;
  attendanceScore: number;
  assignmentScore: number;
  midtermScore: number;
  finalScore: number;
}
