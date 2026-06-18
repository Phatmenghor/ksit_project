"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { CardHeaderSection } from "@/components/shared/layout/card-header-section";
import { ROUTE } from "@/constants/routes";
import ScheduleForm, {
  ScheduleFormValues,
} from "@/components/dashboard/manage-schedule/schedule-form";
import { createScheduleService } from "@/service/schedule/schedule.service";
import { Constants } from "@/constants/text-string";
import { toast } from "sonner";

export default function AddSchedulePage() {
  const router = useRouter();
  const [formKey, setFormKey] = useState(0);

  const handleSubmit = async (values: ScheduleFormValues) => {
    await createScheduleService({
      startTime: values.startTime,
      endTime: values.endTime,
      day: values.day,
      classId: values.classId,
      teacherId: values.instructorId,
      courseId: values.courseId,
      roomId: values.roomId,
      semesterId: values.semesterId,
      status: Constants.ACTIVE,
      yearLevel: values.yearLevel,
    });
    toast.success("Schedule created successfully");
    setFormKey((k) => k + 1);
  };

  return (
    <div className="space-y-4">
      <CardHeaderSection
        title="Add Schedule"
        back
        breadcrumbs={[
          { label: "Schedules", href: ROUTE.SCHEDULE.DEPARTMENT },
          { label: "Add Schedule" },
        ]}
      />

      <ScheduleForm
        key={formKey}
        mode="create"
        defaultValues={{ academyYear: new Date().getFullYear() }}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </div>
  );
}
