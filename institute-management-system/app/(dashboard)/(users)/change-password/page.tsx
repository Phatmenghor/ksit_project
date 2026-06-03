"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CardHeaderSection } from "@/components/shared/layout/card-header-section";
import { ROUTE } from "@/constants/routes";
import { ChangePasswordService } from "@/service/auth/auth.service";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(1, "New password is required"),
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ["confirmNewPassword"],
    message: "New passwords do not match",
  });

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

function PasswordField({
  id,
  label,
  error,
  registration,
}: {
  id: string;
  label: string;
  error?: string;
  registration: React.InputHTMLAttributes<HTMLInputElement>;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-sm">
        {label} <span className="text-red-500">*</span>
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          placeholder="••••••••"
          style={{ paddingRight: "2.5rem" }}
          {...registration}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function ChangePasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordForm) => {
    try {
      const response = await ChangePasswordService(data);
      if (response) {
        toast.success("Password changed successfully");
        reset();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
    }
  };

  return (
    <div>
      <CardHeaderSection
        title="Account Settings"
        back
        breadcrumbs={[
          { label: "Dashboard", href: ROUTE.DASHBOARD },
          { label: "Change Password", href: "" },
        ]}
      />

      <div className="mt-2 rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-base font-medium text-card-foreground">
          Change your password
        </h2>
        <Separator className="my-3" />

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <PasswordField
              id="currentPassword"
              label="Current Password"
              error={errors.currentPassword?.message}
              registration={register("currentPassword")}
            />
            <PasswordField
              id="newPassword"
              label="New Password"
              error={errors.newPassword?.message}
              registration={register("newPassword")}
            />
            <PasswordField
              id="confirmNewPassword"
              label="Confirm New Password"
              error={errors.confirmNewPassword?.message}
              registration={register("confirmNewPassword")}
            />
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => reset()}
              disabled={isSubmitting}
            >
              Discard
            </Button>
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Changing..." : "Change"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
