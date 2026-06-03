export interface StaffRespondApi {
  status: string;
  message: string;
  data: StaffRespondModel;
}

export interface StaffRespondModel {
  id: number;
  username: string;
  email: string;
  roles: string[];
  status: string;
  khmerFirstName: string;
  khmerLastName: string;
  englishFirstName: string;
  englishLastName: string;
  gender: string;
  dateOfBirth: string;
  phoneNumber: string;
  currentAddress: string;
  nationality: string;
  ethnicity: string;
  placeOfBirth: string;
  identifyNumber: string;
  staffId: string;
  nationalId: string;
  startWorkDate: string;
  currentPositionDate: string;
  employeeWork: string;
  disability: string;
  payrollAccountNumber: string;
  cppMembershipNumber: string;
  province: string;
  district: string;
  commune: string;
  village: string;
  officeName: string;
  currentPosition: string;
  decreeFinal: string;
  rankAndClass: string;
  department: Department;
  profileUrl: string;
  taughtEnglish: string;
  threeLevelClass: string;
  referenceNote: string;
  technicalTeamLeader: string;
  assistInTeaching: string;
  serialNumber: string;
  twoLevelClass: string;
  classResponsibility: string;
  lastSalaryIncrementDate: string;
  teachAcrossSchools: string;
  overtimeHours: string;
  issuedDate: string;
  suitableClass: string;
  bilingual: string;
  academicYearTaught: string;
  workHistory: string;
  maritalStatus: string;
  mustBe: string;
  affiliatedProfession: string;
  federationName: string;
  affiliatedOrganization: string;
  federationEstablishmentDate: string;
  wivesSalary: string;
  teachersProfessionalRank: TeachersProfessionalRank[];
  teacherExperience: TeacherExperience[];
  teacherPraiseOrCriticism: TeacherPraiseOrCriticism[];
  teacherEducation: TeacherEducation[];
  teacherVocational: TeacherVocational[];
  teacherShortCourse: TeacherShortCourse[];
  teacherLanguage: TeacherLanguage[];
  teacherFamily: TeacherFamily[];
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

interface TeachersProfessionalRank {
  id: number;
  typeOfProfessionalRank: string;
  description: string;
  announcementNumber: string;
  dateAccepted: string;
}

interface TeacherExperience {
  id: number;
  continuousEmployment: string;
  workPlace: string;
  startDate: string;
  endDate: string;
}

interface TeacherPraiseOrCriticism {
  id: number;
  typePraiseOrCriticism: string;
  giveBy: string;
  dateAccepted: string;
}

interface TeacherEducation {
  id: number;
  culturalLevel: string;
  skillName: string;
  dateAccepted: string;
  country: string;
}

interface TeacherVocational {
  id: number;
  culturalLevel: string;
  skillOne: string;
  skillTwo: string;
  trainingSystem: string;
  dateAccepted: string;
}

interface TeacherShortCourse {
  id: number;
  skill: string;
  skillName: string;
  startDate: string;
  endDate: string;
  duration: string;
  preparedBy: string;
  supportBy: string;
}

interface TeacherLanguage {
  id: number;
  language: string;
  reading: string;
  writing: string;
  speaking: string;
}

interface TeacherFamily {
  id: number;
  nameChild: string;
  gender: string;
  dateOfBirth: string;
  working: string;
}

export interface AllStaffModel {
  content: StaffModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface StaffModel {
  id: number;
  username: string;
  email: string;
  roles: string[];
  status: string;
  department: Department;
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

interface Department {
  id: number;
  code: string;
  name: string;
  urlLogo: string;
  status: string;
  createdAt: string;
}
