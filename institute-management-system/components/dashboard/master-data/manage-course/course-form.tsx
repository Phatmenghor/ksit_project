"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CardHeaderSection } from "@/components/shared/layout/card-header-section";
import { ComboboxSelectDepartment } from "@/components/shared/ComboBox/combobox-department";
import { ComboboxSelectSubject } from "@/components/shared/ComboBox/combobox-subject-type";
import { ComboboxSelectInstructor } from "@/components/shared/ComboBox/combobox-instructor";
import { DepartmentModel } from "@/model/master-data/department/all-department-model";
import { SubjectModel } from "@/model/master-data/subject/all-subject-model";
import { StaffModel } from "@/model/user/staff/staff.respond.model";
import { Constants } from "@/constants/text-string";
import { ROUTE } from "@/constants/routes";
import {
  createCourseService,
  updateCourseService,
  DetailCourseService,
} from "@/service/master-data/course.service";

const courseFormSchema = z.object({
  subjectCode: z.string().min(1, "Course code is required"),
  subjectNameKh: z.string().optional(),
  subjectNameEn: z.string().min(1, "Course name (EN) is required"),
  credit: z.string().min(1, "Credit is required"),
  theory: z.string().min(1, "Theory is required"),
  execute: z.string().min(1, "Execute is required"),
  apply: z.string().min(1, "Apply is required"),
  departmentId: z.number().min(1, "Department is required"),
  subjectTypeId: z.number().min(1, "Subject type is required"),
  instructorId: z.number().optional(),
  totalHours: z.string().min(1, "Total hours is required"),
  description: z.string().optional(),
  purpose: z.string().optional(),
  expectedOutcome: z.string().optional(),
});

type CourseFormData = z.infer<typeof courseFormSchema>;

interface CourseFormProps {
  courseId?: number;
}

