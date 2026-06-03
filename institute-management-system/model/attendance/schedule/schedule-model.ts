export interface AllScheduleModel {
  content: ScheduleModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ScheduleModel {
  id: number;
  startTime: string;
  endTime: string;
  academyYear: number;
  day: string;
  status: string;
  classes: Classes;
  teacher: Teacher;
  course: Course;
  room: Room;
  semester: Semester;
  surveyStatus: string;
  surveySubmittedAt: string;
  surveyResponseId: number;
  hasSurvey: boolean;
  createdAt: string;
}

export interface Classes {
  id: number;
  code: string;
  academyYear: number;
  degree: string;
  yearLevel: string;
  status: string;
  major: Major;
  createdAt: string;
}

export interface Major {
  id: number;
  code: string;
  name: string;
  status: string;
  department: Department;
  createdAt: string;
}

export interface Department {
  id: number;
  code: string;
  name: string;
  urlLogo: string;
  status: string;
  createdAt: string;
}

export interface Teacher {
  id: number;
  username: string;
  email: string;
  roles: string[];
  status: string;
  department: Department2;
  khmerFirstName: string;
  profileUrl: string;
  khmerLastName: string;
  englishFirstName: string;
  englishLastName: string;
  gender: string;
  dateOfBirth: string;
  phoneNumber: string;
  identifyNumber: string;
  staffId: string;
  createdAt: string;
}

export interface Department2 {
  id: number;
  code: string;
  name: string;
  urlLogo: string;
  status: string;
  createdAt: string;
}

export interface Course {
  id: number;
  code: string;
  nameKH: string;
  nameEn: string;
  credit: number;
  theory: number;
  execute: number;
  apply: number;
  totalHour: number;
  description: string;
  purpose: string;
  expectedOutcome: string;
  status: string;
  department: Department3;
  subject: Subject;
  createdAt: string;
}

export interface Department3 {
  id: number;
  code: string;
  name: string;
  urlLogo: string;
  status: string;
  createdAt: string;
}

export interface Subject {
  id: number;
  name: string;
  status: string;
  createdAt: string;
}

export interface Room {
  id: number;
  name: string;
  status: string;
  createdAt: string;
}

export interface Semester {
  id: number;
  semester: string;
  startDate: string;
  endDate: string;
  academyYear: number;
  semesterType: string;
  status: string;
  createdAt: string;
}

export interface DuplicateScheduleResponse {
  status: string;
  message: string;
  data: {
    sourceClassId: number;
    sourceClassName: string;
    sourceSemesterId: number;
    sourceSemesterName: string;
    sourceSemesterYear: number;
    targetClassId: number;
    targetClassName: string;
    targetSemesterId: number;
    targetSemesterName: string;
    targetSemesterYear: number;
    totalSourceSchedules: number;
    successfullyDuplicated: number;
    skipped: number;
    failed: number;
    duplicatedSchedules: any[];
    errors: string[];
    message: string;
  };
}
