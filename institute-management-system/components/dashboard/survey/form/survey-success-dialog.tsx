"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { SurveyResponseModel } from "@/model/survey/survey-response-model";

interface SurveySuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surveyInfo: SurveyResponseModel | null;
}
export default function SurveySuccessDialog({
  onOpenChange,
  open,
  surveyInfo,
}: SurveySuccessDialogProps) {
  const router = useRouter();
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="md:max-w-md max-w-sm p-8">
          <DialogTitle className="sr-only">Survey Submitted</DialogTitle>
          <DialogDescription className="sr-only">
            Survey submission confirmation
          </DialogDescription>

          <div className="flex flex-col items-center space-y-6">
            {/* Success Icon */}
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-white stroke-[3]" />
            </div>

            {/* Title and Timestamp */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Submitted!</h2>
              <p className="text-gray-500 text-sm">
                {surveyInfo?.submittedAt} {surveyInfo?.timeSlot}
              </p>
            </div>

            {/* Thank you message */}
            <div className="text-center space-y-1">
              <p className="text-green-700 font-medium">
                Thank you for taking the time to complete this survey.
              </p>
              <p className="text-green-700 font-medium">
                Your feedback is greatly appreciated!
              </p>
            </div>

            {/* Course Details */}
            <div className="w-full bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Subject</span>
                <span className="text-gray-900 font-medium">
                  {surveyInfo?.courseName ?? "Unknown Course"} -{" "}
                  {surveyInfo?.credit ?? "0"}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Class Code</span>
                <span className="text-gray-900 font-medium">
                  {surveyInfo?.courseCode ?? "Unknown Code"}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Day</span>
                <span className="text-gray-900 font-medium">
                  {surveyInfo?.dayOfWeek ?? "Unknown Day"}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Instructor</span>
                <span className="text-gray-900 font-medium">
                  {surveyInfo?.teacherName ?? "Unknown Instructor"}
                </span>
              </div>
            </div>

            {/* Done Button */}
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3"
              onClick={() => router.back()}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
