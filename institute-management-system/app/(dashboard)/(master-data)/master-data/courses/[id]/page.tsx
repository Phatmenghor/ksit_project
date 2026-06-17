"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { DetialCourseModel } from "@/model/master-data/course/type-course-model";
import { DetailCourseService } from "@/service/master-data/course.service";
import { CardHeaderSection } from "@/components/shared/layout/card-header-section";
import { ROUTE } from "@/constants/routes";
import { DateTimeFormatter } from "@/utils/date/date-time-format";
import { Separator } from "@/components/ui/separator";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [courseData, setCourseData] = useState<DetialCourseModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const courseId = params?.id ? Number(params.id) : null;

  useEffect(() => {
    if (!courseId) return;
    setIsLoading(true);
    DetailCourseService(courseId)
      .then((data) => { if (data) setCourseData(data); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [courseId]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Course not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CardHeaderSection
        back
        title="Course Detail"
        breadcrumbs={[
          { label: "Dashboard", href: ROUTE.DASHBOARD },
          { label: "Courses", href: ROUTE.MASTER_DATA.COURSES.INDEX },
          { label: "Detail", href: "" },
        ]}
      />

      {/* Main info */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">{courseData.nameEn || courseData.nameKH}</h2>
            {courseData.nameKH && courseData.nameEn && (
              <p className="text-sm text-muted-foreground">{courseData.nameKH}</p>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-x-8 gap-y-3 md:grid-cols-3">
            <Field label="Course Code" value={courseData.code} />
            <Field label="Department" value={courseData.department?.name} />
            <Field label="Subject Type" value={courseData.subject?.name} />
            <Field label="Instructor" value={courseData.user?.username} />
            <Field label="Status" value={courseData.status} />
            <Field label="Created At" value={DateTimeFormatter(courseData.createdAt)} />
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
            <Field label="Credit" value={courseData.credit} />
            <Field label="Theory" value={courseData.theory} />
            <Field label="Execute" value={courseData.execute} />
            <Field label="Apply" value={courseData.apply} />
            <Field label="Total Hours" value={courseData.totalHour} />
          </div>
        </CardContent>
      </Card>

      {/* Text sections */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <TextSection title="Description" content={courseData.description} />
        <TextSection title="Purpose" content={courseData.purpose} />
        <TextSection title="Expected Outcome" content={courseData.expectedOutcome} />
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-medium">{value ?? "—"}</p>
    </div>
  );
}

function TextSection({ title, content }: { title: string; content?: string }) {
  return (
    <Card>
      <CardContent className="p-5 space-y-2">
        <p className="text-sm font-semibold">{title}</p>
        <Separator />
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
          {content || "—"}
        </p>
      </CardContent>
    </Card>
  );
}
