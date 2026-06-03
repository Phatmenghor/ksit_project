"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROUTE } from "@/constants/routes";
import { ComboboxSelectInstructor } from "@/components/shared/ComboBox/combobox-instructor";
import { ComboboxSelectClass } from "@/components/shared/ComboBox/combobox-class";
import { ComboboxSelectRoom } from "@/components/shared/ComboBox/combobox-room";
import { YearSelector } from "@/components/shared/year-selector";
import { RoomModel } from "@/model/master-data/room/all-room-model";
import { ClassModel } from "@/model/master-data/class/all-class-model";
import { SemesterModel } from "@/model/master-data/semester/semester-model";
import { StaffModel } from "@/model/user/staff/staff.respond.model";
import { DayEnum, StatusEnum, YearLevelEnum } from "@/constants/constant";
import { Constants } from "@/constants/text-string";
import {
  createScheduleService,
  getAllSimpleScheduleService,
} from "@/service/schedule/schedule.service";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { getAllSemesterService } from "@/service/master-data/semester.service";
import SchedulePreviewTable from "@/components/dashboard/manage-schedule/schedule-preview-table";
import ScheduleTeacherTable from "@/components/dashboard/manage-schedule/schedule-teacher-table";
import { ScheduleModel } from "@/model/schedules/all-schedule-model";
import { AppIcons } from "@/constants/icons/icon";
import { ComboboxSelectCourse } from "@/components/shared/ComboBox/combobox-course";
import { CourseModel } from "@/model/master-data/course/all-course-model";
import { getClassByIdService } from "@/service/master-data/class.service";

