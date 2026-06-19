"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { CardHeaderSection } from "@/components/shared/layout/card-header-section";
import { ROUTE } from "@/constants/routes";
import ScheduleForm, {
  ScheduleFormValues,
} from "@/components/dashboard/manage-schedule/schedule-form";
import { createScheduleThunk } from "@/features/schedules/store/thunks/schedule-thunks";
import { useAppDispatch } from "@/store";
import { Constants } from "@/constants/text-string";
import { toast } from "sonner";

export default function AddSchedulePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [formKey, setFormKey] = useState(0);

  const handleSubmit = async (values: ScheduleFormValues) => {
    try {
      await dispatch(createScheduleThunk({
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
      })).unwrap();
      toast.success("Schedule created successfully");
      setFormKey((k) => k + 1);
    } catch (error: any) {
      toast.error(error.message || "Failed to create schedule");
    }
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
