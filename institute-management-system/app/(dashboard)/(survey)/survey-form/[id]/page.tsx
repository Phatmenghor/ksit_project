"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  SurveyFormDataModel,
} from "@/model/survey/survey-main-model";
import Loading from "@/components/shared/loading";
import SurveyFormHeader from "@/components/dashboard/survey/form/survey-form-header";
import { useParams, useRouter } from "next/navigation";
import { SurveyCancelDialog } from "@/components/dashboard/survey/form/survey-cancel-dialog";
import SurveySection from "@/components/dashboard/survey/form/survey-section";
import { useSurveyValidation } from "@/hooks/use-survey-validation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { QuestionTypeEnum } from "@/constants/constant";
import SurveySuccessDialog from "@/components/dashboard/survey/form/survey-success-dialog";
import { SurveyResponseModel } from "@/model/survey/survey-response-model";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectSurveyQAData, selectSurveyQAIsLoading } from "@/features/survey/store/selectors/survey-qa-selectors";
import { selectSurveyOperations } from "@/features/survey/store/selectors/survey-selectors";
import { fetchSurveyQAThunk } from "@/features/survey/store/thunks/survey-qa-thunks";
import { submitSurveyThunk } from "@/features/survey/store/thunks/survey-thunks";

export default function SurveyFormPage() {
  const dispatch = useAppDispatch();
  const surveyData = useAppSelector(selectSurveyQAData);
  const isLoading = useAppSelector(selectSurveyQAIsLoading);
  const operations = useAppSelector(selectSurveyOperations);

  const [cancelSurveyDialog, setCancelSurveyDialog] = useState(false);
  const [surveySuccessDialogOpen, setSurveySuccessDialogOpen] = useState(false);
  const [surveyInfo, setSurveyInfo] = useState<SurveyResponseModel | null>(
    null
  );

  const router = useRouter();
  const { validateSection, getUnansweredRequiredQuestions } =
    useSurveyValidation();
  const params = useParams();
  const scheduleId = params.id;

  const form = useForm<SurveyFormDataModel>({
    defaultValues: {
      answers: [],
      overallComment: "",
      overallRating: 0,
    },
    mode: "onChange",
  });

  const { handleSubmit, control } = form;

  const fetchSurveyData = useCallback(async () => {
    try {
      await dispatch(fetchSurveyQAThunk()).unwrap();
    } catch (error) {
      toast.error("Failed to load survey data. Please try again.");
    }
  }, [dispatch]);

  useEffect(() => {
    fetchSurveyData();
  }, [fetchSurveyData]);

  const getSortedSections = useCallback(() => {
    if (!surveyData?.sections) return [];
    return [...surveyData.sections].sort(
      (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
    );
  }, [surveyData?.sections]);

  const sortedSections = getSortedSections();
  const totalSections = sortedSections.length;

  const transformFormDataToApiFormat = useCallback(
    (formData: SurveyFormDataModel) => {
      if (!surveyData?.sections) return [];

      const allQuestions = surveyData.sections.flatMap(
        (section) => section.questions || []
      );

      return Object.entries(formData.answers || {}).map(
        ([questionId, value]) => {
          const question = allQuestions.find(
            (q) => (q.id?.toString() || q.tempId) === questionId
          );

          const answer = {
            questionId: parseInt(questionId),
            textAnswer: "",
            ratingAnswer: 0,
          };

          if (question?.questionType === QuestionTypeEnum.RATING) {
            const rating =
              typeof value === "number"
                ? value
                : parseInt(value as unknown as string);
            answer.ratingAnswer = isNaN(rating) ? 0 : rating;
          } else if (question?.questionType === QuestionTypeEnum.TEXT) {
            answer.textAnswer =
              typeof value === "string" ? value : String(value ?? "");
          }

          return answer;
        }
      );
    },
    [surveyData?.sections]
  );

  const onSubmit = async (formData: SurveyFormDataModel) => {
    if (!surveyData || !scheduleId) {
      toast.error("Survey data or schedule ID is missing.");
      return;
    }

    try {
      const transformedData = {
        answers: transformFormDataToApiFormat(formData),
        overallComment: formData.overallComment,
        overallRating: formData.overallRating,
      };

      const response = await dispatch(
        submitSurveyThunk({
          scheduleId: Number(scheduleId),
          data: transformedData,
        })
      ).unwrap();

      setSurveyInfo(response);
      setSurveySuccessDialogOpen(true);
      toast.success("Survey submitted successfully!");
    } catch (error: any) {
      toast.error(
        error.message || "Failed to submit survey. Please try again."
      );
    }
  };

  const handleCancel = useCallback(() => {
    setCancelSurveyDialog(false);
    router.back();
  }, [router]);

  // Validate all sections
  const validateAllSections = useCallback(() => {
    const formData = form.getValues();

    for (const section of sortedSections) {
      const isSectionValid = validateSection(section, formData);
      if (!isSectionValid) {
        const unanswered = getUnansweredRequiredQuestions(section, formData);
        toast.warning(
          `Please answer all required questions in section "${
            section.title
          }". Unanswered questions: ${unanswered.join(", ")}`
        );
        return false;
      }
    }

    return true;
  }, [sortedSections, validateSection, getUnansweredRequiredQuestions, form]);

  // Handle manual submit with validation
  const handleManualSubmit = useCallback(async () => {
    const isFormValid = validateAllSections();

    if (isFormValid) {
      const formData = form.getValues();
      await onSubmit(formData);
    }
  }, [validateAllSections, form, onSubmit]);

  // Loading state
  if (isLoading) {
    return <Loading />;
  }

  // Error state
  if (!surveyData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-600">Failed to load survey data.</p>
          <Button onClick={fetchSurveyData} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // No sections available
  if (totalSections === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No survey sections available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-fit">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-2">
        {/* Header */}
        <SurveyFormHeader
          handleBack={() => router.back()}
          surveyData={surveyData}
        />

        {/* Main Content - Show all sections */}
        <div className="mx-auto space-y-4">
          {sortedSections.map((section, index) => (
            <div key={section?.id || section?.tempId} className="space-y-4">
              {/* Section Header */}
              <Card className="p-4 bg-gradient-to-r from-teal-50 to-blue-50 border-l-4 border-teal-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <span className="bg-teal-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      {section.title || `Section ${index + 1}`}
                    </h3>
                    {section.description && (
                      <p className="text-gray-600 mt-2 text-sm leading-relaxed ml-8">
                        {section.description}
                      </p>
                    )}
                  </div>
                </div>
              </Card>

              {/* Section Content */}
              <SurveySection section={section} control={control} />
            </div>
          ))}

          {/* Navigation Footer */}
          <Card className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCancelSurveyDialog(true)}
                >
                  Cancel
                </Button>
              </div>

              <div className="flex gap-2 items-center">
                <Button
                  type="submit"
                  disabled={operations.isSubmitting}
                  className="bg-teal-900 hover:bg-teal-950"
                >
                  {operations.isSubmitting ? "Submitting..." : "Submit Survey"}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <SurveySuccessDialog
          onOpenChange={() => setSurveySuccessDialogOpen(false)}
          open={surveySuccessDialogOpen}
          surveyInfo={surveyInfo}
        />

        {/* Cancel Dialog */}
        <SurveyCancelDialog
          description="Are you sure you want to cancel this survey? Your progress will be lost."
          cancelText="Discard"
          onConfirm={handleCancel}
          onOpenChange={() => {
            setCancelSurveyDialog(false);
          }}
          open={cancelSurveyDialog}
          title="Cancel Survey"
        />
      </form>
    </div>
  );
}
