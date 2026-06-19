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

export default function TeacherViewPage() {
  const dispatch = useAppDispatch();
  const teacher = useAppSelector(selectSelectedStaff);
  const isLoading = useAppSelector((state) => state.staff.operations.isFetchingDetail);
  const params = useParams();
  const teacherId = params.id as string;

  useEffect(() => {
    if (teacherId) {
      dispatch(fetchStaffByIdService(teacherId));
    }
  }, [teacherId, dispatch]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Teacher not found.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header with TabsList injected via prop */}
      <CardHeaderSection
        title="Teacher View Details"
        back
        breadcrumbs={[
          { label: "Dashboard", href: ROUTE.DASHBOARD },
          { label: "View Teacher", href: ROUTE.USERS.VIEW_TEACHER(teacherId) },
        ]}
      />

      {/* Tab Content outside the header */}
      <div className="mt-4 space-y-4">
        <UserProfileSection user={teacher} />
        <TeacherPersonal teacher={teacher} />
        <TeacherProfessionalRank teacher={teacher} />
        <TeacherExperienceSection
          teacher={teacher?.teacherExperience || null}
        />
        <TeacherPraiseOrCriticismSection
          teacher={teacher?.teacherPraiseOrCriticism || null}
        />
        <TeacherEducationSection teacher={teacher?.teacherEducation || null} />
        <TeacherVocationalSection
          teacher={teacher?.teacherVocational || null}
        />
        <TeacherShortCourseSection
          teacher={teacher?.teacherShortCourse || null}
        />
        <TeacherLanguageSection teacher={teacher?.teacherLanguage || null} />{" "}
        <TeacherFamilySection
          familyStatus={teacher}
          teacher={teacher?.teacherFamily || null}
        />{" "}
      </div>
    </div>
  );
}
