"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import { CardHeaderSection } from "@/components/shared/layout/card-header-section";
import { ROUTE } from "@/constants/routes";
import Loading from "@/components/shared/loading";
import ScheduleForm, {
  ScheduleFormValues,
} from "@/components/dashboard/manage-schedule/schedule-form";
import { createScheduleThunk } from "@/features/schedules/store/thunks/schedule-thunks";
import { fetchClassByIdService } from "@/features/master-data/store/thunks/class-thunks";
import { useAppDispatch, useAppSelector } from "@/store";
import { Constants } from "@/constants/text-string";
import { toast } from "sonner";

export default function AddSchedulePage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const classId = Number(params.classId);

  const lockedClass = useAppSelector((state) => state.classes.selectedClass);
  const isLoadingClass = useAppSelector((state) => state.classes.isLoading);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (!classId) return;
    dispatch(fetchClassByIdService(classId));
  }, [classId, dispatch]);

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
      // Remount form to reset all state while keeping the locked class
      setFormKey((k) => k + 1);
    } catch (error: any) {
      toast.error(error.message || "Failed to create schedule");
    }
  };

  if (isLoadingClass) return <Loading />;

  const defaultValues: Partial<ScheduleFormValues> = {
    classId: lockedClass?.id ?? 0,
    academyYear: new Date().getFullYear(),
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
        defaultValues={defaultValues}
        defaultSelections={{ classData: lockedClass }}
        lockedClassData={lockedClass}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </div>
  );
}
