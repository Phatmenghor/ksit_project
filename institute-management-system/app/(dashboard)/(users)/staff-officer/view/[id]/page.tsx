"use client";
import { UserProfileSection } from "@/components/dashboard/users/shared/user-profile";
import { CardHeaderSection } from "@/components/shared/layout/card-header-section";
import { ROUTE } from "@/constants/routes";
import React, { useEffect } from "react";
import { useParams } from "next/navigation";
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
import { getStaffByIdService } from "@/service/user/user.service";

export default function StaffViewPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [staff, setStaff] = React.useState<StaffRespondModel | null>(null);
  const params = useParams();
  const staffId = params.id as string;

  const loadStaff = async () => {
    setIsLoading(true);
    try {
      const response = await getStaffByIdService(staffId);
      if (response) {
        setStaff(response);
      } else {
        toast.error("Error getting staff data");
      }
    } catch (error) {
      console.error("Error fetching staff data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, [staffId]);

  return (
    <div>
      {/* Header with TabsList injected via prop */}
      <CardHeaderSection
        title="Staff View Details"
        back
        breadcrumbs={[
          { label: "Dashboard", href: ROUTE.DASHBOARD },
          { label: "View Staff", href: ROUTE.USERS.VIEW_STAFF(staffId) },
        ]}
      />

      {/* Tab Content outside the header */}
      <div className="mt-4 space-y-4">
        <UserProfileSection user={staff} />
        <TeacherPersonal teacher={staff} />
        <TeacherProfessionalRank teacher={staff} />
        <TeacherExperienceSection teacher={staff?.teacherExperience || null} />
        <TeacherPraiseOrCriticismSection
          teacher={staff?.teacherPraiseOrCriticism || null}
        />
        <TeacherEducationSection teacher={staff?.teacherEducation || null} />
        <TeacherVocationalSection teacher={staff?.teacherVocational || null} />
        <TeacherShortCourseSection
          teacher={staff?.teacherShortCourse || null}
        />
        <TeacherLanguageSection teacher={staff?.teacherLanguage || null} />{" "}
        <TeacherFamilySection
          familyStatus={staff}
          teacher={staff?.teacherFamily || null}
        />{" "}
      </div>
    </div>
  );
}
