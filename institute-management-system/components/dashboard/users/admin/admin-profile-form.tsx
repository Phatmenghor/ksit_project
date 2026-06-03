"use client";
import { Constants } from "@/constants/text-string";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { RoleEnum } from "@/constants/constant";
import {
  AdminFormData,
  AdminFormSchema,
} from "@/model/user/staff/staff.schema";
import { StaffModel } from "@/model/user/staff/staff.respond.model";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import AdminProfileUploadCard from "./admin-profile-upload";
import { AppIcons } from "@/constants/icons/icon";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ROUTE } from "@/constants/routes";

interface AdminFormProps {
  onSubmit: (data: AdminFormData) => void;
  onCancel?: () => void;
  initialData: AdminFormData | null;
  isSubmitting?: boolean;
}

export default function AdminForm({
  onSubmit,
  onCancel,
  initialData,
  isSubmitting = false,
}: AdminFormProps) {
  // Initialize selectedAdmin with initialData.selectedAdmin
  const [selectedAdmin, setSelectedAdmin] = useState<StaffModel | null>(
    initialData?.selectedStaff || null
  );
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  const router = useRouter();
  // Initialize the form with Zod validation
  const form = useForm<AdminFormData>({
    resolver: zodResolver(AdminFormSchema),
    defaultValues: {
      id: initialData?.id || 0,
      username: initialData?.username || "",
      email: initialData?.email || "",
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      profileUrl: initialData?.profileUrl || "",
      password: "",
      confirmPassword: "",
      status: Constants.ACTIVE,
      roles: [RoleEnum.ADMIN],
    },
    mode: "onChange",
  });

  const {
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors, isDirty, isValid },
    getValues,
  } = form;

  // Reset form when initialData changes
  useEffect(() => {
    // Set the form values for edit mode
    reset({
      id: initialData?.id || 0,
      username: initialData?.username || "",
      email: initialData?.email || "",
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      profileUrl: initialData?.profileUrl || "",
      status: Constants.ACTIVE,
      roles: [RoleEnum.ADMIN],
    });

    // Set the selected admin
    if (initialData?.selectedStaff) {
      setSelectedAdmin(initialData?.selectedStaff);
    }

    setIsFormDirty(false);
    setIsFormValid(false);
  }, [initialData, form]);

  // Track form changes
  useEffect(() => {
    const subscription = watch(() => {
      // Update form state based on validation
      setIsFormDirty(isDirty);
      setIsFormValid(
        Object.keys(errors).length === 0 && form.formState.isValid
      );

    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Handle cancel with confirmation if form is dirty
  const handleCancel = () => {
    if (isFormDirty) {
      // Use native confirm for simplicity, could be replaced with a custom dialog
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to cancel?"
      );
      if (!confirmed) return;
    }
    if (onCancel) {
      onCancel();
    }
  };

  // Handle form submission
  const Submit = async (data: AdminFormData) => {
    try {
      const submitData: AdminFormData = {
        first_name: data.first_name,
        last_name: data.last_name,
        username: data.username,
        email: data.email,
        status: Constants.ACTIVE,
        profileUrl: data.profileUrl,
        roles: [RoleEnum.ADMIN],
      };

      if (initialData?.id) {
        submitData.id = initialData?.id;
      }

      onSubmit(submitData);
    } catch (error) {
      toast.error("An error occurred while saving profile");
    }
  };

  // Determine if the form can be submitted
  const canSubmitForm = () => {
    if (isSubmitting) return false;

    // Allow submission if the form is valid, even if not dirty
    return (
      isFormValid ||
      (isValid &&
        !!getValues().first_name &&
        !!getValues().last_name &&
        !!getValues().username &&
        !!getValues().email)
    );
  };

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href={ROUTE.DASHBOARD}>
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Edit Profile</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex items-center min-w-0 flex-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                asChild
                className="rounded-full flex-shrink-0 hover:cursor-pointer"
              >
                <img
                  src={AppIcons.Back}
                  alt="back Icon"
                  className="h-4 w-4 mr-3 sm:mr-5 text-muted-foreground"
                />
              </Button>
              <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">
                Edit your profile
              </h1>
            </div>
            <CardDescription>
              Fill in the information below to update your profile.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <Card className="w-full mx-auto">
        <CardContent className="mt-4">
          <Form {...form}>
            <form onSubmit={handleSubmit(Submit)} className="space-y-4">
              <AdminProfileUploadCard />
              <FormField
                control={control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Username <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter username"
                        maxLength={50}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Email <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter email"
                        maxLength={50}
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      First Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter first name"
                        autoFocus
                        maxLength={50}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Last Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter last name"
                        maxLength={50}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between items-center pt-6 border-t">
                {/* Right side: Cancel and Submit buttons */}
                <div className="flex space-x-4 ml-auto">
                  {onCancel && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={!canSubmitForm()}
                    className="bg-green-900 text-white hover:bg-green-950"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Updating...
                      </>
                    ) : (
                      "Update"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