export function CourseForm({ courseId }: CourseFormProps) {
  const isEditMode = !!courseId;
  const router = useRouter();

  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentModel | null>(null);
  const [selectedSubjectType, setSelectedSubjectType] = useState<SubjectModel | null>(null);
  const [selectedInstructor, setSelectedInstructor] = useState<StaffModel | null>(null);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      subjectCode: "", subjectNameKh: "", subjectNameEn: "",
      credit: "", theory: "", execute: "", apply: "",
      departmentId: 0, subjectTypeId: 0, instructorId: undefined,
      totalHours: "", description: "", purpose: "", expectedOutcome: "",
    },
  });

  useEffect(() => {
    if (!courseId) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await DetailCourseService(courseId);
        if (!data) { toast.error("Course not found"); router.replace(ROUTE.MASTER_DATA.COURSES.INDEX); return; }
        form.reset({
          subjectCode: data.code || "",
          subjectNameKh: data.nameKH || "",
          subjectNameEn: data.nameEn || "",
          credit: data.credit?.toString() || "",
          theory: data.theory?.toString() || "",
          execute: data.execute?.toString() || "",
          apply: data.apply?.toString() || "",
          departmentId: data.department?.id || 0,
          subjectTypeId: data.subject?.id || 0,
          instructorId: data.user?.id || undefined,
          totalHours: data.totalHour?.toString() || "",
          description: data.description || "",
          purpose: data.purpose || "",
          expectedOutcome: data.expectedOutcome || "",
        });
        setSelectedDepartment(data.department || null);
        setSelectedSubjectType(data.subject || null);
        setSelectedInstructor(data.user || null);
      } catch {
        toast.error("Failed to load course details");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [courseId]);

  const calculateTotalHours = () => {
    const theory = parseFloat(form.getValues("theory")) || 0;
    const execute = parseFloat(form.getValues("execute")) || 0;
    const apply = parseFloat(form.getValues("apply")) || 0;
    form.setValue("totalHours", ((theory * 1 + execute * 2 + apply * 3) * 15).toString(), { shouldValidate: false });
  };

  const handleSubmit = async (data: CourseFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        code: data.subjectCode,
        nameKH: data.subjectNameKh,
        nameEn: data.subjectNameEn,
        credit: Number(data.credit),
        theory: Number(data.theory),
        execute: Number(data.execute),
        apply: Number(data.apply),
        totalHour: Number(data.totalHours),
        description: data.description,
        purpose: data.purpose,
        expectedOutcome: data.expectedOutcome,
        status: Constants.ACTIVE,
        departmentId: data.departmentId,
        subjectId: data.subjectTypeId,
        teacherId: data.instructorId,
      };
      if (isEditMode && courseId) {
        await updateCourseService(courseId, payload);
        toast.success("Course updated successfully");
      } else {
        await createCourseService(payload);
        toast.success("Course created successfully");
      }
      router.replace(ROUTE.MASTER_DATA.COURSES.INDEX);
    } catch (error: any) {
      toast.error(error.message || `Failed to ${isEditMode ? "update" : "create"} course`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-14 rounded-lg bg-muted animate-pulse" />
        <div className="h-[600px] rounded-lg bg-muted animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CardHeaderSection
        back
        title={isEditMode ? "Edit Course" : "Add Course"}
        breadcrumbs={[
          { label: "Dashboard", href: ROUTE.DASHBOARD },
          { label: "Courses", href: ROUTE.MASTER_DATA.COURSES.INDEX },
          { label: isEditMode ? "Edit" : "Add", href: "" },
        ]}
      />

      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="subjectCode" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course code <span className="text-red-500">*</span></FormLabel>
                    <FormControl><Input placeholder="Course code..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="subjectNameKh" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course name (KH)</FormLabel>
                    <FormControl><Input placeholder="Course name (KH)..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="subjectNameEn" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course name (EN) <span className="text-red-500">*</span></FormLabel>
                    <FormControl><Input placeholder="Course name (EN)..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="departmentId" render={() => (
                  <FormItem>
                    <FormLabel>Department <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <ComboboxSelectDepartment dataSelect={selectedDepartment} onChangeSelected={(dept) => {
                        setSelectedDepartment(dept);
                        form.setValue("departmentId", dept.id, { shouldValidate: true });
                      }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="subjectTypeId" render={() => (
                  <FormItem>
                    <FormLabel>Subject type <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <ComboboxSelectSubject dataSelect={selectedSubjectType} onChangeSelected={(subj) => {
                        setSelectedSubjectType(subj);
                        form.setValue("subjectTypeId", subj.id, { shouldValidate: true });
                      }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="instructorId" render={() => (
                  <FormItem>
                    <FormLabel>Instructor</FormLabel>
                    <FormControl>
                      <ComboboxSelectInstructor dataSelect={selectedInstructor} onChangeSelected={(inst) => {
                        setSelectedInstructor(inst);
                        form.setValue("instructorId", inst ? inst.id : undefined, { shouldValidate: true });
                      }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <FormField control={form.control} name="credit" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credit <span className="text-red-500">*</span></FormLabel>
                    <FormControl><Input placeholder="Credit..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="theory" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Theory <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Theory..." {...field} onChange={(e) => { field.onChange(e); calculateTotalHours(); }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="execute" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Execute <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Execute..." {...field} onChange={(e) => { field.onChange(e); calculateTotalHours(); }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="apply" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apply <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Apply..." {...field} onChange={(e) => { field.onChange(e); calculateTotalHours(); }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="totalHours" render={({ field }) => (
                <FormItem>
                  <FormLabel>Total hours <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input placeholder="Total hours..." readOnly {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea placeholder="Description..." className="min-h-[100px]" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="purpose" render={({ field }) => (
                <FormItem>
                  <FormLabel>Purpose</FormLabel>
                  <FormControl><Textarea placeholder="Purpose..." className="min-h-[100px]" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="expectedOutcome" render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Outcome</FormLabel>
                  <FormControl><Textarea placeholder="Anticipated Outcome..." className="min-h-[100px]" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {isSubmitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      {isEditMode ? "Updating..." : "Saving..."}
                    </>
                  ) : isEditMode ? "Update Course" : "Save Course"}
                </Button>
              </div>

            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
