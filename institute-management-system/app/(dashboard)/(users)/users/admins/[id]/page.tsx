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
  const [isLoading, setIsLoading] = React.useState(false);
  const [admin, setAdmin] = React.useState<StaffRespondModel | null>(null);
  const params = useParams();
  const adminId = params.id as string;

  const loadAdmin = async () => {
    setIsLoading(true);
    try {
      const response = await getStaffByIdService(adminId);
      if (response) {
        setAdmin(response);
      } else {
        toast.error("Error getting admin data");
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdmin();
  }, [adminId]);

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
