import React from "react";
import StudentPersonalDetailSection from "../add-single-student/student-personal-detail";
import StudentFamilyBackgroundSection from "../add-single-student/student-family-background";
import { StudentStudiesHistorySection } from "../add-single-student/student-studies-histories";

export default function StudentFormDetail() {
  return (
    <div className="space-y-5">
      <StudentPersonalDetailSection />

      <StudentStudiesHistorySection />

      <StudentFamilyBackgroundSection />
    </div>
  );
}
