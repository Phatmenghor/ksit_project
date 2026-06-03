export interface AllRequestModel {
  content: RequestModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface RequestModel {
  id: number;
  title: string;
  status: string; // e.g., "PENDING"
  requestComment: string;
  staffComment: string;
  user: RequestUser;
  createdAt: string;
  updatedAt: string;
}

interface RequestUser {
  id: number;
  username: string;
  khmerFirstName: string;
  khmerLastName: string;
  englishFirstName: string;
  englishLastName: string;
  profileUrl: string;
  gender: string;
  dateOfBirth: string;
  currentAddress: string;
  email: string;
  phoneNumber: string;
  identifyNumber: string;
  degree: string;
  majorName: string;
  departmentName: string;
  userClass: RequestStudentClass;
  roles: string[];
  isStudent: boolean;
  createdAt: string;
}

interface RequestStudentClass {
  id: number;
  code: string;
  createdAt: string;
}

export interface CreateRequestModel {
  title?: string;
  requestComment?: string;
}

export interface UpdateRequestModel {
  title?: string;
  requestComment?: string;
  status?: string;
  staffComment?: string;
}

// History
export interface AllHistoryReqModel {
  content: RequestHistoryModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface RequestHistoryModel {
  id: number;
  title: string;
  fromStatus: string;
  toStatus: string;
  requestComment: string;
  staffComment: string;
  comment: string;
  actionBy: string;
  requestCreatedAt: string;
  requestId: number;
  actionUser: HistoryUser;
  requestOwner: HistoryUser;
  createdAt: string;
}

export interface HistoryUser {
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
  userClass: HistoryUserClass;
  createdAt: string;
}

export interface HistoryUserClass {
  id: number;
  code: string;
  createdAt: string;
}