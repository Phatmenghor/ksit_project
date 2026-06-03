"use client";

import { ROUTE } from "@/constants/routes";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { editStudentService } from "@/service/user/student.service";
import StudentForm from "@/components/dashboard/users/student/form/student-form";
import {
  EditStudentFormData,
  StudentFormSchema,
} from "@/model/user/student/student.schema";
import { EditStudentModel } from "@/model/user/student/student.request.model";
import { cleanField } from "@/utils/map-helper/student";
import { getStudentByTokenService } from "@/service/user/user.service";

export default function EditStudentProfilePage() {
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState<EditStudentFormData>();
  const [studentId, setStudentId] = useState<number | null>(null);
  const router = useRouter();

  // 1. Fetch teacher data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getStudentByTokenService();

        setStudentId(response.id);
        setInitialValues({
          ...response,
          classId: response.studentClass.id,
          studentParent: response.studentParent,
          studentStudiesHistory: response.studentStudiesHistory,
          studentSibling: response.studentSibling,
          nationality: response.nationality,
        });
      } catch (error) {
        console.error(" Failed to fetch profile by token:", error);
        toast.error("Failed to load profile data");
      }
    };

    fetchData();
  }, [studentId]);

  const onSubmit = async (data: EditStudentFormData) => {
    if (studentId == null) {
      toast.error("Profile ID is missing");
      return;
    }
    setLoading(true);
    try {
      // Validate using Zod and get parsed data
      const parsed = StudentFormSchema.safeParse(data);

      if (!parsed.success) {
        toast.error("Invalid form data");
        console.error(parsed.error);
        return;
      }

      const formData = parsed.data;

      // Build payload matching EditStudentData
      const payload: EditStudentModel = {
        // optional strings
        email: cleanField(formData.email),
        khmerFirstName: cleanField(formData.khmerFirstName),
        khmerLastName: cleanField(formData.khmerLastName),
        englishFirstName: cleanField(formData.englishFirstName),
        englishLastName: cleanField(formData.englishLastName),
        gender: cleanField(formData.gender),
        profileUrl: cleanField(formData.profileUrl),
        dateOfBirth: cleanField(formData.dateOfBirth),
        phoneNumber: cleanField(formData.phoneNumber),
        currentAddress: cleanField(formData.currentAddress),
        nationality: cleanField(formData.nationality),
        ethnicity: cleanField(formData.ethnicity),
        placeOfBirth: cleanField(formData.placeOfBirth),
        memberSiblings: cleanField(formData.memberSiblings),
        numberOfSiblings: cleanField(formData.numberOfSiblings),

        // nested arrays
        studentStudiesHistory: (formData.studentStudiesHistory ?? []).map(
          (h) => ({
            ...h,
            id: h.id == null ? undefined : h.id,
            typeStudies: cleanField(h.typeStudies),
            schoolName: cleanField(h.schoolName),
            location: cleanField(h.location),
            fromYear: cleanField(h.fromYear),
            endYear: cleanField(h.endYear),
            obtainedCertificate: cleanField(h.obtainedCertificate),
            overallGrade: cleanField(h.overallGrade),
          })
        ),

        studentParent: (formData.studentParent ?? []).map((p) => ({
          ...p,
          id: p.id == null ? undefined : p.id,
          name: cleanField(p.name),
          age: cleanField(p.age),
          job: cleanField(p.job),
          phone: cleanField(p.phone),
          address: cleanField(p.address),
          parentType: cleanField(p.parentType),
        })),

        studentSibling: (formData.studentSibling ?? []).map((s) => ({
          ...s,
          id: s.id == null ? undefined : s.id,
          name: cleanField(s.name),
          occupation: cleanField(s.occupation),
          gender: cleanField(s.gender),
          dateOfBirth: cleanField(s.dateOfBirth),
          phoneNumber: cleanField(s.phoneNumber),
        })),

        // status remains as-is (assuming it’s a required enum)
        status: cleanField(formData.status),
      };

      const response = await editStudentService(studentId, payload);
      if (response) {
        toast.success("Profile updated successfully");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!initialValues) {
    return <div>Loading...</div>;
  }

  return (
    <StudentForm
      initialValues={initialValues}
      mode="Edit"
      title="Edit your profile"
      onSubmit={onSubmit}
      loading={loading}
      back={ROUTE.DASHBOARD}
      onDiscard={() => {
        router.back();
      }}
    />
  );
}
