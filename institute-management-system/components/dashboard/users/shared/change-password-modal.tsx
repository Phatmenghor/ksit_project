"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { KeyRound, CheckCircle2 } from "lucide-react";
import { AdminChangePasswordService } from "@/service/auth/auth.service";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";

export default function ResetPasswordModal({
  userId,
  isOpen,
  userName,
  onClose,
}: {
  userId?: number;
  userName?: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const onReset = async () => {
    if (!userId) return toast.error("User ID missing");
    setIsSubmitting(true);
    try {
      const ok = await AdminChangePasswordService({ id: userId, newPassword: "88889999", confirmNewPassword: "88889999" });
      if (ok) { setShowSuccess(true); toast.success("Password reset to default"); }
      else toast.error("Reset failed");
    } catch { toast.error("Reset failed"); }
    finally { setIsSubmitting(false); }
  };

  const handleClose = () => {
    setShowSuccess(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md p-0 flex flex-col gap-0">
        {showSuccess ? (
          <>
            <FormHeader
              title="Password Reset!"
              description="User password has been reset to the default password."
              icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
              iconBg="bg-green-50 border-green-200"
            />
            <FormBody>
              <p className="text-sm text-muted-foreground">
                The password for <strong>{userName || "this user"}</strong> has been successfully reset to the default password <strong>88889999</strong>.
              </p>
            </FormBody>
            <FormFooter>
              <Button type="button" onClick={handleClose} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Okay
              </Button>
            </FormFooter>
          </>
        ) : (
          <>
            <FormHeader
              title="Reset Password"
              description="This will reset the user's password to the default value."
              icon={<KeyRound className="h-5 w-5 text-yellow-600" />}
              iconBg="bg-yellow-50 border-yellow-200"
            />
            <FormBody>
              <div className="rounded-lg border border-yellow-100 bg-yellow-50 p-3 space-y-1">
                <p className="text-sm text-yellow-800 font-medium">Are you sure you want to reset the password?</p>
                <p className="text-sm text-yellow-700">
                  Password will be reset for: <strong>{userName || "User"}</strong>
                  <br />
                  New default password: <strong>88889999</strong>
                </p>
              </div>
            </FormBody>
            <FormFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Discard
              </Button>
              <Button
                type="button"
                onClick={onReset}
                disabled={isSubmitting}
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </Button>
            </FormFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
