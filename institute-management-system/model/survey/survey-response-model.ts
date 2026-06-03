export interface SurveyResponseModel {
  id: number;
  surveyId: number;
  surveyTitle: string;
  surveyDescription: string;
  user: User;
  submittedAt: string;
  isCompleted: boolean;
  scheduleId: number;
  courseName: string;
  courseCode: string;
  credit: number;
  theory: number;
  execute: number;
  apply: number;
  totalHour: number;
  courseDescription: string;
  teacherId: number;
  teacherName: string;
  teacherEmail: string;
  dayOfWeek: string;
  startTime: StartTime;
  endTime: EndTime;
  timeSlot: string;
  roomName: string;
  className: string;
  semesterName: string;
  academyYear: number;
  semesterDisplay: string;
  sections: Section[];
  createdAt: string;
}

export interface User {
  id: number;
  username: string;
  khmerFirstName: string;
  khmerLastName: string;
  englishFirstName: string;
  englishLastName: string;
  email: string;
  phoneNumber: string;
  identifyNumber: string;
  degree: string;
  dateOfBirth: string;
  gender: string;
  currentAddress: string;
  profileUrl: string;
  majorName: string;
  departmentName: string;
  userClass: UserClass;
  roles: string[];
  isStudent: boolean;
  createdAt: string;
}

export interface UserClass {
  id: number;
  code: string;
  createdAt: string;
}

export interface StartTime {
  hour: number;
  minute: number;
  second: number;
  nano: number;
}

export interface EndTime {
  hour: number;
  minute: number;
  second: number;
  nano: number;
}

export interface Section {
  sectionId: number;
  title: string;
  description: string;
  displayOrder: number;
  questions: Question[];
}

export interface Question {
  questionId: number;
  questionText: string;
  questionType: string;
  required: boolean;
  displayOrder: number;
  minRating: number;
  maxRating: number;
  leftLabel: string;
  rightLabel: string;
  ratingOptions: RatingOption[];
  textAnswer: string;
  ratingAnswer: number;
  answerId: number;
}

export interface RatingOption {
  value: number;
  label: string;
}
