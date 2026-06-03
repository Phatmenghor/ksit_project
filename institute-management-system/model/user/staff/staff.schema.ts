import { z } from "zod";
import { StaffRespondModel } from "./staff.respond.model";

const TeachersProfessionalRankSchema = z.object({
  id: z.number().optional().nullable(),
  typeOfProfessionalRank: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  announcementNumber: z.string().optional().nullable(),
  dateAccepted: z.string().optional().nullable(),
});

const TeacherExperienceSchema = z.object({
  id: z.number().optional().nullable(),
  continuousEmployment: z.string().optional().nullable(),
  workPlace: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

const TeacherPraiseOrCriticismSchema = z.object({
  id: z.number().optional().nullable(),
  typePraiseOrCriticism: z.string().optional().nullable(),
  giveBy: z.string().optional().nullable(),
  dateAccepted: z.string().optional().nullable(),
});

const TeacherEducationSchema = z.object({
  id: z.number().optional().nullable(),
  culturalLevel: z.string().optional().nullable(),
  skillName: z.string().optional().nullable(),
  dateAccepted: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
});

const TeacherVocationalSchema = z.object({
  id: z.number().optional().nullable(),
  culturalLevel: z.string().optional().nullable(),
  skillOne: z.string().optional().nullable(),
  skillTwo: z.string().optional().nullable(),
  trainingSystem: z.string().optional().nullable(),
  dateAccepted: z.string().optional().nullable(),
});

const TeacherShortCourseSchema = z.object({
  id: z.number().optional().nullable(),
  skill: z.string().optional().nullable(),
  skillName: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  duration: z.string().optional().nullable(),
  preparedBy: z.string().optional().nullable(),
  supportBy: z.string().optional().nullable(),
});

const TeacherLanguageSchema = z.object({
  id: z.number().optional().nullable(),
  language: z.string().optional().nullable(),
  reading: z.string().optional().nullable(),
  writing: z.string().optional().nullable(),
  speaking: z.string().optional().nullable(),
});

const TeacherFamilySchema = z.object({
  id: z.number().optional().nullable(),
  nameChild: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  working: z.string().optional().nullable(),
});

const BaseStaffSchema = z.object({
  email: z
    .string()
    .email()
    .or(z.literal("")) // accept empty string as valid
    .optional()
    .nullable(),
  departmentId: z.number().optional().nullable(),
  roles: z.array(z.string()).optional().nullable(),
  khmerFirstName: z.string().optional().nullable(),
  khmerLastName: z.string().optional().nullable(),
  englishFirstName: z.string().optional().nullable(),
  englishLastName: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  currentAddress: z.string().optional().nullable(),
  nationality: z.string().optional().nullable(),
  ethnicity: z.string().optional().nullable(),
  placeOfBirth: z.string().optional().nullable(),
  profileUrl: z.string().optional().nullable(),
  taughtEnglish: z.string().optional().nullable(),
  threeLevelClass: z.string().optional().nullable(),
  referenceNote: z.string().optional().nullable(),
  technicalTeamLeader: z.string().optional().nullable(),
  assistInTeaching: z.string().optional().nullable(),
  serialNumber: z.string().optional().nullable(),
  twoLevelClass: z.string().optional().nullable(),
  classResponsibility: z.string().optional().nullable(),
  lastSalaryIncrementDate: z.string().optional().nullable(),
  teachAcrossSchools: z.string().optional().nullable(),
  overtimeHours: z.string().optional().nullable(),
  issuedDate: z.string().optional().nullable(),
  suitableClass: z.string().optional().nullable(),
  bilingual: z.string().optional().nullable(),
  academicYearTaught: z.string().optional().nullable(),
  workHistory: z.string().optional().nullable(),
  staffId: z.string().optional().nullable(),
  nationalId: z.string().optional().nullable(),
  startWorkDate: z.string().optional().nullable(),
  currentPositionDate: z.string().optional().nullable(),
  employeeWork: z.string().optional().nullable(),
  disability: z.string().optional().nullable(),
  payrollAccountNumber: z.string().optional().nullable(),
  cppMembershipNumber: z.string().optional().nullable(),
  province: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  commune: z.string().optional().nullable(),
  village: z.string().optional().nullable(),
  officeName: z.string().optional().nullable(),
  currentPosition: z.string().optional().nullable(),
  decreeFinal: z.string().optional().nullable(),
  rankAndClass: z.string().optional().nullable(),
  maritalStatus: z.string().optional().nullable(),
  mustBe: z.string().optional().nullable(),
  affiliatedProfession: z.string().optional().nullable(),
  federationName: z.string().optional().nullable(),
  affiliatedOrganization: z.string().optional().nullable(),
  federationEstablishmentDate: z.string().optional().nullable(),
  wivesSalary: z.string().optional().nullable(),
  teachersProfessionalRank: z
    .array(TeachersProfessionalRankSchema)
    .optional()
    .nullable(),
  teacherExperience: z.array(TeacherExperienceSchema).optional().nullable(),
  teacherPraiseOrCriticism: z
    .array(TeacherPraiseOrCriticismSchema)
    .optional()
    .nullable(),
  teacherEducation: z.array(TeacherEducationSchema).optional().nullable(),
  teacherVocational: z.array(TeacherVocationalSchema).optional().nullable(),
  teacherShortCourse: z.array(TeacherShortCourseSchema).optional().nullable(),
  teacherLanguage: z.array(TeacherLanguageSchema).optional().nullable(),
  teacherFamily: z.array(TeacherFamilySchema).optional().nullable(),
  status: z.string().optional().nullable(),
});

export const EditStaffSchema = BaseStaffSchema.extend({
  identifyNumber: z.string().optional(),
});

export const AddStaffSchema = BaseStaffSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters"),

  username: z.string().min(3, "Username must be at least 3 characters"),

  identifyNumber: z.string().min(1, "Identify number is required"),
});

// Types inferred from schemas for type-safe form data handling
export type AddStaffFormData = z.infer<typeof AddStaffSchema>;
export type EditStaffFormData = z.infer<typeof EditStaffSchema>;

const BaseAdminSchema = BaseStaffSchema.pick({
  email: true,
  status: true,
  roles: true,
  profileUrl: true,
}).extend({
  username: z.string(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
});

export const AdminFormSchema = BaseAdminSchema.extend({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
  confirmPassword: z
    .string()
    .min(8, "Confirm Password must be at least 8 characters")
    .optional(),
}).refine(
  (data) => {
    // If password or confirmPassword is provided, ensure both match
    if (data.password || data.confirmPassword) {
      return data.password === data.confirmPassword;
    }
    // Otherwise, skip validation
    return true;
  },
  {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  }
);

// Form data type including optional id and selected staff for editing contexts
export type AdminFormData = z.infer<typeof AdminFormSchema> & {
  id?: number;
  selectedStaff?: StaffRespondModel;
};
