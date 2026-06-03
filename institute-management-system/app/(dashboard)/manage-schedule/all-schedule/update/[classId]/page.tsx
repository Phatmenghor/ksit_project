"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

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
import { ComboboxSelectDepartment } from "@/components/shared/ComboBox/combobox-department";
import { ComboboxSelectSubject } from "@/components/shared/ComboBox/combobox-subject-type";
import { ComboboxSelectInstructor } from "@/components/shared/ComboBox/combobox-instructor";
import { ComboboxSelectClass } from "@/components/shared/ComboBox/combobox-class";
import { ComboboxSelectRoom } from "@/components/shared/ComboBox/combobox-room";
import { YearSelector } from "@/components/shared/year-selector";
import { DepartmentModel } from "@/model/master-data/department/all-department-model";
import { SubjectModel } from "@/model/master-data/subject/all-subject-model";
import { RoomModel } from "@/model/master-data/room/all-room-model";
import { ClassModel } from "@/model/master-data/class/all-class-model";
import { SemesterModel } from "@/model/master-data/semester/semester-model";
import { StaffModel } from "@/model/user/staff/staff.respond.model";
import { DayEnum, StatusEnum, YearLevelEnum } from "@/constants/constant";
import { Constants } from "@/constants/text-string";
import {
  updateScheduleService,
  getDetailScheduleService,
  getAllSimpleScheduleService,
} from "@/service/schedule/schedule.service";
import { toast } from "sonner";
import { getAllSemesterService } from "@/service/master-data/semester.service";
import { ScheduleModel } from "@/model/schedules/all-schedule-model";
import SchedulePreviewTable from "@/components/dashboard/manage-schedule/schedule-preview-table";
import ScheduleTeacherTable from "@/components/dashboard/manage-schedule/schedule-teacher-table";
import Loading from "@/components/shared/loading";
import { useIsMobile } from "@/hooks/use-mobile";
import { ComboboxSelectCourse } from "@/components/shared/ComboBox/combobox-course";
import { CourseModel } from "@/model/master-data/course/all-course-model";

const formSchema = z.object({
  classId: z.number().min(1, "Class is required"),
  instructorId: z.number().min(1, "Instructor is required"),
  courseId: z.number().min(1, "Course is required"),
  day: z.string().min(1, "Please select a day"),
  academyYear: z.number({
    required_error: "Academy year is required",
  }),
  startTime: z.string().min(1, "Please select start time"),
  endTime: z.string().min(1, "Please select end time"),
  semesterId: z.number().min(1, "Semester is required"),
  roomId: z.number().min(1, "Room is required"),
  status: z.literal(Constants.ACTIVE),
  yearLevel: z.nativeEnum(YearLevelEnum, {
    required_error: "Year level is required",
  }),
});

