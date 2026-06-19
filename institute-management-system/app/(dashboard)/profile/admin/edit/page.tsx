"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import TeacherForm from "@/components/dashboard/users/teachers/form/teacher-form";
import { ROUTE } from "@/constants/routes";
import { EditStaffFormData } from "@/model/user/staff/staff.schema";
import { EditStaffModel } from "@/model/user/staff/staff.request.model";
import { cleanField, filterEmptyRows } from "@/utils/map-helper/student";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchStaffProfileThunk, updateStaffProfileThunk } from "@/store/slices/auth-slice";

export default function EditAdminProfilePage() {
  const dispatch = useAppDispatch();
  const staffProfile = useAppSelector((state) => state.auth.staffProfile);
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState<EditStaffFormData>();
  const [staffId, setStaffId] = useState<number | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        let response = staffProfile;
        if (!response) {
          response = await dispatch(fetchStaffProfileThunk()).unwrap();
        }

        setStaffId(response.id);

        const payload: EditStaffFormData = {
          email: response?.email ?? "",
          roles: response?.roles ?? [],
          khmerFirstName: response?.khmerFirstName ?? "",
          khmerLastName: response?.khmerLastName ?? "",
          englishFirstName: response?.englishFirstName ?? "",
          englishLastName: response?.englishLastName ?? "",
          gender: response?.gender ?? "",
          dateOfBirth: response?.dateOfBirth ?? "",
          phoneNumber: response?.phoneNumber ?? "",
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
        toast.error("Failed to load profile data");
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (data: EditStaffFormData) => {
    if (staffId == null) {
      toast.error("ID is missing");
      return;
    }

    setLoading(true);

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

        teachersProfessionalRank: filterEmptyRows(
          data.teachersProfessionalRank ?? []
        ).map((rank) => ({
          typeOfProfessionalRank: cleanField(rank.typeOfProfessionalRank),
          description: cleanField(rank.description),
          announcementNumber: cleanField(rank.announcementNumber),
          dateAccepted: cleanField(rank.dateAccepted),
        })),

        teacherExperience: filterEmptyRows(data.teacherExperience ?? []).map(
          (exp) => ({
            continuousEmployment: cleanField(exp.continuousEmployment),
            workPlace: cleanField(exp.workPlace),
            startDate: cleanField(exp.startDate),
            endDate: cleanField(exp.endDate),
          })
        ),

        teacherPraiseOrCriticism: filterEmptyRows(
          data.teacherPraiseOrCriticism ?? []
        ).map((item) => ({
          typePraiseOrCriticism: cleanField(item.typePraiseOrCriticism),
          giveBy: cleanField(item.giveBy),
          dateAccepted: cleanField(item.dateAccepted),
        })),

        teacherEducation: filterEmptyRows(data.teacherEducation ?? []).map(
          (edu) => ({
            culturalLevel: cleanField(edu.culturalLevel),
            skillName: cleanField(edu.skillName),
            country: cleanField(edu.country),
            dateAccepted: cleanField(edu.dateAccepted),
          })
        ),

        teacherVocational: filterEmptyRows(data.teacherVocational ?? []).map(
          (voc) => ({
            culturalLevel: cleanField(voc.culturalLevel),
            skillOne: cleanField(voc.skillOne),
            skillTwo: cleanField(voc.skillTwo),
            trainingSystem: cleanField(voc.trainingSystem),
            dateAccepted: cleanField(voc.dateAccepted),
          })
        ),

        teacherShortCourse: filterEmptyRows(data.teacherShortCourse ?? []).map(
          (course) => ({
            skill: cleanField(course.skill),
            skillName: cleanField(course.skillName),
            startDate: cleanField(course.startDate),
            endDate: cleanField(course.endDate),
            duration: cleanField(course.duration),
            preparedBy: cleanField(course.preparedBy),
            supportBy: cleanField(course.supportBy),
          })
        ),

        teacherLanguage: filterEmptyRows(data.teacherLanguage ?? []).map(
          (lang) => ({
            language: cleanField(lang.language),
            reading: cleanField(lang.reading),
            writing: cleanField(lang.writing),
            speaking: cleanField(lang.speaking),
          })
        ),

        teacherFamily: filterEmptyRows(data.teacherFamily ?? []).map(
          (fam) => ({
            nameChild: cleanField(fam.nameChild),
            gender: cleanField(fam.gender),
            dateOfBirth: cleanField(fam.dateOfBirth),
            working: cleanField(fam.working),
          })
        ),
      };

      await dispatch(updateStaffProfileThunk({ id: staffId, data: payload })).unwrap();
      toast.success("Profile updated successfully");
      router.push(ROUTE.PROFILE.ADMIN);
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TeacherForm
      mode="Edit"
      title="Edit Profile"
      onSubmit={onSubmit}
      initialValues={initialValues}
      loading={loading}
      back={ROUTE.PROFILE.ADMIN}
      parentLabel="Profile"
      onDiscard={() => router.push(ROUTE.PROFILE.ADMIN)}
    />
  );
}
