"use client";

import { FormProvider, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Save } from "lucide-react";
import { CardHeaderSection } from "@/components/shared/layout/card-header-section";
import { ROUTE } from "@/constants/routes";
import { useEffect, useState } from "react";
import { StatusEnum } from "@/constants/constant";
import { StudentBasicForm } from "../add-single-student/student-base-form";
import StudentProfileUploadCard from "../add-single-student/student-profile-upload";
import StudentFormDetail from "./student-form-detail";
import {
  AddStudentSchema,
  EditStudentFormData,
  EditStudentSchema,
} from "@/model/user/student/student.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { initStudentFormData } from "@/model/user/student/student.request.model";
import { usePathname } from "next/navigation";
import Loading from "@/components/shared/loading";

type Props = {
  initialValues?: EditStudentFormData;
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
  title: string;
  mode: "Add" | "Edit";
  fromSidebar?: boolean;
  onDiscard?: () => void;
  showBackButton?: boolean;
  back?: string;
  parentLabel?: string;
};

export default function StudentForm({
  initialValues,
  onSubmit,
  loading,
  fromSidebar = true,
  title,
  mode,
  showBackButton = true,
  onDiscard,
  back,
  parentLabel,
}: Props) {
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  const methods = useForm({
    resolver: zodResolver(
      mode === "Add" ? AddStudentSchema : EditStudentSchema
    ),
    defaultValues: initStudentFormData,
    mode: "onChange",
  });

  const {
    setValue,
    reset,
    getValues,
    watch,
    formState: { isSubmitting, isDirty, isValid, errors },
    handleSubmit,
  } = methods;

  const pathname = usePathname();

  useEffect(() => {
    if (initialValues && mode === "Edit") {
      reset({
        ...initStudentFormData,
        ...Object.fromEntries(
          Object.entries(initialValues).map(([key, value]) => [
            key,
            value === null ? undefined : value,
          ])
        ),
      });
    } else {
      reset(initStudentFormData);
    }
    setIsFormDirty(false);
  }, [initialValues, methods, mode]);

  useEffect(() => {
    const subscription = watch(() => {
      setIsFormDirty(isDirty);
      setIsFormValid(Object.keys(errors).length === 0 && isValid);

    });
    return () => subscription.unsubscribe();
  }, [methods]);

  const handleClosePage = () => {
    if (isFormDirty) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to close?"
      );
      if (!confirmed) return;
    }
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

  if (!initialValues && mode === "Edit") {
    return <Loading />;
  }

  const canSubmitForm = () => {
    if (isSubmitting) return false;

    if (mode === "Edit") {
      return isValid;
    }

    if (mode === "Add") {
      return (
        isFormValid ||
        (!!getValues().username &&
          !!getValues().password &&
          !!getValues().classId)
      );
    }

    return isFormDirty && isFormValid;
  };

  return (
    <div className="space-y-6">
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4"
          noValidate
        >
          <CardHeaderSection
            back={showBackButton}
            title={title}
            backHref={back}
            breadcrumbs={[
              { label: "Dashboard", href: ROUTE.DASHBOARD },
              ...(parentLabel
                ? [{ label: parentLabel, href: back || "" }]
                : []),
              {
                label: mode === "Add" ? "Add new" : "Edit",
                href: "",
              },
            ]}
          />

          {mode === "Add" && <StudentBasicForm />}

          <StudentProfileUploadCard />

          <div className="w-full mx-auto space-y-5">
            <StudentFormDetail />

            <Card>
              <CardContent>
                <div className="flex justify-end pt-5 gap-3">
                  <div className="flex items-end justify-end gap-3">
                    <Button
                      type="button"
                      disabled={loading || isSubmitting}
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
                      {loading || isSubmitting ? (
                        <>
                          <Loading />
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
    </div>
  );
}
