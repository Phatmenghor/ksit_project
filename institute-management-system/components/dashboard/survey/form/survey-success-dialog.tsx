"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { SurveyResponseModel } from "@/model/survey/survey-response-model";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";

interface SurveySuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surveyInfo: SurveyResponseModel | null;
}

export default function SurveySuccessDialog({ onOpenChange, open, surveyInfo }: SurveySuccessDialogProps) {
  const router = useRouter();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md p-0 flex flex-col gap-0">
        <DialogTitle className="sr-only">Survey Submitted</DialogTitle>
        <DialogDescription className="sr-only">Survey submission confirmation</DialogDescription>

        <FormHeader
          title="Submitted!"
          description={`${surveyInfo?.submittedAt ?? ""} ${surveyInfo?.timeSlot ?? ""}`.trim() || "Your survey has been successfully submitted."}
          icon={<Check className="h-5 w-5 text-green-600" />}
          iconBg="bg-green-50 border-green-200"
        />

        <FormBody>
          <div className="text-center space-y-1">
            <p className="text-sm text-green-700 font-medium">Thank you for taking the time to complete this survey.</p>
            <p className="text-sm text-green-700 font-medium">Your feedback is greatly appreciated!</p>
          </div>

          <div className="rounded-lg bg-muted/40 border border-border p-3 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Subject</span>
              <span className="font-medium">{surveyInfo?.courseName ?? "Unknown Course"} - {surveyInfo?.credit ?? "0"}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Class Code</span>
              <span className="font-medium">{surveyInfo?.courseCode ?? "Unknown Code"}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Day</span>
              <span className="font-medium">{surveyInfo?.dayOfWeek ?? "Unknown Day"}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Instructor</span>
              <span className="font-medium">{surveyInfo?.teacherName ?? "Unknown Instructor"}</span>
            </div>
          </div>
        </FormBody>

        <FormFooter>
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => router.back()}>
            Done
          </Button>
        </FormFooter>
      </DialogContent>
    </Dialog>
  );
}
