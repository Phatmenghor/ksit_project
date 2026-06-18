"use client";

import { UserProfileSection } from "@/components/dashboard/users/shared/user-profile";
import { CardHeaderSection } from "@/components/shared/layout/card-header-section";
import { ROUTE } from "@/constants/routes";
import { StaffRespondModel } from "@/model/user/staff/staff.respond.model";
import { getStaffByTokenService } from "@/service/user/user.service";
import React, { useEffect } from "react";
import { toast } from "sonner";
import TeacherPersonal from "@/components/dashboard/users/teachers/view/TeacherPersonalInfo";
import TeacherProfessionalRank from "@/components/dashboard/users/teachers/view/TeacherProfessionalRank";
import TeacherExperienceSection from "@/components/dashboard/users/teachers/view/TeacherExperience";
import TeacherPraiseOrCriticismSection from "@/components/dashboard/users/teachers/view/TeacherPraiseOrCriticism";
import TeacherEducationSection from "@/components/dashboard/users/teachers/view/TeacherEducation";
import TeacherVocationalSection from "@/components/dashboard/users/teachers/view/TeacherVocational";
import TeacherShortCourseSection from "@/components/dashboard/users/teachers/view/TeacherShortCourse";
import TeacherLanguageSection from "@/components/dashboard/users/teachers/view/TeacherLanguage";
import TeacherFamilySection from "@/components/dashboard/users/teachers/view/TeacherFamily";

export default function AdminProfilePage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [admin, setAdmin] = React.useState<StaffRespondModel | null>(null);

  useEffect(() => {
    const loadAdmin = async () => {
      setIsLoading(true);
      try {
        const response = await getStaffByTokenService();
        if (response) setAdmin(response);
        else toast.error("Error getting profile data");
      } catch {
        toast.error("Error getting profile data");
      } finally {
        setIsLoading(false);
      }
    };
    loadAdmin();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <CardHeaderSection
        title="My Profile"
        back
        breadcrumbs={[
          { label: "Dashboard", href: ROUTE.DASHBOARD },
          { label: "My Profile", href: ROUTE.PROFILE.ADMIN },
        ]}
      />
      <div className="mt-4 space-y-4">
        <UserProfileSection user={admin} />
        <TeacherPersonal teacher={admin} />
        <TeacherProfessionalRank teacher={admin} />
        <TeacherExperienceSection teacher={admin?.teacherExperience || null} />
        <TeacherPraiseOrCriticismSection teacher={admin?.teacherPraiseOrCriticism || null} />
        <TeacherEducationSection teacher={admin?.teacherEducation || null} />
        <TeacherVocationalSection teacher={admin?.teacherVocational || null} />
        <TeacherShortCourseSection teacher={admin?.teacherShortCourse || null} />
        <TeacherLanguageSection teacher={admin?.teacherLanguage || null} />
        <TeacherFamilySection familyStatus={admin} teacher={admin?.teacherFamily || null} />
      </div>
    </div>
  );
}
