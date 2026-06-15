"use client";

import { ROUTE } from "@/constants/routes";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  editStudentService,
  getStudentByIdService,
} from "@/service/user/student.service";
import StudentForm from "@/components/dashboard/users/student/form/student-form";
import {
  EditStudentFormData,
  StudentFormSchema,
} from "@/model/user/student/student.schema";
import { EditStudentModel } from "@/model/user/student/student.request.model";
import { cleanField } from "@/utils/map-helper/student";
import Loading from "@/components/shared/loading";

export default function EditSingleStudentPage() {
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState<EditStudentFormData>();
  const router = useRouter();

  const params = useParams();
  const studentId = params.id as string;

  // 1. Fetch teacher data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getStudentByIdService(studentId);

        // Only process studentParent if parentType is missing or array is incomplete
        let processedStudentParent = response.studentParent || [];

        // Check if we need to fix parentType values
        const needsTypeAssignment = processedStudentParent.some(
          (parent: any) => !parent.parentType
        );

        if (needsTypeAssignment || processedStudentParent.length < 2) {
          // Assign parentType only when missing and ensure we have 2 parents
          processedStudentParent = [
            processedStudentParent[0]
              ? {
                  ...processedStudentParent[0],
                  parentType: processedStudentParent[0].parentType || "FATHER",
                }
              : {
                  parentType: "FATHER",
                  name: "",
                  phone: "",
                  job: "",
                  address: "",
                  age: "",
                },

            processedStudentParent[1]
              ? {
                  ...processedStudentParent[1],
                  parentType: processedStudentParent[1].parentType || "MOTHER",
                }
              : {
                  parentType: "MOTHER",
                  name: "",
                  phone: "",
                  job: "",
                  address: "",
                  age: "",
                },
          ];
        }

        setInitialValues({
          ...response,
          id: response.id,
          classId: response.studentClass.id,
          studentParent: processedStudentParent,
          studentStudiesHistory: response.studentStudiesHistory,
          studentSibling: response.studentSibling,
          nationality: response.nationality,
        });
      } catch (error) {
        toast.error("Failed to load student data");
      }
    };

    fetchData();
  }, [studentId]);

  const onSubmit = async (data: EditStudentFormData) => {
    setLoading(true);
    try {
      // Validate using Zod and get parsed data
      const parsed = StudentFormSchema.safeParse(data);

      if (!parsed.success) {
        toast.error("Invalid form data");
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
        studentStatus: cleanField(formData.studentStatus),

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

        status: cleanField(formData.status),
      };

      const response = await editStudentService(Number(studentId), payload);
      if (response) {
        toast.success("Student updated successfully");
      } else {
        toast.error("Failed to update student");
      }
    } catch (error) {
      toast.error("Failed to update student");
    } finally {
      setLoading(false);
    }
  };

  if (!initialValues && loading) {
    return <Loading />;
  }

  return (
    <StudentForm
      initialValues={initialValues}
      mode="Edit"
      title="Edit Student"
      onSubmit={onSubmit}
      loading={loading}
      back={ROUTE.DASHBOARD}
      onDiscard={() => {
        router.back();
      }}
    />
  );
}
