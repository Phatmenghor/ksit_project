"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import { CardHeaderSection } from "@/components/shared/layout/card-header-section";
import { ROUTE } from "@/constants/routes";
import Loading from "@/components/shared/loading";
import ScheduleForm, {
  ScheduleFormValues,
  ScheduleFormSelections,
} from "@/components/dashboard/manage-schedule/schedule-form";
import { Constants } from "@/constants/text-string";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchScheduleByIdService, updateScheduleThunk } from "@/features/schedules/store/thunks/schedule-thunks";

export default function EditSchedulePage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  // The [classId] segment holds the schedule ID in the edit route
  const scheduleId = Number(params.classId);

  const schedule = useAppSelector((state) => state.scheduleList.selectedSchedule);
  const isLoading = useAppSelector((state) => state.scheduleList.isLoading);

  useEffect(() => {
    if (!scheduleId) return;
    dispatch(fetchScheduleByIdService(scheduleId));
  }, [scheduleId, dispatch]);

  const handleSubmit = async (values: ScheduleFormValues) => {
    try {
      await dispatch(updateScheduleThunk({
        id: scheduleId,
        data: {
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
        }
      })).unwrap();
      toast.success("Schedule updated successfully");
      router.back();
    } catch (error: any) {
      toast.error(error.message || "Failed to update schedule");
    }
  };

  if (isLoading) return <Loading />;
  if (!schedule) return null;

  const defaultValues: Partial<ScheduleFormValues> = {
    classId: schedule.classes?.id ?? 0,
    instructorId: schedule.teacher?.id ?? 0,
    courseId: schedule.course?.id ?? 0,
    day: schedule.day ?? "",
    academyYear: schedule.semester?.academyYear ?? new Date().getFullYear(),
    startTime: schedule.startTime ?? "",
    endTime: schedule.endTime ?? "",
    semesterId: schedule.semester?.id ?? 0,
    roomId: schedule.room?.id ?? 0,
    yearLevel: schedule.yearLevel,
  };

  const defaultSelections: ScheduleFormSelections = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    course: (schedule.course as any) ?? null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    instructor: (schedule.teacher as any) ?? null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    classData: (schedule.classes as any) ?? null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    room: (schedule.room as any) ?? null,
  };

  return (
    <div className="space-y-4">
      <CardHeaderSection
        title="Update Schedule"
        back
        breadcrumbs={[
          { label: "Schedules", href: ROUTE.SCHEDULE.DEPARTMENT },
          { label: "Update Schedule" },
        ]}
      />

      <ScheduleForm
        mode="edit"
        defaultValues={defaultValues}
        defaultSelections={defaultSelections}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </div>
  );
}
