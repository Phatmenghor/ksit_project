"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { BookOpen, Loader2, CalendarDays, Eye, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SelectField,
  CancelButton,
  SubmitButton,
  DateTimePickerField,
} from "@/components/shared/form-field";
import { AcademyYearPicker } from "@/components/shared/academy-year-picker";
import { ComboboxSelectInstructor } from "@/components/shared/ComboBox/combobox-instructor";
import { ComboboxSelectClass } from "@/components/shared/ComboBox/combobox-class";
import { ComboboxSelectRoom } from "@/components/shared/ComboBox/combobox-room";
import { ComboboxSelectCourse } from "@/components/shared/ComboBox/combobox-course";
import { RoomModel } from "@/model/master-data/room/all-room-model";
import { ClassModel } from "@/model/master-data/class/all-class-model";
import { SemesterModel } from "@/model/master-data/semester/semester-model";
import { StaffModel } from "@/model/user/staff/staff.respond.model";
import { CourseModel } from "@/model/master-data/course/all-course-model";
import { DayEnum, StatusEnum, YearLevelEnum } from "@/constants/constant";
import { getAllSemesterService } from "@/service/master-data/semester.service";
import { getAllSimpleScheduleService } from "@/service/schedule/schedule.service";
import { formatSemester } from "@/utils/map-helper/schedule";
import { ScheduleModel } from "@/model/schedules/all-schedule-model";
import SchedulePreviewTable from "./schedule-preview-table";
import ScheduleTeacherTable from "./schedule-teacher-table";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const scheduleFormSchema = z
  .object({
    classId: z.number().min(1, "Class is required"),
    instructorId: z.number().min(1, "Instructor is required"),
    courseId: z.number().min(1, "Course is required"),
    day: z.string().min(1, "Please select a day"),
    academyYear: z
      .number({ required_error: "Academy year is required" })
      .min(2000, "Invalid academy year")
      .max(2100, "Invalid academy year"),
    startTime: z
      .string()
      .min(1, "Please select start time")
      .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    endTime: z
      .string()
      .min(1, "Please select end time")
      .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    semesterId: z.number().min(1, "Semester is required"),
    roomId: z.number().min(1, "Room is required"),
    yearLevel: z.nativeEnum(YearLevelEnum, {
      required_error: "Year level is required",
    }),
  })
  .refine(
    (data) => {
      if (!data.startTime || !data.endTime) return true;
      return (
        new Date(`1970-01-01T${data.endTime}`) >
        new Date(`1970-01-01T${data.startTime}`)
      );
    },
    { message: "End time must be after start time", path: ["endTime"] }
  );

export type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

export interface ScheduleFormSelections {
  course?: CourseModel | null;
  instructor?: StaffModel | null;
  classData?: ClassModel | null;
  room?: RoomModel | null;
}

interface ScheduleFormProps {
  mode: "create" | "edit";
  defaultValues?: Partial<ScheduleFormValues>;
  defaultSelections?: ScheduleFormSelections;
  /** Create mode: async-loaded class that is pre-selected and locked */
  lockedClassData?: ClassModel | null;
  onSubmit: (values: ScheduleFormValues) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

const DAY_OPTIONS = Object.entries(DayEnum).map(([key, value]) => ({
  value: key,
  label: value as string,
}));

const YEAR_LEVEL_OPTIONS = [
  { value: YearLevelEnum.FIRST_YEAR, label: "Year 1" },
  { value: YearLevelEnum.SECOND_YEAR, label: "Year 2" },
  { value: YearLevelEnum.THIRD_YEAR, label: "Year 3" },
  { value: YearLevelEnum.FOURTH_YEAR, label: "Year 4" },
];

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-center gap-2 pb-3 border-b border-border/60 mb-4">
      <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}

