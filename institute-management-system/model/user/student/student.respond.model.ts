export interface StudentBaseModel {
  email?: string;
  khmerFirstName?: string;
  khmerLastName?: string;
  englishFirstName?: string;
  englishLastName?: string;
  gender?: string;
  profileUrl?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  currentAddress?: string;
  nationality?: string;
  ethnicity?: string;
  studentStatus?: string;
  placeOfBirth?: string;
  memberSiblings?: string;
  numberOfSiblings?: string;
  studentStudiesHistory?: StudentStudiesHistory[];
  studentParent?: StudentParent[];
  studentSibling?: StudentSibling[];
  status?: string;
}

interface StudentStudiesHistory {
  id?: number;
  typeStudies?: string;
  schoolName?: string;
  location?: string;
  fromYear?: string;
  endYear?: string;
  obtainedCertificate?: string;
  overallGrade?: string;
}

interface StudentParent {
  id?: number;
  name?: string;
  phone?: string;
  job?: string;
  address?: string;
  age?: string;
  parentType?: string;
}

interface StudentSibling {
  id?: number;
  name?: string;
  gender?: string;
  dateOfBirth?: string;
  occupation?: string;
  phoneNumber?: string;
}

export interface AddStudentModel extends StudentBaseModel {
  classId?: number;
  password: string;
  username: string;
}

export interface EditStudentModel extends StudentBaseModel {}

export interface GenerateMultipleStudent {
  classId: number;
  quantity: number;
  status: string;
}

export interface RequestAllStudentApi {
  status: string;
  message: string;
  data: RequestAllStudent;
}

export interface RequestAllStudent {
  search?: string;
  status?: string;
  classId?: number;
  academicYear?: number;
  pageNo?: number;
  pageSize?: number;
}

export interface AllStudentModel {
  content: StudentModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface StudentModel {
  id: number;
  username: string;
  email: string;
  status: string;
  khmerFirstName: string;
  studentClass: StudentClass;
  khmerLastName: string;
  englishFirstName: string;
  englishLastName: string;
  gender: string;
  dateOfBirth: string;
  phoneNumber: string;
  createdAt: string;
}

interface StudentClass {
  id: number;
  code: string;
  academyYear: number;
  degree: string;
  yearLevel: string;
  status: string;
  major: Major;
  createdAt: string;
}

interface Major {
  id: number;
  code: string;
  name: string;
  status: string;
  department: Department;
  createdAt: string;
}

interface Department {
  id: number;
  code: string;
  name: string;
  urlLogo: string;
  status: string;
  createdAt: string;
}

export interface GetStudentByIdModel {
  status: string;
  message: string;
  data: StudentByIdModel;
}

export interface StudentByIdModel {
  id: number;
  username: string;
  email: string;
  status: string;
  khmerFirstName: string;
  khmerLastName: string;
  englishFirstName: string;
  englishLastName: string;
  gender: string;
  profileUrl: string;
  identifyNumber: string;
  dateOfBirth: string;
  phoneNumber: string;
  currentAddress: string;
  nationality: string;
  ethnicity: string;
  placeOfBirth: string;
  studentStatus: string;
  memberSiblings: string;
  numberOfSiblings: string;
  studentClass: StudentClass;
  studentStudiesHistory: StudentStudiesHistory[];
  studentParent: StudentParent[];
  studentSibling: StudentSibling[];
  createdAt: string;
}

export interface StudentResponse {
  id: number;
  username: string;
  identifyNumber: string;
  password: string;
  classCode: string;
  createdAt: string;
}
