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
import { fetchStaffByIdService } from "@/features/users/store/thunks/staff-thunks";
import { selectSelectedStaff } from "@/features/users/store/selectors/staff-selectors";

export default function StaffViewPage() {
  const dispatch = useAppDispatch();
  const staff = useAppSelector(selectSelectedStaff);
  const isLoading = useAppSelector((state) => state.staff.operations.isFetchingDetail);
  const params = useParams();
  const staffId = params.id as string;

  useEffect(() => {
    if (staffId) {
      dispatch(fetchStaffByIdService(staffId));
    }
  }, [staffId, dispatch]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Staff not found.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header with TabsList injected via prop */}
      <CardHeaderSection
        title="Staff View Details"
        back
        breadcrumbs={[
          { label: "Dashboard", href: ROUTE.DASHBOARD },
          { label: "Staff", href: ROUTE.USERS.STUFF_OFFICER },
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