// Enhanced form schema with better validation
const formSchema = z
  .object({
    classId: z.number().min(0, "Class is required"),
    instructorId: z.number().min(0, "Instructor is required"),
    courseId: z.number().min(1, "Subject type is required"),
    day: z.string().min(1, "Please select a day"),
    academyYear: z
      .number({
        required_error: "Academy year is required",
      })
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
    semesterId: z.number().min(0, "Semester is required"),
    roomId: z.number().min(1, "Room is required"),
    status: z.literal(Constants.ACTIVE),
    yearLevel: z.nativeEnum(YearLevelEnum, {
      required_error: "Year level is required",
    }),
  })
  .refine(
    (data) => {
      // Validate that end time is after start time
      const start = new Date(`1970-01-01T${data.startTime}`);
      const end = new Date(`1970-01-01T${data.endTime}`);
      return end > start;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  );

// Custom hook for managing form selections
const useFormSelections = () => {
  const [selectedCourse, setSelectedCourse] = useState<CourseModel | null>(
    null
  );
  const [selectedInstructor, setSelectedInstructor] =
    useState<StaffModel | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassModel | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomModel | null>(null);

  const resetSelections = useCallback(() => {
    setSelectedCourse(null);
    setSelectedInstructor(null);
    // FIXED: Don't reset selected class since it's fixed for this page
    // setSelectedClass(null);
    setSelectedRoom(null);
  }, []);

  return {
    selectedCourse,
    setSelectedCourse,
    selectedInstructor,
    setSelectedInstructor,
    selectedClass,
    setSelectedClass,
    selectedRoom,
    setSelectedRoom,
    resetSelections,
  };
};

export default function AddSchedule() {
  // State management
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSemesters, setIsLoadingSemesters] = useState(false);
  const [isSchedulePreviewAvailable, setIsSchedulePreviewAvailable] =
    useState(false);
  const [isTeacherPreviewAvailable, setIsTeacherPreviewAvailable] =
    useState(false);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
  const [scheduleData, setScheduleData] = useState<ScheduleModel[]>([]);
  const [semesters, setSemesters] = useState<SemesterModel[]>([]);
  const [isLoadingClass, setIsLoadingClass] = useState(false);
  const [initialClass, setInitialClass] = useState<ClassModel | null>(null);
  const params = useParams();
  const classId = params?.classId ? Number(params.classId) : null;

  const router = useRouter();
  const selections = useFormSelections();

  // Form setup with better default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      classId: classId || 0, // Use classId from params
      instructorId: 0,
      courseId: 0,
      day: "",
      academyYear: new Date().getFullYear(),
      startTime: "",
      endTime: "",
      semesterId: 0,
      roomId: 0,
      status: Constants.ACTIVE,
      // Remove yearLevel default to force user selection
    },
    mode: "onChange",
  });

  // Watch form values for reactive updates - separate watches for better reactivity
  const watchedAcademyYear = form.watch("academyYear");
  const watchedClassId = form.watch("classId");
  const watchedInstructorId = form.watch("instructorId");
  const watchedSemesterId = form.watch("semesterId");

  // Memoized semester enum lookup
  const getSemesterEnum = useCallback(
    (id: number) => {
      const semester = semesters.find((s) => s.id === id);
      return semester?.semester || "SEMESTER_1";
    },
    [semesters]
  );

  const fetchClass = useCallback(async () => {
    if (classId === null) return;
    setIsLoadingClass(true);
    try {
      const result = await getClassByIdService(Number(classId));

      if (!result) {
        console.error("No data returned from getClassByIdService");
        return;
      }
      console.log("#classId: ", result);
      setInitialClass(result);
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setIsLoadingClass(false);
    }
  }, [classId]);

  // Effect for semester fetching
  useEffect(() => {
    fetchClass();
  }, [fetchClass]);

  useEffect(() => {
    if (initialClass && !form.getValues("classId")) {
      form.setValue("classId", initialClass.id, {
        shouldValidate: true,
        shouldDirty: true,
      });
      selections.setSelectedClass(initialClass);
    }
  }, [initialClass, form, selections]);

  // Optimized semester fetching with proper cleanup
  const fetchSemesters = useCallback(async (academyYear: number) => {
    if (!academyYear) return;

    setIsLoadingSemesters(true);
    try {
      const result = await getAllSemesterService({
        academyYear,
        status: StatusEnum.ACTIVE,
      });

      if (result?.content) {
        setSemesters(result.content);
      } else {
        setSemesters([]);
        toast.warning("No semesters found for the selected year");
      }
    } catch (error) {
      console.error("Error fetching semesters:", error);
      toast.error("Failed to load semesters");
      setSemesters([]);
    } finally {
      setIsLoadingSemesters(false);
    }
  }, []);

  // Optimized schedule fetching with proper loading states
  const fetchSchedule = useCallback(
    async (
      classId: number,
      instructorId: number,
      semesterId: number,
      academyYear: number
    ) => {
      if (semesterId === 0 || academyYear === 0) {
        setScheduleData([]);
        return;
      }

      // Must have either classId or instructorId (but not both as 0)
      const hasValidClassId = classId && classId > 0;
      const hasValidInstructorId = instructorId && instructorId > 0;

      if (!hasValidClassId && !hasValidInstructorId) {
        setScheduleData([]);
        return;
      }

      console.log("Fetching schedule with:", {
        classId,
        instructorId,
        semesterId,
        academyYear,
      });

      setIsLoadingSchedule(true);
      try {
        let res = null;
        const semester = getSemesterEnum(semesterId);

        // Priority: If both are selected, use instructor first
        if (hasValidInstructorId) {
          console.log("Fetching by instructor:", instructorId);
          res = await getAllSimpleScheduleService({
            classId: hasValidClassId ? classId : undefined, // Include classId if valid
            teacherId: instructorId,
            academyYear,
            semester,
            status: StatusEnum.ACTIVE,
          });
          setIsTeacherPreviewAvailable(true);
          console.log("Instructor Schedule Preview: ", res);
        } else if (hasValidClassId) {
          console.log("Fetching by class:", classId);
          res = await getAllSimpleScheduleService({
            classId,
            academyYear,
            semester,
            status: StatusEnum.ACTIVE,
          });
          console.log("Class Schedule Preview: ", res);
          setIsSchedulePreviewAvailable(true);
        }

        console.log("Schedule API response:", res);
        setScheduleData(res);
      } catch (error) {
        console.error("Failed to fetch schedule", error);
        toast.error("Failed to load schedule preview");
        setScheduleData([]);
      } finally {
        setIsLoadingSchedule(false);
      }
    },
    [getSemesterEnum]
  );

  // Effect for semester fetching
  useEffect(() => {
    if (watchedAcademyYear && watchedAcademyYear > 0) {
      fetchSemesters(watchedAcademyYear);
      // Reset semester selection when academy year changes
      form.setValue("semesterId", 0);
    }
  }, [watchedAcademyYear, fetchSemesters, form]);

  // Effect for schedule fetching - trigger immediately when dependencies change
  useEffect(() => {
    const hasValidSemester = watchedSemesterId > 0;
    const hasValidYear = watchedAcademyYear > 0;
    const hasValidClassId = watchedClassId > 0;
    const hasValidInstructorId = watchedInstructorId > 0;
    const hasSemesters = semesters.length > 0;

    if (
      hasValidSemester &&
      hasValidYear &&
      hasSemesters &&
      (hasValidClassId || hasValidInstructorId)
    ) {
      fetchSchedule(
        watchedClassId,
        watchedInstructorId,
        watchedSemesterId,
        watchedAcademyYear
      );
    } else {
      setScheduleData([]);
    }
  }, [
    watchedClassId,
    watchedInstructorId,
    watchedSemesterId,
    watchedAcademyYear,
    semesters.length,
    fetchSchedule, // Add fetchSchedule to dependencies
  ]);

  // Enhanced form submission with better error handling and form reset
  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    try {
      const scheduleData = {
        startTime: values.startTime,
        endTime: values.endTime,
        day: values.day,
        academyYear: values.academyYear,
        classId: Number(classId),
        teacherId: values.instructorId,
        courseId: values.courseId,
        roomId: values.roomId,
        semesterId: values.semesterId,
        status: values.status,
        yearLevel: values.yearLevel,
      };

      const response = await createScheduleService(scheduleData);

      console.log("#Submit schedule", response);
      if (response) {
        toast.success("Schedule created successfully!");

        // STEP 1: Clear all form errors first
        form.clearErrors();

        // STEP 2: Reset selections immediately
        selections.resetSelections();

        // STEP 3: Clear schedule preview data
        setScheduleData([]);
        setIsSchedulePreviewAvailable(false);
        setIsTeacherPreviewAvailable(false);

        // STEP 4: Reset form with proper default values
        const defaultFormValues = {
          classId: Number(classId), // Keep the class ID since it's from params
          instructorId: 0,
          courseId: 0,
          day: "",
          academyYear: new Date().getFullYear(),
          startTime: "",
          endTime: "",
          semesterId: 0,
          roomId: 0,
          status: Constants.ACTIVE,
          yearLevel: YearLevelEnum.FIRST_YEAR, // Set to a valid default instead of undefined
        };

        form.reset(defaultFormValues, {
          keepErrors: false,
          keepDirty: false,
          keepIsSubmitted: false,
          keepTouched: false,
          keepIsValid: false,
          keepSubmitCount: false,
        });

        // STEP 5: Force clear any remaining validation states
        setTimeout(() => {
          form.clearErrors();
          // Set the class back to initial class if available
          if (initialClass) {
            form.setValue("classId", initialClass.id, {
              shouldValidate: false, // Don't validate immediately
              shouldDirty: false,
            });
            selections.setSelectedClass(initialClass);
          }
          // Clear yearLevel back to undefined after reset to force user selection
          form.setValue("yearLevel", undefined as any, {
            shouldValidate: false,
            shouldDirty: false,
          });
        }, 100);
      } else {
        throw new Error("Failed to create schedule");
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "Failed to create schedule";
      toast.error(errorMessage);
      console.error("Error creating schedule:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCourseChange = useCallback(
    (course: CourseModel) => {
      selections.setSelectedCourse(course);
      form.setValue("courseId", course.id, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [selections, form]
  );

  const handleInstructorChange = useCallback(
    (instructor: StaffModel) => {
      console.log("Instructor changed:", instructor);
      selections.setSelectedInstructor(instructor);
      form.setValue("instructorId", instructor.id, {
        shouldValidate: true,
        shouldDirty: true,
      });
      form.trigger("instructorId");
    },
    [selections, form]
  );

  const handleClassChange = useCallback(
    (classData: ClassModel) => {
      console.log("Class changed:", classData);
      selections.setSelectedClass(classData);
      form.setValue("classId", classData.id, {
        shouldValidate: true,
        shouldDirty: true,
      });
      form.trigger("classId");
    },
    [selections, form]
  );

  const handleRoomChange = useCallback(
    (room: RoomModel) => {
      selections.setSelectedRoom(room);
      form.setValue("roomId", room.id, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [selections, form]
  );

  const handleYearChange = useCallback(
    (year: number) => {
      form.setValue("academyYear", year, {
        shouldValidate: true,
        shouldDirty: true,
      });
      // Trigger form state update to ensure reactivity
      form.trigger("academyYear");
    },
    [form]
  );

  const handleBackNavigation = useCallback(() => {
    router.back();
  }, [router]);

  // Memoized day options for better performance
  const dayOptions = useMemo(
    () => Object.entries(DayEnum).map(([key, value]) => ({ key, value })),
    []
  );

  // Memoized year level options
  const yearLevelOptions = useMemo(
    () => [
      { value: YearLevelEnum.FIRST_YEAR, label: "Year 1" },
      { value: YearLevelEnum.SECOND_YEAR, label: "Year 2" },
      { value: YearLevelEnum.THIRD_YEAR, label: "Year 3" },
      { value: YearLevelEnum.FOURTH_YEAR, label: "Year 4" },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {/* Enhanced Breadcrumb */}
      <Card>
        <CardContent className="p-4 sm:p-6 space-y-4">
          {/* Mobile-optimized Breadcrumb */}
          <div className="overflow-x-auto">
            <Breadcrumb>
              <BreadcrumbList className="flex-nowrap">
                <BreadcrumbItem className="whitespace-nowrap">
                  <BreadcrumbLink
                    href={ROUTE.DASHBOARD}
                    className="text-xs sm:text-sm"
                  >
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem className="whitespace-nowrap">
                  <BreadcrumbLink
                    href={ROUTE.SCHEDULE.DEPARTMENT}
                    className="text-xs sm:text-sm"
                  >
                    Department List
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem className="whitespace-nowrap">
                  <BreadcrumbLink
                    href={ROUTE.DASHBOARD}
                    className="text-xs sm:text-sm"
                  >
                    Class List
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem className="whitespace-nowrap">
                  <BreadcrumbPage className="text-xs sm:text-sm">
                    Add Schedule
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Mobile-optimized Header */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full mr-2 sm:mr-0 flex-shrink-0 hover:cursor-pointer"
              asChild
            >
              <img
                src={AppIcons.Back}
                alt="back Icon"
                className="h-4 w-4 sm:mr-5 text-muted-foreground"
              />
            </Button>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              Add Schedule
            </h1>
          </div>

          {/* Mobile-responsive Schedule Info Card */}
          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-3 sm:p-4">
              <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
                <div className="text-base sm:text-lg font-semibold text-gray-900">
                  Schedule Information
                </div>

                {/* Mobile: Stack vertically, Desktop: Horizontal */}
                <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:gap-6 text-xs sm:text-sm text-gray-600">
                  <div className="flex justify-between sm:block">
                    <span className="font-medium">Degree:</span>
                    <span className="sm:ml-1">Associate Degree</span>
                  </div>
                  <div className="flex justify-between sm:block">
                    <span className="font-medium">Current Year:</span>
                    <span className="sm:ml-1">{new Date().getFullYear()}</span>
                  </div>
                  <div className="flex justify-between sm:block">
                    <span className="font-medium">Academy Year:</span>
                    <span className="sm:ml-1">{watchedAcademyYear}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
      {/* Enhanced Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="classId"
                    render={() => (
                      <FormItem>
                        <FormLabel>
                          Class <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <ComboboxSelectClass
                            initialItem={initialClass}
                            disabled
                            dataSelect={selections.selectedClass}
                            onChangeSelected={handleClassChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="courseId"
                    render={() => (
                      <FormItem>
                        <FormLabel>
                          Course <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <ComboboxSelectCourse
                            dataSelect={selections.selectedCourse}
                            onChangeSelected={handleCourseChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="academyYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Academy Year <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <YearSelector
                            value={field.value}
                            onChange={handleYearChange}
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
                      <FormItem>
                        <FormLabel>
                          Semester <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
                          value={field.value ? field.value.toString() : ""}
                          disabled={
                            isLoadingSemesters || semesters.length === 0
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  isLoadingSemesters
                                    ? "Loading semesters..."
                                    : semesters.length === 0
                                    ? "No semesters available"
                                    : "Select a semester"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {semesters.map((semester) => (
                              <SelectItem
                                key={semester.id}
                                value={semester.id?.toString() || ""}
                              >
                                {semester.semester}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="yearLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Year Level <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isSubmitting}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select year level" />
                            </SelectTrigger>
                            <SelectContent>
                              {yearLevelOptions.map(({ value, label }) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="instructorId"
                    render={() => (
                      <FormItem>
                        <FormLabel>
                          Instructor <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <ComboboxSelectInstructor
                            dataSelect={selections.selectedInstructor}
                            onChangeSelected={handleInstructorChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="day"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Day <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a day" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {dayOptions.map(({ key, value }) => (
                              <SelectItem key={key} value={key}>
                                {value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Start Time <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input type="time" {...field} className="w-full" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            End Time <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input type="time" {...field} className="w-full" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="roomId"
                    render={() => (
                      <FormItem>
                        <FormLabel>
                          Room <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <ComboboxSelectRoom
                            dataSelect={selections.selectedRoom}
                            onChangeSelected={handleRoomChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Schedule Preview with Loading States */}
          {isLoadingSchedule && (
            <Card>
              <CardContent className="p-6 text-center">
                <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                <p className="mt-2 text-sm text-gray-600">
                  Loading schedule preview...
                </p>
              </CardContent>
            </Card>
          )}

          {isSchedulePreviewAvailable && (
            <SchedulePreviewTable scheduleList={scheduleData} />
          )}
          {isTeacherPreviewAvailable && (
            <ScheduleTeacherTable scheduleList={scheduleData} />
          )}

          {/* Enhanced Action Buttons */}
          <Card>
            <CardContent className="flex justify-end items-center p-4 gap-3">
              {" "}
              <Button
                type="button"
                variant="outline"
                onClick={handleBackNavigation}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || form.formState.isSubmitting}
                className="bg-teal-900 hover:bg-teal-950 text-white px-6 min-w-[100px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Schedule"
                )}
              </Button>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
