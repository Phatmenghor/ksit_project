import React from "react";
import PersonalHistoryForm from "../detail-section/teacher-personal-info";
import ExperienceForm from "../detail-section/teacher-experiences";
import PraiseCriticismForm from "../detail-section/teacher-praise-or-criticisms";
import ShortCourseForm from "../detail-section/teacher-short-courses";
import LanguageForm from "../detail-section/teacher-languages";
import FamilyStatusForm from "../detail-section/teacher-families";
import VocationalForm from "../detail-section/teacher-vocational";
import EducatonForm from "../detail-section/teacher-education";
import EducationForm from "../detail-section/teacher-professional-ranks";

export default function FormDetail() {
  return (
    <div className="space-y-5">
      <PersonalHistoryForm />

      <EducationForm />

      <ExperienceForm />

      <PraiseCriticismForm />

      <EducatonForm />

      <VocationalForm />

      <ShortCourseForm />

      <LanguageForm />

      <FamilyStatusForm />
    </div>
  );
}
