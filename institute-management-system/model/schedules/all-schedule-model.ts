import { YearLevelEnum } from "@/constants/constant";
import { ClassModel } from "../master-data/class/all-class-model";
import { CourseModel } from "../master-data/course/all-course-model";
import { RoomModel } from "../master-data/room/all-room-model";
import { SemesterModel } from "../master-data/semester/semester-model";

export interface AllScheduleodel {
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
  yearLevel: any;
  day: string;
  status: string;
  classes: Classes;
  teacher: Teacher;
  course: Course;
  room: Room;
  semester: Semester;
  surveyStatus: string;
  surveySubmittedAt: any;
  surveyResponseId: any;
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
  department: any;
  createdAt: string;
}

export interface Teacher {
  id: number;
  username: string;
  staffId: string;
  khmerFirstName: string;
  khmerLastName: string;
  englishFirstName: string;
  englishLastName: string;
  profileUrl: string;
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
  status: string;
  department: Department;
  subject: Subject;
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
