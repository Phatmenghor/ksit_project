export interface StaffListRequest {
  search?: string;
  status?: string;
  roles?: string[];
  departmentId?: number;
  pageNo?: number;
  pageSize?: number;
}

interface BaseStaffModel {
  email?: string;
  roles?: string[];
  khmerFirstName?: string;
  khmerLastName?: string;
  identifyNumber?: string;
  englishFirstName?: string;
  englishLastName?: string;
  gender?: string;
  departmentId?: number;
  dateOfBirth?: string;
  phoneNumber?: string;
  currentAddress?: string;
  nationality?: string;
  ethnicity?: string;
  placeOfBirth?: string;
  profileUrl?: string;
  taughtEnglish?: string;
  threeLevelClass?: string;
  referenceNote?: string;
  technicalTeamLeader?: string;
  assistInTeaching?: string;
  serialNumber?: string;
  twoLevelClass?: string;
  classResponsibility?: string;
  lastSalaryIncrementDate?: string;
  teachAcrossSchools?: string;
  overtimeHours?: string;
  issuedDate?: string;
  suitableClass?: string;
  bilingual?: string;
  academicYearTaught?: string;
  workHistory?: string;
  staffId?: string;
  nationalId?: string;
  startWorkDate?: string;
  currentPositionDate?: string;
  employeeWork?: string;
  disability?: string;
  payrollAccountNumber?: string;
  cppMembershipNumber?: string;
  province?: string;
  district?: string;
  commune?: string;
  village?: string;
  officeName?: string;
  currentPosition?: string;
  decreeFinal?: string;
  rankAndClass?: string;
  maritalStatus?: string;
  mustBe?: string;
  affiliatedProfession?: string;
  federationName?: string;
  affiliatedOrganization?: string;
  federationEstablishmentDate?: string;
  wivesSalary?: string;
  teachersProfessionalRank?: TeachersProfessionalRank[];
  teacherExperience?: TeacherExperience[];
  teacherPraiseOrCriticism?: TeacherPraiseOrCriticism[];
  teacherEducation?: TeacherEducation[];
  teacherVocational?: TeacherVocational[];
  teacherShortCourse?: TeacherShortCourse[];
  teacherLanguage?: TeacherLanguage[];
  teacherFamily?: TeacherFamily[];
  status?: string;
}

export interface TeachersProfessionalRank {
  id?: number;
  typeOfProfessionalRank?: string;
  description?: string;
  announcementNumber?: string;
  dateAccepted?: string;
}

export interface TeacherExperience {
  id?: number;
  continuousEmployment?: string;
  workPlace?: string;
  startDate?: string;
  endDate?: string;
}

export interface TeacherPraiseOrCriticism {
  id?: number;
  typePraiseOrCriticism?: string;
  giveBy?: string;
  dateAccepted?: string;
}

export interface TeacherEducation {
  id?: number;
  culturalLevel?: string;
  skillName?: string;
  dateAccepted?: string;
  country?: string;
}

export interface TeacherVocational {
  id?: number;
  culturalLevel?: string;
  skillOne?: string;
  skillTwo?: string;
  trainingSystem?: string;
  dateAccepted?: string;
}

export interface TeacherShortCourse {
  id?: number;
  skill?: string;
  skillName?: string;
  startDate?: string;
  endDate?: string;
  duration?: string;
  preparedBy?: string;
  supportBy?: string;
}

export interface TeacherLanguage {
  id?: number;
  language?: string;
  reading?: string;
  writing?: string;
  speaking?: string;
}

export interface TeacherFamily {
  id?: number;
  nameChild?: string;
  gender?: string;
  dateOfBirth?: string;
  working?: string;
}

export interface AddStaffModel extends BaseStaffModel {
  password: string;
  username: string;
}

export interface EditStaffModel extends BaseStaffModel {}

export interface ChangePasswordByAdminModel {
  id: number;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ChangePasswordModel {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export const initialStaffValues: AddStaffModel = {
  email: "",
  roles: [""],
  khmerFirstName: "",
  khmerLastName: "",
  englishFirstName: "",
  englishLastName: "",
  gender: "",
  dateOfBirth: "",
  phoneNumber: "",
  currentAddress: "",
  nationality: "",
  ethnicity: "",
  placeOfBirth: "",
  profileUrl: "",
  taughtEnglish: "",
  threeLevelClass: "",
  referenceNote: "",
  technicalTeamLeader: "",
  assistInTeaching: "",
  serialNumber: "",
  twoLevelClass: "",
  classResponsibility: "",
  lastSalaryIncrementDate: "",
  teachAcrossSchools: "",
  overtimeHours: "",
  issuedDate: "",
  suitableClass: "",
  bilingual: "",
  academicYearTaught: "",
  workHistory: "",
  staffId: "",
  nationalId: "",
  startWorkDate: "",
  currentPositionDate: "",
  employeeWork: "",
  disability: "",
  payrollAccountNumber: "",
  cppMembershipNumber: "",
  province: "",
  district: "",
  commune: "",
  village: "",
  officeName: "",
  currentPosition: "",
  decreeFinal: "",
  rankAndClass: "",
  maritalStatus: "",
  mustBe: "",
  affiliatedProfession: "",
  federationName: "",
  affiliatedOrganization: "",
  federationEstablishmentDate: "",
  wivesSalary: "",
  teachersProfessionalRank: [
    {
      id: undefined,
      typeOfProfessionalRank: "",
      description: "",
      announcementNumber: "",
      dateAccepted: "",
    },
  ],
  teacherExperience: [
    {
      id: undefined,
      continuousEmployment: "",
      workPlace: "",
      startDate: "",
      endDate: "",
    },
  ],
  teacherPraiseOrCriticism: [
    {
      id: undefined,
      typePraiseOrCriticism: "",
      giveBy: "",
      dateAccepted: "",
    },
  ],
  teacherEducation: [
    {
      id: undefined,
      culturalLevel: "",
      skillName: "",
      dateAccepted: "",
      country: "",
    },
  ],
  teacherVocational: [
    {
      id: undefined,
      culturalLevel: "",
      skillOne: "",
      skillTwo: "",
      trainingSystem: "",
      dateAccepted: "",
    },
  ],
  teacherShortCourse: [
    {
      id: undefined,
      skill: "",
      skillName: "",
      startDate: "",
      endDate: "",
      duration: "",
      preparedBy: "",
      supportBy: "",
    },
  ],
  teacherLanguage: [
    {
      id: undefined,
      language: "",
      reading: "",
      writing: "",
      speaking: "",
    },
  ],
  teacherFamily: [
    {
      id: undefined,
      nameChild: "",
      gender: "",
      dateOfBirth: "",
      working: "",
    },
  ],
  status: "",
  password: "",
  username: "",
  departmentId: 0,
  identifyNumber: "",
};
