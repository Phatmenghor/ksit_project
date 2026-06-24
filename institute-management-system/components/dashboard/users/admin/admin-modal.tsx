"use client";
import { Constants } from "@/constants/text-string";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RoleEnum } from "@/constants/constant";
import { AdminFormData, AdminFormSchema } from "@/model/user/staff/staff.schema";
import { StaffModel } from "@/model/user/staff/staff.respond.model";
import { UserCog } from "lucide-react";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";

interface AdminFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AdminFormData) => void;
  initialData?: AdminFormData | null;
  mode: "add" | "edit";
  isSubmitting?: boolean;
}

export default function AdminModalForm({ isOpen, onClose, onSubmit, initialData, mode, isSubmitting = false }: AdminFormModalProps) {
  const isCreate = mode === "add";
  const [selectedAdmin, setSelectedAdmin] = useState<StaffModel | null>(initialData?.selectedStaff || null);

  const form = useForm<AdminFormData>({
    resolver: zodResolver(AdminFormSchema),
    defaultValues: {
      id: initialData?.id || 0,
      username: initialData?.username || "",
      email: initialData?.email || "",
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      password: "",
      confirmPassword: "",
      status: Constants.ACTIVE,
      roles: [RoleEnum.ADMIN],
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!isOpen) return;
    if (initialData && mode === "edit") {
      form.reset({ id: initialData.id || 0, username: initialData.username || "", email: initialData.email || "", first_name: initialData.first_name || "", last_name: initialData.last_name || "", status: Constants.ACTIVE, roles: [RoleEnum.ADMIN] });
      if (initialData.selectedStaff) setSelectedAdmin(initialData.selectedStaff);
    } else {
      form.reset({ id: 0, username: "", email: "", first_name: "", last_name: "", password: "", confirmPassword: "", status: Constants.ACTIVE, roles: [RoleEnum.ADMIN] });
      setSelectedAdmin(null);
    }
  }, [isOpen, initialData, mode]);

  const handleCloseModal = () => {
    form.reset({ id: 0, username: "", email: "", first_name: "", last_name: "", password: "", confirmPassword: "", status: Constants.ACTIVE, roles: [RoleEnum.ADMIN] });
    setSelectedAdmin(null);
    onClose();
  };

  const handleSubmit = async (data: AdminFormData) => {
    try {
      const submitData: any = {
        first_name: data.first_name,
        last_name: data.last_name,
        username: data.username,
        email: data.email,
        status: Constants.ACTIVE,
        roles: [RoleEnum.ADMIN],
      };
      if (mode === "add") {
        submitData.password = (data as AdminFormData).password;
        submitData.confirmPassword = (data as AdminFormData).confirmPassword;
      }
      if (mode === "edit" && initialData?.id) submitData.id = initialData.id;
      onSubmit(submitData);
    } catch {
      toast.error("An error occurred while saving admin");
    }
  };

  const canSubmit = () => {
    if (isSubmitting) return false;
    if (mode === "edit") return form.formState.isValid && !!form.getValues().first_name && !!form.getValues().last_name && !!form.getValues().username && !!form.getValues().email;
    return form.formState.isValid && !!form.getValues().first_name && !!form.getValues().last_name && !!form.getValues().username && !!form.getValues().email && !!form.getValues().password && !!form.getValues().confirmPassword;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="w-full max-w-lg p-0 flex flex-col max-h-[90vh]">
        <FormHeader
          title={isCreate ? "Add Admin" : "Edit Admin"}
          description={`Fill in the information below to ${isCreate ? "create" : "update"} admin.`}
          icon={<UserCog className="h-5 w-5 text-primary" />}
          iconBg="bg-primary/10 border-primary/20"
        />
        <Form {...form}>
          <form id="admin-form" onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <FormBody>
              <FormField control={form.control} name="username" render={({ field }) => (
                <FormItem>
                  <FormLabel>Username <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input type="text" placeholder="Enter username" maxLength={50} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {mode === "add" && (
                <div className="space-y-4">
                  <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password <span className="text-red-500">*</span></FormLabel>
                      <FormControl><Input type="password" placeholder="Enter password" maxLength={50} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password <span className="text-red-500">*</span></FormLabel>
                      <FormControl><Input type="password" placeholder="Enter confirm password" maxLength={50} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              )}

              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input type="email" placeholder="Enter email" maxLength={50} {...field} value={field.value ?? ""} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="first_name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name <span className="text-red-500">*</span></FormLabel>
                    <FormControl><Input type="text" placeholder="Enter first name" autoFocus maxLength={50} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="last_name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name <span className="text-red-500">*</span></FormLabel>
                    <FormControl><Input type="text" placeholder="Enter last name" maxLength={50} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </FormBody>

            <FormFooter>
              <CancelButton onClick={handleCloseModal} disabled={isSubmitting} />
              <SubmitButton
                isSubmitting={isSubmitting}
                isDirty={true}
                isCreate={isCreate}
                createText="Create Admin"
                updateText="Update Admin"
                submittingCreateText="Creating..."
                submittingUpdateText="Updating..."
                disabled={!canSubmit()}
                form="admin-form"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              />
            </FormFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
