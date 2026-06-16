"use client";

import { useParams } from "next/navigation";
import { CourseForm } from "@/components/dashboard/master-data/manage-course/course-form";

export default function EditCoursePage() {
  const params = useParams();
  const courseId = params?.id ? Number(params.id) : undefined;
  return <CourseForm courseId={courseId} />;
}
