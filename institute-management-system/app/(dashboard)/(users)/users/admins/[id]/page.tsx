"use client";

import { UserProfileSection } from "@/components/dashboard/users/shared/user-profile";
import { CardHeaderSection } from "@/components/shared/layout/card-header-section";
import { ROUTE } from "@/constants/routes";
import { StaffRespondModel } from "@/model/user/staff/staff.respond.model";
import { getStaffByIdService } from "@/service/user/user.service";
import { useParams } from "next/navigation";
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

export default function AdminDetailPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [admin, setAdmin] = React.useState<StaffRespondModel | null>(null);
  const params = useParams();
  const adminId = params.id as string;

  useEffect(() => {
    const loadAdmin = async () => {
      setIsLoading(true);
      try {
        const response = await getStaffByIdService(adminId);
        if (response) setAdmin(response);
        else toast.error("Error getting admin data");
      } catch {
        toast.error("Error getting admin data");
      } finally {
        setIsLoading(false);
      }
    };
    loadAdmin();
  }, [adminId]);

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
          { label: "Admins", href: ROUTE.USERS.ADMIN.INDEX },
          { label: "View Admin", href: ROUTE.USERS.ADMIN.ADMIN_VIEW(adminId) },
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
