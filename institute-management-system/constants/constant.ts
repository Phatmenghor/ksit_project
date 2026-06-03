import {
  Check,
  CheckCircle,
  Clock4,
  FileText,
  Info,
  Logs,
  MenuIcon,
  RotateCcw,
  X,
} from "lucide-react";

//Major
export const majors = [
  { value: "Computer Science", label: "វិទ្យាសាស្ត្រកុំព្យូទ័រ" },
  { value: "Food Technology", label: "បច្ចេកវិទ្យាអាហារ" },
  { value: "Crop Science", label: "វិទ្យាសាស្រ្តដំណាំ" },
  { value: "Electrical Technology", label: "បច្ចេកវិទ្យាអគ្គិសនី" },
  { value: "Animal Science", label: "វិទ្យាសាស្រ្តសត្វ" },
  {
    value: "Animal Science (General)",
    label: "វិទ្យាសាស្រ្តសត្វ​​ (អប់រំបច្ចេកទេស)",
  },
  { value: "Mechanical Technology", label: "បច្ចេកវិទ្យយានកម្ម" },
  { value: "Business Computer", label: "កុំព្យូទ័រសម្រាប់អាជីវកម្ម" },
  {
    value: "Business Technology and Innovation",
    label: "បច្ចេកវិទ្យា និងនវានុវត្តន៍ក្នុងអាជីវកម្ម",
  },
];

export const departments = [
  { label: "Computer Science", value: "Computer Science" },
  { label: "Food Technology", value: "Food Technology" },
  { label: "Animal Science", value: "Animal Science" },
  { label: "Plant Science", value: "Plant Science" },
  { label: "Electrical Technology", value: "Electrical Technology" },
  { label: "Mechanical Technology", value: "Mechanical Technology" },
  { label: "បច្ចេកវិទ្យាព័ត៌មាន", value: "បច្ចេកវិទ្យាព័ត៌មាន" },
  {
    label: "សេដ្ឋកិច្ច និងរដ្ឋបាលសាធារណៈ",
    value: "សេដ្ឋកិច្ច និងរដ្ឋបាលសាធារណៈ",
  },
  { label: "ទេសចរណ៍ និងអភិវឌ្ឍន៍", value: "ទេសចរណ៍ និងអភិវឌ្ឍន៍" },
  { label: "សាធារណការនិងសំណង់ស៊ីវិល", value: "សាធារណការនិងសំណង់ស៊ីវិល" },
  { label: "បច្ចេកវិទ្យាសំណង់", value: "បច្ចេកវិទ្យាសំណង់" },
  { label: "វិទ្យាសាស្ត្រកសិកម្ម", value: "វិទ្យាសាស្ត្រកសិកម្ម" },
  {
    label: "បច្ចេកវិទ្យាព័ត៌មានគ្រប់គ្រង",
    value: "បច្ចេកវិទ្យាព័ត៌មានគ្រប់គ្រង",
  },
  { label: "ហិរញ្ញវត្ថុ និងគណនេយ្យ", value: "ហិរញ្ញវត្ថុ និងគណនេយ្យ" },
];

export const degrees = [
  { value: "Bachelor's Degree", label: "Bachelor's Degree" },
  { value: "Associate Degree", label: "Associate's Degree" },
];

export const years = [
  { value: "2023", label: "2023" },
  { value: "2024", label: "2024" },
  { value: "2025", label: "2025" },
  { value: "2026", label: "2026" },
  { value: "2027", label: "2027" },
  { value: "2028", label: "2028" },
  { value: "2029", label: "2029" },
  { value: "2030", label: "2030" },
];

export const yearLevels = [
  { value: 1, label: "ឆ្នាំទី 1" },
  { value: 2, label: "ឆ្នាំទី 2" },
  { value: 3, label: "ឆ្នាំទី 3" },
  { value: 4, label: "ឆ្នាំទី 4" },
];

