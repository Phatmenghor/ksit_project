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
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchStaffProfileThunk } from "@/store/slices/auth-slice";

export default function AdminProfilePage() {
  const dispatch = useAppDispatch();
  const admin = useAppSelector((state) => state.auth.staffProfile);
  const isLoading = useAppSelector((state) => state.auth.isProfileLoading);
  const params = useParams();
  const adminId = params.id as string;

  const loadAdmin = async () => {
    try {
      await dispatch(fetchStaffProfileThunk()).unwrap();
    } catch (error: any) {
      toast.error(error || "Error getting admin data");
    }
  };

  useEffect(() => {
    loadAdmin();
  }, [adminId]);

  return (
    <div>
      {/* Header with TabsList injected via prop */}
      <CardHeaderSection
        title="My Profile"
        back
        breadcrumbs={[
          { label: "Dashboard", href: ROUTE.DASHBOARD },
          {
            label: "View Admin",
            href: ROUTE.USERS.ADMIN.ADMIN_VIEW(adminId),
          },
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