export default function ScheduleForm({
  mode,
  defaultValues,
  defaultSelections,
  lockedClassData,
  onSubmit,
  onCancel,
  submitLabel,
}: ScheduleFormProps) {
  const [semesters, setSemesters] = useState<SemesterModel[]>([]);
  const [isLoadingSemesters, setIsLoadingSemesters] = useState(false);
  const [schedulePreviewData, setSchedulePreviewData] = useState<ScheduleModel[]>([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState<CourseModel | null>(
    defaultSelections?.course ?? null
  );
  const [selectedInstructor, setSelectedInstructor] = useState<StaffModel | null>(
    defaultSelections?.instructor ?? null
  );
  const [selectedClass, setSelectedClass] = useState<ClassModel | null>(
    defaultSelections?.classData ?? null
  );
  const [selectedRoom, setSelectedRoom] = useState<RoomModel | null>(
    defaultSelections?.room ?? null
  );

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      classId: 0,
      instructorId: 0,
      courseId: 0,
      day: "",
      academyYear: new Date().getFullYear(),
      startTime: "",
      endTime: "",
      semesterId: 0,
      roomId: 0,
      yearLevel: undefined,
      ...defaultValues,
    },
  });

  const watchedAcademyYear = form.watch("academyYear");
  const watchedClassId = form.watch("classId");
  const watchedInstructorId = form.watch("instructorId");
  const watchedSemesterId = form.watch("semesterId");

  // Sync async-loaded locked class (create mode)
  useEffect(() => {
    if (!lockedClassData) return;
    setSelectedClass(lockedClassData);
    form.setValue("classId", lockedClassData.id, { shouldValidate: true });
  }, [lockedClassData, form]);

  const getSemesterEnum = useCallback(
    (id: number) => {
      const semester = semesters.find((s) => s.id === id);
      return semester?.semester || "SEMESTER_1";
    },
    [semesters]
  );

  const loadSemesters = useCallback(async (year: number) => {
    if (!year) return;
    let cancelled = false;
    setIsLoadingSemesters(true);
    try {
      const result = await getAllSemesterService({
        academyYear: year,
        status: StatusEnum.ACTIVE,
        pageSize: 100,
        pageNo: 1,
      });
      if (!cancelled) {
        setSemesters(result?.content ?? []);
        if (!result?.content?.length) {
          toast.warning("No semesters found for the selected year");
        }
      }
    } catch {
      if (!cancelled) {
        toast.error("Failed to load semesters");
        setSemesters([]);
      }
    } finally {
      if (!cancelled) setIsLoadingSemesters(false);
    }
    return () => { cancelled = true; };
  }, []);

  // Load semesters on mount for the current/default year
  useEffect(() => {
    if (watchedAcademyYear > 0) {
      loadSemesters(watchedAcademyYear);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPreview = useCallback(
    async (
      classId: number,
      instructorId: number,
      semesterId: number,
      academyYear: number
    ) => {
      const hasClass = classId > 0;
      const hasInstructor = instructorId > 0;
      if (!hasClass && !hasInstructor) {
        setSchedulePreviewData([]);
        return;
      }
      setIsLoadingPreview(true);
      try {
        const semester = semesterId > 0 ? getSemesterEnum(semesterId) : undefined;
        const res = await getAllSimpleScheduleService({
          classId: hasClass ? classId : undefined,
          teacherId: hasInstructor ? instructorId : undefined,
          ...(academyYear > 0 ? { academyYear } : {}),
          ...(semester ? { semester } : {}),
          status: StatusEnum.ACTIVE,
        });
        setSchedulePreviewData(res ?? []);
      } catch {
        setSchedulePreviewData([]);
      } finally {
        setIsLoadingPreview(false);
      }
    },
    [getSemesterEnum]
  );

  useEffect(() => {
    if (watchedClassId > 0 || watchedInstructorId > 0) {
      fetchPreview(watchedClassId, watchedInstructorId, watchedSemesterId, watchedAcademyYear);
    } else {
      setSchedulePreviewData([]);
    }
  }, [watchedClassId, watchedInstructorId, watchedSemesterId, watchedAcademyYear, fetchPreview]);

  const handleYearChange = (year: number) => {
    form.setValue("academyYear", year, { shouldValidate: true });
    form.setValue("semesterId", 0);
    setSemesters([]);
    loadSemesters(year);
  };

  const handleCourseChange = (course: CourseModel) => {
    setSelectedCourse(course);
    form.setValue("courseId", course.id, { shouldValidate: true });
  };

  const handleInstructorChange = (instructor: StaffModel) => {
    setSelectedInstructor(instructor);
    form.setValue("instructorId", instructor.id, { shouldValidate: true });
  };

  const handleClassChange = (classData: ClassModel) => {
    setSelectedClass(classData);
    form.setValue("classId", classData.id, { shouldValidate: true });
  };

  const handleRoomChange = (room: RoomModel) => {
    setSelectedRoom(room);
    form.setValue("roomId", room.id, { shouldValidate: true });
  };

  const isCreate = mode === "create";
  const label = submitLabel ?? (isCreate ? "Create Schedule" : "Update Schedule");
  const { errors, isSubmitting } = form.formState;

  const showPreview = watchedClassId > 0 || watchedInstructorId > 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        {/* Single form card */}
        <Card className="border border-border/60 shadow-sm">
          <CardContent className="p-6 space-y-6">

            {/* Section — Class & Instructor */}
            <div>
              <SectionHeader icon={Users} title="Class & Instructor" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="classId"
                  render={() => (
                    <FormItem className="flex flex-col gap-1 w-full space-y-0">
                      <FormLabel className="text-sm font-medium text-foreground">
                        Class <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <ComboboxSelectClass
                          dataSelect={selectedClass}
                          onChangeSelected={handleClassChange}
                          disabled={isCreate && !!lockedClassData}
                        />
                      </FormControl>
                      {isCreate && lockedClassData && (
                        <p className="text-xs text-muted-foreground">
                          Pre-selected from class list
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instructorId"
                  render={() => (
                    <FormItem className="flex flex-col gap-1 w-full space-y-0">
                      <FormLabel className="text-sm font-medium text-foreground">
                        Instructor <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <ComboboxSelectInstructor
                          dataSelect={selectedInstructor}
                          onChangeSelected={handleInstructorChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Section — Course & Year Level */}
            <div>
              <SectionHeader icon={BookOpen} title="Course & Year Level" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="courseId"
                  render={() => (
                    <FormItem className="flex flex-col gap-1 w-full space-y-0">
                      <FormLabel className="text-sm font-medium text-foreground">
                        Course <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <ComboboxSelectCourse
                          dataSelect={selectedCourse}
                          onChangeSelected={handleCourseChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <SelectField
                  name="yearLevel"
                  label="Year Level"
                  control={form.control}
                  options={YEAR_LEVEL_OPTIONS}
                  error={errors.yearLevel}
                  required
                  placeholder="Select year level"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Section — Scheduling */}
            <div>
              <SectionHeader icon={CalendarDays} title="Scheduling" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="academyYear"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-1 w-full space-y-0">
                      <FormLabel className="text-sm font-medium text-foreground">
                        Academy Year <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <AcademyYearPicker
                          value={field.value}
                          onChange={handleYearChange}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="semesterId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-1 w-full space-y-0">
                      <FormLabel className="text-sm font-medium text-foreground">
                        Semester <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value > 0 ? field.value.toString() : ""}
                        disabled={isLoadingSemesters || semesters.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue
                              placeholder={
                                isLoadingSemesters
                                  ? "Loading..."
                                  : semesters.length === 0
                                  ? "No semesters available"
                                  : "Select semester"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {semesters.map((semester) => (
                            <SelectItem
                              key={semester.id}
                              value={(semester.id ?? "").toString()}
                            >
                              {formatSemester(semester.semester)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <SelectField
                  name="day"
                  label="Day"
                  control={form.control}
                  options={DAY_OPTIONS}
                  error={errors.day}
                  required
                  placeholder="Select a day"
                  disabled={isSubmitting}
                />

                <FormField
                  control={form.control}
                  name="roomId"
                  render={() => (
                    <FormItem className="flex flex-col gap-1 w-full space-y-0">
                      <FormLabel className="text-sm font-medium text-foreground">
                        Room <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <ComboboxSelectRoom
                          dataSelect={selectedRoom}
                          onChangeSelected={handleRoomChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DateTimePickerField
                  name="startTime"
                  label="Start Time"
                  control={form.control}
                  error={errors.startTime}
                  mode="time"
                  required
                  disabled={isSubmitting}
                  placeholder="Select start time"
                />

                <DateTimePickerField
                  name="endTime"
                  label="End Time"
                  control={form.control}
                  error={errors.endTime}
                  mode="time"
                  required
                  disabled={isSubmitting}
                  placeholder="Select end time"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-border/60">
              <p className="text-xs text-muted-foreground">
                <span className="text-red-500">*</span> Required fields
              </p>
              <div className="flex items-center gap-2">
                <CancelButton onClick={onCancel} disabled={isSubmitting} />
                <SubmitButton
                  isSubmitting={isSubmitting}
                  isCreate={isCreate}
                  createText={label}
                  updateText={label}
                  submittingCreateText="Creating..."
                  submittingUpdateText="Updating..."
                  className="bg-teal-900 hover:bg-teal-950 text-white h-9 px-5"
                />
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Preview — Class Schedule */}
        {watchedClassId > 0 && (
          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-3 px-6 pt-5">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
                  <BookOpen className="w-4 h-4 text-primary" />
                </div>
                Class Schedule
                {isLoadingPreview && (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground ml-1" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-5">
              {!isLoadingPreview && (
                <SchedulePreviewTable
                  scheduleList={schedulePreviewData.filter((s) => s.classes?.id === watchedClassId)}
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* Preview — Instructor Schedule */}
        {watchedInstructorId > 0 && (
          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-3 px-6 pt-5">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                Instructor Schedule
                {isLoadingPreview && (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground ml-1" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-5">
              {!isLoadingPreview && (
                <ScheduleTeacherTable
                  scheduleList={schedulePreviewData.filter((s) => s.teacher?.id === watchedInstructorId)}
                />
              )}
            </CardContent>
          </Card>
        )}

      </form>
    </Form>
  );
}
