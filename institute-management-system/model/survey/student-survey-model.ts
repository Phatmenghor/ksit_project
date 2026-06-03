export interface StudentSurveyModel {
  scheduleId: number;
  courseName: string;
  courseCode: string;
  className: string;
  teacherName: string;
  roomName: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  semester: string;
  academyYear: number;
  totalStudents: number;
  completedSurveys: number;
  pendingSurveys: number;
  completionPercentage: number;
  students: Student[];
}

interface Student {
  id: number;
  username: string;
  email: any;
  status: string;
  khmerFirstName: any;
  khmerLastName: any;
  englishFirstName: any;
  englishLastName: any;
  profileUrl: any;
  gender: any;
  dateOfBirth: any;
  phoneNumber: any;
  identifyNumber: string;
  studentClass: StudentClass;
  createdAt: string;
  surveyStatus: string;
  surveySubmittedAt: string | any;
  surveyResponseId: number | any;
}

interface StudentClass {
  id: number;
  code: string;
  academyYear: number;
  degree: any;
  yearLevel: any;
  status: any;
  major: any;
  createdAt: string;
}
