"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
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

export default function ChangePasswordPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

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
          {
            label: "Change Password",
            href: "",
          },
        ]}
      />
      <Card className="mt-2 p-4 space-y-2">
        <CardHeader className="p-0">
          <CardTitle className="font-medium text-base">
            Change your password
          </CardTitle>
        </CardHeader>
        <Separator className="bg-gray-300" />
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-2 p-0">
            <div className="space-y-1">
              <Label htmlFor="currentPassword" className="text-sm">
                Current Password *
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  placeholder="••••••••"
                  type={showCurrentPassword ? "text" : "password"}
                  className="h-10 text-sm placeholder:text-gray-400"
                  {...register("currentPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-xs text-red-500">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="newPassword" className="text-sm">
                New Password *
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  placeholder="••••••••"
                  type={showNewPassword ? "text" : "password"}
                  className="h-10 text-sm placeholder:text-gray-400"
                  {...register("newPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-xs text-red-500">
                  {errors.newPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirmNewPassword" className="text-sm">
                Confirm New Password *
              </Label>
              <div className="relative">
                <Input
                  id="confirmNewPassword"
                  placeholder="••••••••"
                  type={showConfirmNewPassword ? "text" : "password"}
                  className="h-10 text-sm placeholder:text-gray-400 pr-10"
                  {...register("confirmNewPassword")}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmNewPassword(!showConfirmNewPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showConfirmNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmNewPassword && (
                <p className="text-xs text-red-500">
                  {errors.confirmNewPassword.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 p-0 pt-4">
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
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