export default function UpdateSchedule() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSchedulePreviewLoading, setIsSchedulePreviewLoading] =
    useState(false);
  const [isLoadingSemesters, setIsLoadingSemesters] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseModel | null>(
    null
  );
  const [selectedInstructor, setSelectedInstructor] =
    useState<StaffModel | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassModel | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomModel | null>(null);
  const [semesters, setSemesters] = useState<SemesterModel[]>([]);
  const [scheduleData, setScheduleData] = useState<ScheduleModel | null>(null);
  const [schedulePreviewData, setSchedulePreviewData] = useState<
    ScheduleModel[]
  >([]);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  const params = useParams();
  const router = useRouter();
  const scheduleId = Number(params.id || params.classId);

  const getSemesterEnum = useCallback(
    (id: number) => {
      const semester = semesters.find((s) => s.id === id);
      return semester?.semester || "SEMESTER_1";
    },
    [semesters]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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
      status: Constants.ACTIVE,
      yearLevel: YearLevelEnum.FIRST_YEAR,
    },
  });

  const watchedAcademyYear = form.watch("academyYear");
  const watchedClassId = form.watch("classId");
  const watchedInstructorId = form.watch("instructorId");
  const watchedSemesterId = form.watch("semesterId");

  const isMobile = useIsMobile();
  // Fetch existing schedule data first
  useEffect(() => {
    const fetchScheduleData = async () => {
      if (!scheduleId) return;

      try {
        setIsLoading(true);
        const data = await getDetailScheduleService(scheduleId);

        console.log("##data", data);

        if (data) {
          setScheduleData(data);

          const academyYear =
            data.classes?.academyYear ||
            data.semester?.academyYear ||
            new Date().getFullYear();

          // Set form values immediately for most fields
          form.reset({
            classId: data.classes?.id || 0,
            instructorId: data.teacher?.id || 0,
            courseId: data.course?.id || 0,
            day: data.day || "",
            academyYear: data.semester?.academyYear || academyYear,
            startTime: data.startTime || "",
            endTime: data.endTime || "",
            semesterId: data.semester?.id || 0, // Set the semester ID directly
            roomId: data.room?.id || 0,
            status: data.status || Constants.ACTIVE,
            yearLevel: data.yearLevel,
          });

          // Set selected items for comboboxes
          setSelectedClass(data.classes || null);
          setSelectedInstructor(data.teacher || null);
          setSelectedCourse(data.course || null);
          setSelectedRoom(data.room || null);

          setInitialDataLoaded(true);
        } else {
          toast.error("Schedule not found");
          router.replace(ROUTE.SCHEDULE.DEPARTMENT);
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to load schedule data");
        console.error("Error fetching schedule:", error);
        router.replace(ROUTE.SCHEDULE.DEPARTMENT);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScheduleData();
  }, [scheduleId, form, router]);

  // Fetch semesters when academy year changes or when initial data is loaded
  useEffect(() => {
    const fetchSemesters = async () => {
      if (!watchedAcademyYear || !initialDataLoaded) return;

      setIsLoadingSemesters(true);
      try {
        const result = await getAllSemesterService({
          search: "",
          pageSize: 100, // Increased to ensure we get all semesters
          pageNo: 1,
          academyYear: watchedAcademyYear,
          status: StatusEnum.ACTIVE,
        });

        if (result?.content) {
          setSemesters(result.content);

          // Set the semester after semesters are loaded
          if (scheduleData?.semester?.id) {
            const semesterExists = result.content.find(
              (semester: SemesterModel) =>
                semester.id === scheduleData.semester.id
            );

            if (semesterExists) {
              form.setValue("semesterId", scheduleData.semester.id, {
                shouldValidate: true,
              });
            } else {
              console.warn(
                "Original semester not found in current year's semesters"
              );
              toast.warning(
                "Original semester not available for the selected year"
              );
            }
          }
        }
      } catch (error) {
        console.error("Error fetching semesters:", error);
        toast.error("Failed to load semesters");
      } finally {
        setIsLoadingSemesters(false);
      }
    };

    fetchSemesters();
  }, [watchedAcademyYear, initialDataLoaded, scheduleData, form]);

  const fetchSchedule = useCallback(
    async (
      classId: number,
      instructorId: number,
      semesterId: number,
      academyYear: number
    ) => {
      if (semesterId === 0 || academyYear === 0) {
        setSchedulePreviewData([]);
        return;
      }

      // Must have either classId or instructorId (but not both as 0)
      const hasValidClassId = classId && classId > 0;
      const hasValidInstructorId = instructorId && instructorId > 0;

      if (!hasValidClassId && !hasValidInstructorId) {
        setSchedulePreviewData([]);
        return;
      }

      console.log("Fetching schedule with:", {
        classId,
        instructorId,
        semesterId,
        academyYear,
      });

      setIsSchedulePreviewLoading(true);
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
        }

        console.log("Schedule API response:", res);
        setSchedulePreviewData(res);
      } catch (error) {
        console.error("Failed to fetch schedule", error);
        toast.error("Failed to load schedule preview");
        setSchedulePreviewData([]);
      } finally {
        setIsSchedulePreviewLoading(false);
      }
    },
    [getSemesterEnum]
  );

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
      setSchedulePreviewData([]);
    }
  }, [
    watchedClassId,
    watchedInstructorId,
    watchedSemesterId,
    watchedAcademyYear,
    semesters.length,
    fetchSchedule, // Add fetchSchedule to dependencies
  ]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    try {
      const scheduleUpdateData = {
        startTime: values.startTime,
        endTime: values.endTime,
        day: values.day,
        classId: values.classId,
        teacherId: values.instructorId,
        courseId: values.courseId,
        roomId: values.roomId,
        semesterId: values.semesterId,
        status: values.status,
        yearLevel: values.yearLevel,
      };

      await updateScheduleService(scheduleId, scheduleUpdateData);
      toast.success("Schedule updated successfully");
      // router.replace(ROUTE.SCHEDULE.DEPARTMENT);
      router.back();
    } catch (error: any) {
      toast.error(error.message || "Failed to update schedule");
      console.error("Error updating schedule:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCourseChange = (course: CourseModel) => {
    setSelectedCourse(course);
    form.setValue("courseId", course.id, {
      shouldValidate: true,
    });
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

  const handleYearChange = (year: number) => {
    form.setValue("academyYear", year, { shouldValidate: true });
    // Reset semester when academy year changes
    form.setValue("semesterId", 0);
    setSemesters([]);
  };

  const handleBackNavigation = () => {
    router.back();
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-4">
      <div className="p-3 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Breadcrumb */}
          <div className={isMobile ? "order-1 w-full" : "order-3"}>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink>Schedules</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Update Schedule</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Heading and subheading */}
          <div className="order-2">
            <h1 className="lg:text-2xl text-base font-bold">Update Schedule</h1>
            <p className="text-muted-foreground text-sm">
              Institute Management System
            </p>
          </div>
        </div>

        <div className="mb-4">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={handleBackNavigation}
          >
            <ArrowLeft className="h-4 w-4" /> BACK
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            dataSelect={selectedClass}
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
                            dataSelect={selectedCourse}
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
                                value={(semester.id ?? "").toString()}
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
                              <SelectItem value={YearLevelEnum.FIRST_YEAR}>
                                Year 1
                              </SelectItem>
                              <SelectItem value={YearLevelEnum.SECOND_YEAR}>
                                Year 2
                              </SelectItem>
                              <SelectItem value={YearLevelEnum.THIRD_YEAR}>
                                Year 3
                              </SelectItem>
                              <SelectItem value={YearLevelEnum.FOURTH_YEAR}>
                                Year 4
                              </SelectItem>
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
                            dataSelect={selectedInstructor}
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
                            {Object.entries(DayEnum).map(([key, value]) => (
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
                            dataSelect={selectedRoom}
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

          <SchedulePreviewTable scheduleList={schedulePreviewData} />
          <ScheduleTeacherTable scheduleList={schedulePreviewData} />

          <Card>
            <CardContent className="flex justify-end items-center p-4 gap-3">
              {" "}
              <Button
                type="button"
                variant="outline"
                onClick={handleBackNavigation}
                disabled={isSubmitting}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-teal-900 hover:bg-teal-950 text-white px-6"
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Updating...
                  </>
                ) : (
                  "Update Schedule"
                )}
              </Button>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
