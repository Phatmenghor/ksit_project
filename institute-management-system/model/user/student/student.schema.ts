import { number, z } from "zod";

export const StudentStudiesHistorySchema = z.object({
  id: z.number().optional().nullable(),
  typeStudies: z.string().optional().nullable(),
  schoolName: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  fromYear: z.string().optional().nullable(),
  endYear: z.string().optional().nullable(),
  obtainedCertificate: z.string().optional().nullable(),
  overallGrade: z.string().optional().nullable(),
});

export const StudentParentSchema = z.object({
  id: z.number().optional().nullable(),
  name: z.string().optional().nullable(),
  age: z.string().optional().nullable(),
  job: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  parentType: z.string().optional().nullable(),
});

export const StudentSiblingSchema = z.object({
  id: z.number().optional().nullable(),
  name: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
});

export const StudentFormSchema = z.object({
  email: z.string().optional().nullable(),
  khmerFirstName: z.string().optional().nullable(),
  khmerLastName: z.string().optional().nullable(),
  englishFirstName: z.string().optional().nullable(),
  englishLastName: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  profileUrl: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  currentAddress: z.string().optional().nullable(),
  nationality: z.string().optional().nullable(),
  ethnicity: z.string().optional().nullable(),
  placeOfBirth: z.string().optional().nullable(),
  memberSiblings: z.string().optional().nullable(),
  numberOfSiblings: z.string().optional().nullable(),
  studentStatus: z.string().optional().nullable(),
  studentStudiesHistory: z
    .array(StudentStudiesHistorySchema)
    .optional()
    .nullable(),
  studentParent: z.array(StudentParentSchema).optional().nullable(),
  studentSibling: z.array(StudentSiblingSchema).optional().nullable(),
  status: z.string().optional().nullable(),
});

export const AddStudentSchema = StudentFormSchema.extend({
  classId: z
    .number()
    .int("Class ID must be an integer")
    .positive("Class ID must be a positive number"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(50, "Password must be at most 50 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
});

export const EditStudentSchema = StudentFormSchema.extend({
  id: z.number().positive().optional().nullable(),
});

// Types inferred from schemas for type-safe form data handling

export type AddStudentFormData = z.infer<typeof AddStudentSchema>;
export type EditStudentFormData = z.infer<typeof EditStudentSchema>;
