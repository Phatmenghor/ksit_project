"use client";
import { UserProfileSection } from "@/components/dashboard/users/shared/user-profile";
import { CardHeaderSection } from "@/components/shared/layout/card-header-section";
import { ROUTE } from "@/constants/routes";
import React, { Suspense, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { StaffRespondModel } from "@/model/user/staff/staff.respond.model";
import { getStaffByTokenService } from "@/service/user/user.service";
import { useIsMobile } from "@/components/ui/use-mobile";

export default function TeacherViewPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [teacher, setTeacher] = React.useState<StaffRespondModel | null>(null);
  const params = useParams();
  const teacherId = params.id as string;
  const isMobile = useIsMobile();

  const loadTeacher = async () => {
    setIsLoading(true);
    try {
      const response = await getStaffByTokenService();
      if (response) {
        setTeacher(response);
      } else {
        toast.error("Error getting teacher data");
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeacher();
  }, [teacherId]);

  const renderContent = () => (
    <div className={`mt-4 space-y-4 ${isMobile ? "w-full px-0" : ""}`}>
      <UserProfileSection user={teacher} />
      <TeacherPersonal teacher={teacher} />
      <TeacherProfessionalRank teacher={teacher} />
      <TeacherExperienceSection teacher={teacher?.teacherExperience || null} />
      <TeacherPraiseOrCriticismSection
        teacher={teacher?.teacherPraiseOrCriticism || null}
      />
      <TeacherEducationSection teacher={teacher?.teacherEducation || null} />
      <TeacherVocationalSection teacher={teacher?.teacherVocational || null} />
      <TeacherShortCourseSection
        teacher={teacher?.teacherShortCourse || null}
      />
      <TeacherLanguageSection teacher={teacher?.teacherLanguage || null} />
      <TeacherFamilySection
        familyStatus={teacher}
        teacher={teacher?.teacherFamily || null}
      />
    </div>
  );

  return (
    <div className={isMobile ? "w-full" : ""}>
      {/* Header with different breadcrumbs for mobile/desktop */}
      <CardHeaderSection
        title="My Profile"
        back
        breadcrumbs={
          isMobile
            ? [
                { label: "Dashboard", href: ROUTE.DASHBOARD },
                { label: "Teacher view" },
              ]
            : [
                { label: "Dashboard", href: ROUTE.DASHBOARD },
                {
                  label: "View Teacher",
                  href: ROUTE.USERS.VIEW_TEACHER(teacherId),
                },
              ]
        }
      />
      {/* Content - full width on mobile */}
      {renderContent()}
    </div>
  );
}