export enum StatusEnum {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export const status = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export enum RoleEnum {
  DEVELOPER = "DEVELOPER", // System developer with full access
  ADMIN = "ADMIN", // School administrator
  STAFF = "STAFF", // School staff (teachers, office staff)
  TEACHER = "TEACHER", // School staff (teachers, office staff)
  STUDENT = "STUDENT",
}

export enum SemesterEnum {
  SEMESTER_1 = "SEMESTER_1",
  SEMESTER_2 = "SEMESTER_2",
}

export enum SemesterEnumFilter {
  All_SEMESTER = "All_SEMESTER",
  SEMESTER_1 = "SEMESTER_1",
  SEMESTER_2 = "SEMESTER_2",
}

export enum semesterValue {
  SEMESTER_1 = "1st Semester",
  SEMESTER_2 = "2nd Semester",
}

export enum DayEnum {
  MONDAY = "Monday",
  TUESDAY = "Tuesday",
  WEDNESDAY = "Wednesday",
  THURSDAY = "Thursday",
  FRIDAY = "Friday",
  SATURDAY = "Saturday",
  SUNDAY = "Sunday",
}

export enum SemesterType {
  PROGRESS = "PROGRESS",
  PROCESSING = "PROCESSING",
  DONE = "DONE",
}

export enum GenderEnum {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

export enum YearLevelEnum {
  FIRST_YEAR = "FIRST_YEAR",
  SECOND_YEAR = "SECOND_YEAR",
  THIRD_YEAR = "THIRD_YEAR",
  FOURTH_YEAR = "FOURTH_YEAR",
}

export enum DegreeEnum {
  BACHELOR = "BACHELOR",
  ASSOCIATE = "ASSOCIATE",
  TECHNICAL_EDUCATION = "TECHNICAL_EDUCATION",
}

export const studentStatuses = [
  { id: 1, value: "STUDYING", label: "Student is currently studying" },
  { id: 2, value: "GRADUATED", label: "Student has graduated" },
  { id: 3, value: "DROPPED_OUT", label: "Student has dropped out" },
  { id: 4, value: "SUSPENDED", label: "Student is suspended" },
  {
    id: 5,
    value: "TRANSFERRED",
    label: "Student has transferred to another institution",
  },
];

export const Degrees = [
  {
    label: "Bachelor's Degree",
    value: "BACHELOR",
  },
  {
    label: "Associate's Degree",
    value: "ASSOCIATE",
  },
  {
    label: "Technical Education",
    value: "TECHNICAL_EDUCATION",
  },
];

export const educationLevels = [
  { label: "បឋមសិក្សា", value: "PRIMARY_SCHOOL" },
  { label: "បឋមភូមិ	", value: "LOWER_SECONDARY_SCHOOL" },
  { label: "ទុតិយភូមិ", value: "UPPER_SECONDARY_SCHOOL" },
];

export interface DayType {
  label: string;
  value: string;
}

export const DAYS_OF_WEEK: DayType[] = [
  {
    label: "All",
    value: "ALL",
  },
  {
    label: "Monday",
    value: "MONDAY",
  },
  {
    label: "Tuesday",
    value: "TUESDAY",
  },
  {
    label: "Wednesday",
    value: "WEDNESDAY",
  },
  {
    label: "Thursday",
    value: "THURSDAY",
  },
  {
    label: "Friday",
    value: "FRIDAY",
  },
  {
    label: "Saturday",
    value: "SATURDAY",
  },
  {
    label: "Sunday",
    value: "SUNDAY",
  },
];

export interface DayTypeV1 {
  id: number;
  label: string;
  value: string;
}

export const DAYS_OF_WEEK_V1: DayTypeV1[] = [
  {
    id: 1,
    label: "All",
    value: "ALL",
  },
  {
    id: 2,
    label: "Monday",
    value: "MONDAY",
  },
  {
    id: 3,
    label: "Tuesday",
    value: "TUESDAY",
  },
  {
    id: 4,
    label: "Wednesday",
    value: "WEDNESDAY",
  },
  {
    id: 5,
    label: "Thursday",
    value: "THURSDAY",
  },
  {
    id: 6,
    label: "Friday",
    value: "FRIDAY",
  },
  {
    id: 7,
    label: "Saturday",
    value: "SATURDAY",
  },
  {
    id: 8,
    label: "Sunday",
    value: "SUNDAY",
  },
];

export const paymentTypes = [
  { label: "Free", value: "FREE" },
  { label: "Pay", value: "PAY" },
  { label: "Scholarship", value: "SCHOLARSHIP" },
];

export enum Mode {
  VIEW = "VIEW",
  ADD = "ADD",
  EDIT = "EDIT",
}

export enum RequestEnum {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  DONE = "DONE",
  DELETED = "DELETED",
  RETURN = "RETURN",
}

export interface RequestType {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const REQUEST_TYPES: RequestType[] = [
  {
    label: "All Requests",
    value: "PENDING",
    icon: Logs,
  },
  {
    label: "Returned List",
    value: "RETURN",
    icon: RotateCcw,
  },
  {
    label: "Accepted List",
    value: "ACCEPTED",
    icon: Check,
  },
  {
    label: "Rejected List",
    value: "REJECTED",
    icon: X,
  },
  {
    label: "Done List",
    value: "DONE",
    icon: CheckCircle,
  },
];

export const REQUEST_DETAIL: RequestType[] = [
  {
    label: "Information",
    value: "INFORMATION",
    icon: Info,
  },
  {
    label: "History",
    value: "HISTORY",
    icon: Clock4,
  },
  {
    label: "Transcript",
    value: "TRANSCRIPT",
    icon: FileText,
  },
];

export const SemesterFilter = [
  { value: "ALL", label: "All Semeter" },
  { value: "SEMESTER_1", label: "Semeter 1" },
  { value: "SEMESTER_2", label: "Semeter 2" },
];

export enum SubmissionEnum {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  SUBMITTED = "SUBMITTED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export const tabs = [
  {
    value: "all",
    label: "All Submitted",
    icon: MenuIcon,
    status: SubmissionEnum.SUBMITTED,
  },
  {
    value: "accept",
    label: "Accept List",
    icon: Check,
    status: SubmissionEnum.APPROVED, // Assuming you have this enum value
  },
];

export const enum QuestionTypeEnum {
  TEXT = "TEXT",
  RATING = "RATING",
}
