"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Ban, Loader2, Save } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";

import FormDetail from "./form-detail";
import { ROUTE } from "@/constants/routes";
import { BasicInformationForm } from "../detail-section/teacher-basic-info";
import ProfileUploadCard from "./profile-upload-card";
import { StatusEnum } from "@/constants/constant";
import {
  AddStaffSchema,
  EditStaffFormData,
  EditStaffSchema,
} from "@/model/user/staff/staff.schema";
import { CardHeaderSection } from "@/components/shared/layout/card-header-section";
import { initialStaffValues } from "@/model/user/staff/staff.request.model";
import Loading from "@/components/shared/loading";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ComboboxSelectDepartment } from "@/components/shared/ComboBox/combobox-department";
import { DepartmentModel } from "@/model/master-data/department/all-department-model";
import { getDepartmentByIdService } from "@/service/master-data/department.service";
import { Input } from "@/components/ui/input";

type Props = {
  mode: "Add" | "Edit";
  initialValues?: EditStaffFormData;
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
  title: string;
  isTeacher?: boolean;
  back: string | undefined;
  onDiscard?: () => void;
};

export default function TeacherForm({
  initialValues,
  onSubmit,
  loading,
  title,
  mode,
  isTeacher = false,
  onDiscard,
  back,
}: Props) {
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const initializedRef = useRef(false);
  const [selectedDepartment, setSelectedDepartment] =
    useState<DepartmentModel | null>(null);
  const [isDepartmentLoading, setIsDepartmentLoading] = useState(false);

  const methods = useForm({
    resolver: zodResolver(mode === "Add" ? AddStaffSchema : EditStaffSchema),
    defaultValues: initialStaffValues,
    mode: "onChange",
  });

  const {
    setValue,
    reset,
    getValues,
    control,
    watch,
    formState: { isSubmitting, isDirty, isValid, errors },
    handleSubmit,
  } = methods;

  const handleDepartmentChange = (department: DepartmentModel | null) => {
    setSelectedDepartment(department);
    setValue("departmentId", department?.id as number, {
      shouldValidate: true,
    });
  };

  // Fixed: Load department based on the correct departmentId
  const loadDepartmentById = useCallback(async (departmentId: number) => {
    if (!departmentId && !isTeacher) return;

    setIsDepartmentLoading(true);
    try {
      const response = await getDepartmentByIdService(departmentId);
      if (response) {
        setSelectedDepartment(response);
      } else {
      }
    } catch (error) {
    } finally {
      setIsDepartmentLoading(false);
    }
  }, []);

  // Fixed: Proper form initialization
  useEffect(() => {
    if (initializedRef.current) return;

    if (mode === "Edit" && initialValues) {
      // Reset form with initial values
      const formData = {
        ...initialStaffValues,
        ...Object.fromEntries(
          Object.entries(initialValues).map(([key, value]) => [
            key,
            value === null ? undefined : value,
          ])
        ),
      };

      reset(formData);

      // Load department if departmentId exists
      if (initialValues?.departmentId) {
        loadDepartmentById(initialValues?.departmentId);
      }

      initializedRef.current = true;
    } else if (mode === "Add") {
      reset(initialStaffValues);
      initializedRef.current = true;
    }
  }, [initialValues, mode, reset, loadDepartmentById]);

  // Watch for form changes
  useEffect(() => {
    const subscription = watch(() => {
      setIsFormDirty(isDirty);
      setIsFormValid(Object.keys(errors).length === 0 && isValid);
    });
    return () => subscription.unsubscribe();
  }, [watch, isDirty, isValid, errors]);

  const handleClosePage = () => {
    if (onDiscard) {
      onDiscard();
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      await onSubmit(data);
    } catch (error) {
    }
  };

  // Show loading while waiting for initial data in edit mode
  if (mode === "Edit" && !initialValues) {
    return <Loading />;
  }

  const canSubmitForm = () => {
    if (isSubmitting || isDepartmentLoading) return false;

    if (mode === "Add") {
      const values = getValues();
      return (
        isDirty &&
        isValid &&
        !!values.username &&
        !!values.password &&
        !!values.identifyNumber &&
        !!values.departmentId
      );
    }

    if (mode === "Edit") {
      return isDirty && isValid;
    }

    return false;
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-4"
        noValidate
      >
        <CardHeaderSection
          back
          title={title}
          backHref={ROUTE.USERS.TEACHERS}
          breadcrumbs={[
            { label: "Dashboard", href: ROUTE.DASHBOARD },
            {
              label: mode === "Add" ? "Add new" : "Edit teacher",
              href: "",
            },
          ]}
        />

        {mode === "Add" && <BasicInformationForm />}
        <ProfileUploadCard />

        {isTeacher && (
          <Card>
            <CardContent className="p-4 flex flex-1 flex-row gap-4">
              <div className="flex-1">
                <FormField
                  control={control}
                  name="departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Department <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <ComboboxSelectDepartment
                          dataSelect={selectedDepartment}
                          onChangeSelected={handleDepartmentChange}
                          disabled={isSubmitting || isDepartmentLoading}
                          placeholder={
                            isDepartmentLoading
                              ? "Loading department..."
                              : "Select a department..."
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex-1">
                <FormField
                  control={control}
                  name="identifyNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Identify <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder="Enter identify..."
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="w-full mx-auto space-y-5">
          <FormDetail />

          {/* Action buttons */}
          <Card>
            <CardContent>
              <div className="flex justify-end items-center pt-5 gap-3">
                {mode === "Edit" && (
                  <>
                    {/* Uncomment if you need disable user functionality
                    <Button
                      type="button"
                      disabled={loading || isSubmitting}
                      onClick={handleDisableUser}
                      className="flex items-center gap-2 bg-red-600 bg-opacity-30 text-red-600 hover:bg-red-700 hover:bg-opacity-40 disabled:pointer-events-none"
                    >
                      <Ban size={18} strokeWidth={3} className="text-red-600" />
                      {isSubmitting ? "Disabling..." : "Disable User"}
                    </Button>
                    */}
                  </>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    disabled={isSubmitting}
                    variant="outline"
                    onClick={handleClosePage}
                  >
                    Discard
                  </Button>
                  <Button
                    type="submit"
                    className="bg-emerald-800 hover:bg-emerald-900"
                    disabled={!canSubmitForm()}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </FormProvider>
  );
}
