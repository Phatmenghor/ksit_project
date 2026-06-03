"use client";

import { ROUTE } from "@/constants/routes";
import { StatusEnum } from "@/constants/constant";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { addStudentService } from "@/service/user/student.service";
import StudentForm from "@/components/dashboard/users/student/form/student-form";
import { cleanField } from "@/utils/map-helper/student";
import { AddStudentFormData } from "@/model/user/student/student.schema";
import { AddStudentModel } from "@/model/user/student/student.request.model";

export default function AddSingleStudentPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (data: AddStudentFormData) => {
    setLoading(true);
    try {
      const payload: AddStudentModel = {
        // required fields (we assume they passed validation)
        username: cleanField(data.username)!,
        password: cleanField(data.password)!,
        classId: data.classId ?? undefined,

        // optional string fields
        email: cleanField(data.email),
        khmerFirstName: cleanField(data.khmerFirstName),
        khmerLastName: cleanField(data.khmerLastName),
        englishFirstName: cleanField(data.englishFirstName),
        englishLastName: cleanField(data.englishLastName),
        gender: cleanField(data.gender),
        profileUrl: cleanField(data.profileUrl),
        dateOfBirth: cleanField(data.dateOfBirth),
        phoneNumber: cleanField(data.phoneNumber),
        currentAddress: cleanField(data.currentAddress),
        nationality: cleanField(data.nationality),
        ethnicity: cleanField(data.ethnicity),
        placeOfBirth: cleanField(data.placeOfBirth),
        memberSiblings: cleanField(data.memberSiblings),
        numberOfSiblings: cleanField(data.numberOfSiblings),
        studentStatus: cleanField(data.studentStatus),
        status: StatusEnum.ACTIVE,

        // nested arrays; map each entry, cleaning inner strings too
        studentStudiesHistory: data.studentStudiesHistory?.map((s) => ({
          typeStudies: cleanField(s.typeStudies),
          schoolName: cleanField(s.schoolName),
          location: cleanField(s.location),
          fromYear: cleanField(s.fromYear),
          endYear: cleanField(s.endYear),
          obtainedCertificate: cleanField(s.obtainedCertificate),
          overallGrade: cleanField(s.overallGrade),
        })),

        studentParent: data.studentParent?.map((p) => ({
          name: cleanField(p.name),
          age: cleanField(p.age),
          job: cleanField(p.job),
          phone: cleanField(p.phone),
          address: cleanField(p.address),
          parentType: cleanField(p.parentType),
        })),

        studentSibling: data.studentSibling?.map((s) => ({
          name: cleanField(s.name),
          gender: cleanField(s.gender),
          dateOfBirth: cleanField(s.dateOfBirth),
          occupation: cleanField(s.occupation),
          phoneNumber: cleanField(s.phoneNumber),
        })),
      };

      const response = await addStudentService(payload);
      if (response) {
        toast.success("Student created successfully");
      } else {
        toast.error("Failed to create student");
      }
    } catch (error) {
      console.error("Failed to create student:", error);
      toast.error("Failed to create student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <StudentForm
      mode="Add"
      showBackButton={false}
      title="Add Student"
      onSubmit={onSubmit}
      loading={loading}
    />
  );
}
