"use client";
import { UserProfileSection } from "@/components/dashboard/users/shared/user-profile";
import { CardHeaderSection } from "@/components/shared/layout/card-header-section";
import { ROUTE } from "@/constants/routes";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchStaffByIdService } from "@/features/users/store/thunks/staff-thunks";
import { selectSelectedStaff } from "@/features/users/store/selectors/staff-selectors";
import TeacherPersonal from "@/components/dashboard/users/teachers/view/TeacherPersonalInfo";
import TeacherProfessionalRank from "@/components/dashboard/users/teachers/view/TeacherProfessionalRank";
import TeacherExperienceSection from "@/components/dashboard/users/teachers/view/TeacherExperience";
import TeacherPraiseOrCriticismSection from "@/components/dashboard/users/teachers/view/TeacherPraiseOrCriticism";
import TeacherEducationSection from "@/components/dashboard/users/teachers/view/TeacherEducation";
import TeacherVocationalSection from "@/components/dashboard/users/teachers/view/TeacherVocational";
import TeacherShortCourseSection from "@/components/dashboard/users/teachers/view/TeacherShortCourse";
import TeacherLanguageSection from "@/components/dashboard/users/teachers/view/TeacherLanguage";
import TeacherFamilySection from "@/components/dashboard/users/teachers/view/TeacherFamily";

export default function AdminDetailPage() {
  const dispatch = useAppDispatch();
  const admin = useAppSelector(selectSelectedStaff);
  const isLoading = useAppSelector((state) => state.staff.operations.isFetchingDetail);
  const params = useParams();
  const adminId = params.id as string;

  useEffect(() => {
    if (adminId) {
      dispatch(fetchStaffByIdService(adminId));
    }
  }, [adminId, dispatch]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Admin not found.</p>
      </div>
    );
  }

  return (
    <div>
      <CardHeaderSection
        title="Admin View Details"
        back
        breadcrumbs={[
          { label: "Dashboard", href: ROUTE.DASHBOARD },
          { label: "View Admin", href: ROUTE.USERS.ADMIN.ADMIN_VIEW(adminId) },
        ]}
      />
      <div className="mt-4 space-y-4">
        <UserProfileSection user={admin} />
        <TeacherPersonal teacher={admin} />
        <TeacherProfessionalRank teacher={admin} />
        <TeacherExperienceSection teacher={admin?.teacherExperience || null} />
        <TeacherPraiseOrCriticismSection
          teacher={admin?.teacherPraiseOrCriticism || null}
        />
        <TeacherEducationSection teacher={admin?.teacherEducation || null} />
        <TeacherVocationalSection teacher={admin?.teacherVocational || null} />
        <TeacherShortCourseSection
          teacher={admin?.teacherShortCourse || null}
        />
        <TeacherLanguageSection teacher={admin?.teacherLanguage || null} />
        <TeacherFamilySection
          familyStatus={admin}
          teacher={admin?.teacherFamily || null}
        />
      </div>
    </div>
  );
}
