import React from "react";
import StudentPersonalInfo from "../section/student-personal-info";
import StudentStudyHistory from "../section/student-studies-histories";
import StudentFamily from "../section/student-family";
import { StudentByIdModel } from "@/model/user/student/student.respond.model";

export default function StudentDetailsTabs({
  studentDetail,
}: {
  studentDetail: StudentByIdModel | null;
}) {
  return (
    <div className="space-y-5">
      <StudentPersonalInfo student={studentDetail} />
      <StudentStudyHistory student={studentDetail} />
      <StudentFamily student={studentDetail} />
    </div>
  );
}
