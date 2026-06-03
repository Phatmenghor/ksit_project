"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import {
  getStaffByIdService,
  updateStaffService,
} from "@/service/user/user.service";
import TeacherForm from "@/components/dashboard/users/teachers/form/teacher-form";
import { ROUTE } from "@/constants/routes";
import { EditStaffFormData } from "@/model/user/staff/staff.schema";
import { EditStaffModel } from "@/model/user/staff/staff.request.model";
import { cleanField } from "@/utils/map-helper/student";
import { StaffRespondModel } from "@/model/user/staff/staff.respond.model";

// // Helper function to check if all values in an object are undefined
// const isAllUndefined = (obj: Record<string, any>): boolean => {
//   return Object.values(obj).every(
//     (value) => value === undefined || value === null || value === ""
//   );
// };

// // Helper function to filter array and remove items where all fields are undefined
// const filterEmptyItems = <T extends Record<string, any>>(arr: T[]): T[] => {
//   return arr.filter((item) => !isAllUndefined(item));
// };

export default function EditTeacherPage() {
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState<EditStaffFormData>();

  const router = useRouter();
  const params = useParams();
  const teacherId = params?.id as string;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response: StaffRespondModel = await getStaffByIdService(
          teacherId
        );

        const payload: EditStaffFormData = {
          email: response?.email ?? "",
          identifyNumber: response?.identifyNumber ?? "",
          roles: response?.roles ?? [],
          khmerFirstName: response?.khmerFirstName ?? "",
          khmerLastName: response?.khmerLastName ?? "",
          englishFirstName: response?.englishFirstName ?? "",
          englishLastName: response?.englishLastName ?? "",
          gender: response?.gender ?? "MALE",
          dateOfBirth: response?.dateOfBirth ?? "",
          phoneNumber: response?.phoneNumber ?? "",
          departmentId: response?.department?.id ?? 0,
          currentAddress: response?.currentAddress ?? "",
          nationality: response?.nationality ?? "",
          ethnicity: response?.ethnicity ?? "",
          placeOfBirth: response?.placeOfBirth ?? "",
          profileUrl: response?.profileUrl ?? "",
          taughtEnglish: response?.taughtEnglish ?? "",
          threeLevelClass: response?.threeLevelClass ?? "",
          referenceNote: response?.referenceNote ?? "",
          technicalTeamLeader: response?.technicalTeamLeader ?? "",
          assistInTeaching: response?.assistInTeaching ?? "",
          serialNumber: response?.serialNumber ?? "",
          twoLevelClass: response?.twoLevelClass ?? "",
          classResponsibility: response?.classResponsibility ?? "",
          lastSalaryIncrementDate: response?.lastSalaryIncrementDate ?? "",
          teachAcrossSchools: response?.teachAcrossSchools ?? "",
          overtimeHours: response?.overtimeHours ?? "",
          issuedDate: response?.issuedDate ?? "",
          suitableClass: response?.suitableClass ?? "",
          bilingual: response?.bilingual ?? "",
          academicYearTaught: response?.academicYearTaught ?? "",
          workHistory: response?.workHistory ?? "",
          staffId: response?.staffId ?? "",
          nationalId: response?.nationalId ?? "",
          startWorkDate: response?.startWorkDate ?? "",
          currentPositionDate: response?.currentPositionDate ?? "",
          employeeWork: response?.employeeWork ?? "",
          disability: response?.disability ?? "",
          payrollAccountNumber: response?.payrollAccountNumber ?? "",
          cppMembershipNumber: response?.cppMembershipNumber ?? "",
          province: response?.province ?? "",
          district: response?.district ?? "",
          commune: response?.commune ?? "",
          village: response?.village ?? "",
          officeName: response?.officeName ?? "",
          currentPosition: response?.currentPosition ?? "",
          decreeFinal: response?.decreeFinal ?? "",
          rankAndClass: response?.rankAndClass ?? "",
          maritalStatus: response?.maritalStatus ?? "",
          mustBe: response?.mustBe ?? "",
          affiliatedProfession: response?.affiliatedProfession ?? "",
          federationName: response?.federationName ?? "",
          affiliatedOrganization: response?.affiliatedOrganization ?? "",
          federationEstablishmentDate:
            response?.federationEstablishmentDate ?? "",
          wivesSalary: response?.wivesSalary ?? "",
          status: response?.status ?? "",

          // Filter arrays to remove items where all fields are undefined
          teachersProfessionalRank: response?.teachersProfessionalRank ?? [],
          teacherExperience: response?.teacherExperience ?? [],
          teacherPraiseOrCriticism: response?.teacherPraiseOrCriticism ?? [],
          teacherEducation: response?.teacherEducation ?? [],
          teacherVocational: response?.teacherVocational ?? [],
          teacherShortCourse: response?.teacherShortCourse ?? [],
          teacherLanguage: response?.teacherLanguage ?? [],
          teacherFamily: response?.teacherFamily ?? [],
        };

        setInitialValues(payload);
      } catch (error) {
        console.error("Failed to fetch teacher:", error);
        toast.error("Failed to load teacher data");
      }
    };

    fetchData();
  }, [teacherId]);

  const onSubmit = async (data: EditStaffFormData) => {
    if (teacherId == null) {
      toast.error("ID is missing");
      return;
    }

    // console.log("## After Change teacherId", teacherId);

    setLoading(true);

    // console.log("## After Change department:data ", data);

    try {
      const payload: EditStaffModel = {
        email: cleanField(data.email),
        khmerFirstName: cleanField(data.khmerFirstName),
        khmerLastName: cleanField(data.khmerLastName),
        englishFirstName: cleanField(data.englishFirstName),
        englishLastName: cleanField(data.englishLastName),
        gender: cleanField(data.gender),
        departmentId:
          data?.departmentId == 0 || !data?.departmentId
            ? undefined
            : data.departmentId,
        profileUrl: cleanField(data.profileUrl),
        dateOfBirth: cleanField(data.dateOfBirth),
        phoneNumber: cleanField(data.phoneNumber),
        currentAddress: cleanField(data.currentAddress),
        nationality: cleanField(data.nationality),
        ethnicity: cleanField(data.ethnicity),
        placeOfBirth: cleanField(data.placeOfBirth),
        status: cleanField(data.status),
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
        identifyNumber: cleanField(data.identifyNumber),
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

        // Filter arrays before submitting - only include items with at least one non-empty field
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
      };

      const response = await updateStaffService(Number(teacherId), payload);

      if (response) {
        toast.success("Teacher updated successfully");
      } else {
        toast.error("Failed to update teacher");
      }
    } catch (error) {
      console.error("Failed to update teacher:", error);
      toast.error("Failed to update teacher");
      setLoading(false);
    }
  };

  return (
    <TeacherForm
      mode="Edit"
      title="Edit Teacher"
      onSubmit={onSubmit}
      initialValues={initialValues}
      loading={loading}
      isTeacher={true}
      back={ROUTE.DASHBOARD}
      onDiscard={() => {
        router.back();
      }}
    />
  );
}
