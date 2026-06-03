"use client";
import { Suspense, useState } from "react";
import { addStaffService } from "@/service/user/user.service";
import { RoleEnum, StatusEnum } from "@/constants/constant";
import { toast } from "sonner";
import TeacherForm from "@/components/dashboard/users/teachers/form/teacher-form";
import { useRouter } from "next/navigation";
import { ROUTE } from "@/constants/routes";
import { AddStaffFormData } from "@/model/user/staff/staff.schema";
import { AddStaffModel } from "@/model/user/staff/staff.request.model";
import { cleanField } from "@/utils/map-helper/student";
import Loading from "@/components/shared/loading";

export default function AddStaffOfficerPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (data: AddStaffFormData) => {
    setLoading(true);

    try {
      const payload: AddStaffModel = {
        // required top-level
        username: data.username,
        password: data.password,
        departmentId: data.departmentId ?? undefined,
        identifyNumber: data.identifyNumber,

        // optional strings
        email: cleanField(data.email),
        khmerFirstName: cleanField(data.khmerFirstName),
        khmerLastName: cleanField(data.khmerLastName),
        englishFirstName: cleanField(data.englishFirstName),
        englishLastName: cleanField(data.englishLastName),
        gender: cleanField(data.gender),
        dateOfBirth: cleanField(data.dateOfBirth),
        phoneNumber: cleanField(data.phoneNumber),
        currentAddress: cleanField(data.currentAddress),
        nationality: cleanField(data.nationality),
        ethnicity: cleanField(data.ethnicity),
        placeOfBirth: cleanField(data.placeOfBirth),
        profileUrl: cleanField(data.profileUrl),
        taughtEnglish: cleanField(data.taughtEnglish),
        threeLevelClass: cleanField(data.threeLevelClass),
        referenceNote: cleanField(data.referenceNote),
        technicalTeamLeader: cleanField(data.technicalTeamLeader),
        assistInTeaching: cleanField(data.assistInTeaching),
        serialNumber: cleanField(data.serialNumber),
        twoLevelClass: cleanField(data.twoLevelClass),
        classResponsibility: cleanField(data.classResponsibility),
        lastSalaryIncrementDate: cleanField(data.lastSalaryIncrementDate),
        teachAcrossSchools: cleanField(data.teachAcrossSchools),
        overtimeHours: cleanField(data.overtimeHours),
        issuedDate: cleanField(data.issuedDate),
        suitableClass: cleanField(data.suitableClass),
        bilingual: cleanField(data.bilingual),
        academicYearTaught: cleanField(data.academicYearTaught),
        workHistory: cleanField(data.workHistory),
        staffId: cleanField(data.staffId),
        nationalId: cleanField(data.nationalId),
        startWorkDate: cleanField(data.startWorkDate),
        currentPositionDate: cleanField(data.currentPositionDate),
        employeeWork: cleanField(data.employeeWork),
        disability: cleanField(data.disability),
        payrollAccountNumber: cleanField(data.payrollAccountNumber),
        cppMembershipNumber: cleanField(data.cppMembershipNumber),
        province: cleanField(data.province),
        district: cleanField(data.district),
        commune: cleanField(data.commune),
        village: cleanField(data.village),
        officeName: cleanField(data.officeName),
        currentPosition: cleanField(data.currentPosition),
        decreeFinal: cleanField(data.decreeFinal),
        rankAndClass: cleanField(data.rankAndClass),
        maritalStatus: cleanField(data.maritalStatus),
        mustBe: cleanField(data.mustBe),
        affiliatedProfession: cleanField(data.affiliatedProfession),
        federationName: cleanField(data.federationName),
        affiliatedOrganization: cleanField(data.affiliatedOrganization),
        federationEstablishmentDate: cleanField(
          data.federationEstablishmentDate
        ),
        wivesSalary: cleanField(data.wivesSalary),

        // nested arrays
        teachersProfessionalRank: (data.teachersProfessionalRank ?? []).map(
          (rank) => ({
            typeOfProfessionalRank: cleanField(rank.typeOfProfessionalRank),
            description: cleanField(rank.description),
            announcementNumber: cleanField(rank.announcementNumber),
            dateAccepted: cleanField(rank.dateAccepted),
          })
        ),

        teacherExperience: (data.teacherExperience ?? []).map((exp) => ({
          continuousEmployment: cleanField(exp.continuousEmployment),
          workPlace: cleanField(exp.workPlace),
          startDate: cleanField(exp.startDate),
          endDate: cleanField(exp.endDate),
        })),

        teacherPraiseOrCriticism: (data.teacherPraiseOrCriticism ?? []).map(
          (item) => ({
            typePraiseOrCriticism: cleanField(item.typePraiseOrCriticism),
            giveBy: cleanField(item.giveBy),
            dateAccepted: cleanField(item.dateAccepted),
          })
        ),

        teacherEducation: (data.teacherEducation ?? []).map((edu) => ({
          culturalLevel: cleanField(edu.culturalLevel),
          skillName: cleanField(edu.skillName),
          country: cleanField(edu.country),
          dateAccepted: cleanField(edu.dateAccepted),
        })),

        teacherVocational: (data.teacherVocational ?? []).map((voc) => ({
          culturalLevel: cleanField(voc.culturalLevel),
          skillOne: cleanField(voc.skillOne),
          skillTwo: cleanField(voc.skillTwo),
          trainingSystem: cleanField(voc.trainingSystem),
          dateAccepted: cleanField(voc.dateAccepted),
        })),

        teacherShortCourse: (data.teacherShortCourse ?? []).map((course) => ({
          skill: cleanField(course.skill),
          skillName: cleanField(course.skillName),
          startDate: cleanField(course.startDate),
          endDate: cleanField(course.endDate),
          duration: cleanField(course.duration),
          preparedBy: cleanField(course.preparedBy),
          supportBy: cleanField(course.supportBy),
        })),

        teacherLanguage: (data.teacherLanguage ?? []).map((lang) => ({
          language: cleanField(lang.language),
          reading: cleanField(lang.reading),
          writing: cleanField(lang.writing),
          speaking: cleanField(lang.speaking),
        })),

        teacherFamily: (data.teacherFamily ?? []).map((fam) => ({
          nameChild: cleanField(fam.nameChild),
          gender: cleanField(fam.gender),
          dateOfBirth: cleanField(fam.dateOfBirth),
          working: cleanField(fam.working),
        })),

        roles: [RoleEnum.STAFF],
        status: StatusEnum.ACTIVE,
      };

      const response = await addStaffService(payload);
      if (response) {
        toast.success("Staff created successfully");
        router.back();
      } else {
        toast.error("Failed to create staff");
      }
    } catch (error: any) {
      console.error("Failed to create Staff:", error);
      toast.error(error.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TeacherForm
      mode="Add"
      title="Add Staff"
      onSubmit={onSubmit}
      loading={loading}
      back={ROUTE.DASHBOARD}
      onDiscard={() => {
        router.back();
      }}
    />
  );
}
