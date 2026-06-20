"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Copy, Minus, ArrowUp, ArrowDown, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { z } from "zod";
import { Separator } from "@/components/ui/separator";

import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectSurveyQAData,
  selectSurveyQAIsLoading,
  selectSurveyQAIsSaving,
} from "@/features/survey/store/selectors/survey-qa-selectors";
import { fetchSurveyQAThunk, saveSurveyQAThunk } from "@/features/survey/store/thunks/survey-qa-thunks";
import { toast } from "sonner";
import {
  Question,
  Section,
  SurveyMainModel,
} from "@/model/survey/survey-main-model";
import Loading from "@/components/shared/loading";
import { CardHeaderSection } from "@/components/shared/layout/card-header-section";
import { ROUTE } from "@/constants/routes";

const RatingOptionSchema = z.object({
  value: z.number().nullable().optional(),
  label: z.string().nullable().optional(),
});

const QuestionSchema = z.object({
  id: z.number().nullable().optional(),
  questionText: z.string().nullable().optional(),
  questionType: z.string().nullable().optional(),
  required: z.boolean().nullable().optional(),
  displayOrder: z.number().nullable().optional(),
  minRating: z.number().nullable().optional(),
  maxRating: z.number().nullable().optional(),
  leftLabel: z.string().nullable().optional(),
  rightLabel: z.string().nullable().optional(),
  ratingOptions: z.array(RatingOptionSchema).nullable().optional(),
  isNew: z.boolean().nullable().optional(),
  tempId: z.string().nullable().optional(),
});

const SectionSchema = z.object({
  id: z.number().nullable().optional(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  displayOrder: z.number().nullable().optional(),
  questions: z.array(QuestionSchema).nullable().optional(),
  isNew: z.boolean().nullable().optional(),
  tempId: z.string().nullable().optional(),
});

const SurveySchema = z.object({
  id: z.number().nullable().optional(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  createdBy: z.any().nullable().optional(),
  sections: z.array(SectionSchema).nullable().optional(),
  createdAt: z.string().nullable().optional(),
});

interface QuestionProps {
  question: Question;
  questionNumber: string;
  onUpdate: (question: Question) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

// Question Component for TEXT type
const ParagraphQuestion: React.FC<QuestionProps> = ({
  question,
  questionNumber,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  isFirst = false,
  isLast = false,
}) => {
  return (
    <Card className="mb-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-600"></div>

      <CardContent className="p-5">
        <div className="flex gap-4 items-start">
          <div className="flex items-center justify-center bg-teal-50 text-teal-800 border border-teal-200 rounded-lg h-9 w-12 font-semibold text-sm shrink-0">
            {questionNumber}
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex gap-3 items-center">
              <Input
                type="text"
                value={question.questionText || ""}
                onChange={(e) => onUpdate({ ...question, questionText: e.target.value })}
                placeholder="Enter your question..."
                className="flex-1 h-10 font-medium text-gray-800"
              />
            </div>

            <div className="p-3 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
              <p className="text-gray-400 text-sm">Long text answer input placeholder</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Switch
                  id={`required-${question.tempId || question.id}`}
                  checked={question.required ?? true}
                  onCheckedChange={(checked) => onUpdate({ ...question, required: checked })}
                />
                <Label
                  htmlFor={`required-${question.tempId || question.id}`}
                  className="text-xs font-semibold text-gray-600 cursor-pointer"
                >
                  Required Question
                </Label>
              </div>

              <div className="flex items-center gap-1">
                {onMoveUp && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isFirst}
                    onClick={onMoveUp}
                    className="p-1.5 h-8 w-8 hover:bg-teal-50 text-teal-800 disabled:opacity-30"
                    title="Move Question Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                )}
                {onMoveDown && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isLast}
                    onClick={onMoveDown}
                    className="p-1.5 h-8 w-8 hover:bg-teal-50 text-teal-800 disabled:opacity-30"
                    title="Move Question Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                )}
                <Separator orientation="vertical" className="mx-1 h-5 bg-gray-250" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDuplicate}
                  className="p-1.5 h-8 w-8 hover:bg-teal-50 text-teal-800"
                  title="Duplicate Question"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  className="p-1.5 h-8 w-8 hover:bg-red-50 text-red-600 hover:text-red-700"
                  title="Delete Question"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Question Component for RATING type
const LinearQuestion: React.FC<QuestionProps> = ({
  question,
  questionNumber,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  isFirst = false,
  isLast = false,
}) => {
  return (
    <Card className="mb-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>

      <CardContent className="p-5">
        <div className="flex gap-4 items-start">
          <div className="flex items-center justify-center bg-amber-50 text-amber-800 border border-amber-200 rounded-lg h-9 w-12 font-semibold text-sm shrink-0">
            {questionNumber}
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex gap-3 items-center">
              <Input
                type="text"
                value={question.questionText || ""}
                onChange={(e) => onUpdate({ ...question, questionText: e.target.value })}
                placeholder="Enter your question..."
                className="flex-1 h-10 font-medium text-gray-800"
              />
            </div>

            <div className="flex items-center gap-4 bg-gray-50/50 p-3 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 flex-1">
                <Label className="text-xs font-semibold text-amber-800 whitespace-nowrap bg-amber-50 px-2 py-1 rounded border border-amber-200">
                  Min Label (1)
                </Label>
                <Input
                  type="text"
                  value={question.leftLabel || ""}
                  onChange={(e) => onUpdate({ ...question, leftLabel: e.target.value })}
                  placeholder="e.g., Strongly Disagree"
                  className="flex-1 h-9 bg-white"
                />
              </div>

              <div className="flex items-center justify-center text-gray-400">
                <Minus className="w-5 h-5" />
              </div>

              <div className="flex items-center gap-2 flex-1">
                <Input
                  type="text"
                  value={question.rightLabel || ""}
                  onChange={(e) => onUpdate({ ...question, rightLabel: e.target.value })}
                  placeholder="e.g., Strongly Agree"
                  className="flex-1 h-9 bg-white"
                />
                <Label className="text-xs font-semibold text-amber-800 whitespace-nowrap bg-amber-50 px-2 py-1 rounded border border-amber-200">
                  Max Label (5)
                </Label>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Switch
                  id={`required-${question.tempId || question.id}`}
                  checked={question.required ?? true}
                  onCheckedChange={(checked) => onUpdate({ ...question, required: checked })}
                />
                <Label
                  htmlFor={`required-${question.tempId || question.id}`}
                  className="text-xs font-semibold text-gray-600 cursor-pointer"
                >
                  Required Question
                </Label>
              </div>

              <div className="flex items-center gap-1">
                {onMoveUp && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isFirst}
                    onClick={onMoveUp}
                    className="p-1.5 h-8 w-8 hover:bg-amber-50 text-amber-800 disabled:opacity-30"
                    title="Move Question Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                )}
                {onMoveDown && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isLast}
                    onClick={onMoveDown}
                    className="p-1.5 h-8 w-8 hover:bg-amber-50 text-amber-800 disabled:opacity-30"
                    title="Move Question Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                )}
                <Separator orientation="vertical" className="mx-1 h-5 bg-gray-250" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDuplicate}
                  className="p-1.5 h-8 w-8 hover:bg-amber-50 text-amber-800"
                  title="Duplicate Question"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  className="p-1.5 h-8 w-8 hover:bg-red-50 text-red-600 hover:text-red-700"
                  title="Delete Question"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Section Component Props
interface SectionProps {
  section: Section;
  sectionNumber: number;
  totalSections: number;
  onUpdate: (section: Section) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

// Section Component
const SectionComponent: React.FC<SectionProps> = ({
  section,
  sectionNumber,
  totalSections,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst = false,
  isLast = false,
}) => {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);

  const questions = section.questions || [];

  const handleAddQuestion = (type: "TEXT" | "RATING") => {
    const tempId = `temp-question-${Date.now()}-${Math.random()}`;
    const newQuestion: Question = {
      questionText: "",
      questionType: type,
      required: true,
      displayOrder: questions.length + 1,
      minRating: 1,
      maxRating: 5,
      leftLabel: type === "RATING" ? "" : undefined,
      rightLabel: type === "RATING" ? "" : undefined,
      ratingOptions: type === "RATING" ? [] : undefined,
      isNew: true,
      tempId,
    };

    onUpdate({
      ...section,
      questions: [...questions, newQuestion],
    });
    setShowDropdown(false);
  };

  const handleUpdateQuestion = (updatedQuestion: Question) => {
    const updatedQuestions = questions.map((q) => {
      if (q.tempId && q.tempId === updatedQuestion.tempId) return updatedQuestion;
      if (q.id && q.id === updatedQuestion.id) return updatedQuestion;
      return q;
    });

    onUpdate({
      ...section,
      questions: updatedQuestions,
    });
  };

  const handleDeleteQuestion = (qIndex: number) => {
    const updatedQuestions = questions.filter((_, idx) => idx !== qIndex);
    onUpdate({
      ...section,
      questions: updatedQuestions,
    });
  };

  const handleDuplicateQuestion = (questionToDuplicate: Question, qIndex: number) => {
    const tempId = `temp-question-${Date.now()}-${Math.random()}`;
    const duplicated: Question = {
      ...questionToDuplicate,
      id: undefined,
      isNew: true,
      tempId,
    };

    const updatedQuestions = [...questions];
    updatedQuestions.splice(qIndex + 1, 0, duplicated);

    onUpdate({
      ...section,
      questions: updatedQuestions,
    });
  };

  const handleMoveQuestion = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= questions.length) return;
    const updatedQuestions = [...questions];
    const [moved] = updatedQuestions.splice(fromIndex, 1);
    updatedQuestions.splice(toIndex, 0, moved);

    onUpdate({
      ...section,
      questions: updatedQuestions,
    });
  };

  return (
    <Card className="mb-6 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 relative">
      <div id={`section-anchor-${sectionNumber}`} className="absolute -top-24"></div>

      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded">
              Section {sectionNumber} of {totalSections}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onMoveUp && (
              <Button
                variant="ghost"
                size="sm"
                disabled={isFirst}
                onClick={onMoveUp}
                className="h-8 px-2 text-[#024D3E] hover:text-teal-700 hover:bg-teal-50 disabled:opacity-30"
                title="Move Section Up"
              >
                <ArrowUp className="w-4 h-4 mr-1" />
                Up
              </Button>
            )}
            {onMoveDown && (
              <Button
                variant="ghost"
                size="sm"
                disabled={isLast}
                onClick={onMoveDown}
                className="h-8 px-2 text-[#024D3E] hover:text-teal-700 hover:bg-teal-50 disabled:opacity-30"
                title="Move Section Down"
              >
                <ArrowDown className="w-4 h-4 mr-1" />
                Down
              </Button>
            )}
            <Separator orientation="vertical" className="mx-1 h-5 bg-gray-250" />
            <DropdownMenu open={showDropdown} onOpenChange={setShowDropdown}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#024D3E] hover:text-teal-700 hover:bg-teal-50 font-semibold"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Question
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="p-2">
                  <div className="text-xs font-bold text-gray-500 mb-2 px-2 uppercase tracking-wider">
                    Select Question Type
                  </div>
                  <div className="border-b mb-2"></div>
                  <DropdownMenuItem
                    onClick={() => handleAddQuestion("TEXT")}
                    className="cursor-pointer font-medium"
                  >
                    <span className="w-2.5 h-2.5 bg-teal-600 rounded-full mr-3 shrink-0"></span>
                    Paragraph
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleAddQuestion("RATING")}
                    className="cursor-pointer font-medium"
                  >
                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-full mr-3 shrink-0"></span>
                    Linear Scale (1-5)
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 font-semibold"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Delete Section
            </Button>
          </div>
        </div>

        <Separator className="mt-3 mb-4" />

        <div className="mb-6">
          <div className="flex gap-4 items-center">
            <div className="border-l-4 border-[#024D3E] rounded-lg h-10"></div>
            <Input
              type="text"
              placeholder="Name Section..."
              className="flex-1 h-11 text-lg font-bold text-gray-900 border-none bg-gray-50/50 focus-visible:ring-0 focus-visible:bg-white focus-visible:border-gray-300 border-b border-dashed border-gray-300 rounded-none px-2 transition-all"
              value={section.title || ""}
              onChange={(e) => onUpdate({ ...section, title: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-4">
          {questions.map((question, index) => {
            const key = question.tempId || question.id || `q-${index}-${Math.random()}`;
            const questionNumber = `${sectionNumber}.${index + 1}`;

            const qProps: QuestionProps = {
              question,
              questionNumber,
              onUpdate: handleUpdateQuestion,
              onDelete: () => handleDeleteQuestion(index),
              onDuplicate: () => handleDuplicateQuestion(question, index),
              onMoveUp: () => handleMoveQuestion(index, index - 1),
              onMoveDown: () => handleMoveQuestion(index, index + 1),
              isFirst: index === 0,
              isLast: index === questions.length - 1,
            };

            if (question.questionType === "TEXT") {
              return <ParagraphQuestion key={key} {...qProps} />;
            } else if (question.questionType === "RATING") {
              return <LinearQuestion key={key} {...qProps} />;
            }
            return null;
          })}
        </div>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-600 font-bold">Delete Section?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                Are you sure you want to delete this section? All questions inside this section will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  onRemove();
                  setShowDeleteDialog(false);
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

// Main Survey Manager Component
const SurveyManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const surveyData = useAppSelector(selectSurveyQAData);
  const isLoading = useAppSelector(selectSurveyQAIsLoading);
  const isSaving = useAppSelector(selectSurveyQAIsSaving);

  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    dispatch(fetchSurveyQAThunk());
  }, [dispatch]);

  useEffect(() => {
    if (surveyData) {
      setSections(surveyData.sections || []);
    }
  }, [surveyData]);

  const handleAddSection = () => {
    const tempId = `temp-section-${Date.now()}-${Math.random()}`;
    const newSection: Section = {
      title: "",
      description: "",
      displayOrder: sections.length + 1,
      questions: [],
      isNew: true,
      tempId,
    };
    setSections((prevSections) => [...prevSections, newSection]);
  };

  const handleUpdateSection = useCallback((updatedSection: Section) => {
    setSections((prevSections) =>
      prevSections.map((section) => {
        if (section.tempId && section.tempId === updatedSection.tempId) return updatedSection;
        if (section.id && section.id === updatedSection.id) return updatedSection;
        return section;
      })
    );
  }, []);

  const handleRemoveSection = (sectionToRemove: Section) => {
    setSections((prevSections) =>
      prevSections.filter((section) => {
        if (sectionToRemove.tempId) return section.tempId !== sectionToRemove.tempId;
        return section.id !== sectionToRemove.id;
      })
    );
  };

  const handleMoveSection = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= sections.length) return;
    const updatedSections = [...sections];
    const [moved] = updatedSections.splice(fromIndex, 1);
    updatedSections.splice(toIndex, 0, moved);
    setSections(updatedSections);
  };

  const cleanDataForApi = (data: SurveyMainModel): SurveyMainModel => {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status,
      createdBy: data.createdBy,
      createdAt: data.createdAt,
      sections: data.sections?.map((section, sIdx) => ({
        ...(section.id && { id: section.id }),
        title: section.title,
        description: section.description,
        displayOrder: sIdx + 1,
        questions: section.questions?.map((question, qIdx) => ({
          ...(question.id && { id: question.id }),
          questionText: question.questionText,
          questionType: question.questionType,
          required: question.required !== undefined ? question.required : true,
          displayOrder: qIdx + 1,
          minRating: question.minRating,
          maxRating: question.maxRating,
          leftLabel: question.leftLabel,
          rightLabel: question.rightLabel,
          ratingOptions:
            question.questionType === "RATING"
              ? [
                  { value: 1, label: question.leftLabel || "1" },
                  { value: 2, label: "2" },
                  { value: 3, label: "3" },
                  { value: 4, label: "4" },
                  { value: 5, label: question.rightLabel || "5" },
                ]
              : question.ratingOptions,
        })),
      })),
    };
  };

  const handleSave = async () => {
    if (!surveyData) {
      toast.error("No survey data available to save");
      return;
    }

    const cleanedData = cleanDataForApi({ ...surveyData, sections });

    try {
      await dispatch(saveSurveyQAThunk(cleanedData)).unwrap();
      toast.success("Survey saved successfully!");
    } catch {
      toast.error("Failed to save survey data. Please try again.");
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6 py-6 px-4 max-w-6xl mx-auto">
      <CardHeaderSection
        title="Survey Questions Builder"
        breadcrumbs={[
          { label: "Dashboard", href: ROUTE.DASHBOARD },
          { label: "Manage Q&As", href: "" },
        ]}
      />

      <Card className="relative overflow-hidden border border-gray-250 shadow-sm bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-800 text-white rounded-xl">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center justify-center p-8">
          <GraduationCap size={180} />
        </div>
        <CardContent className="p-6 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="bg-teal-500/20 text-teal-200 border border-teal-500/30 text-xs uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full">
                Survey Template Details
              </span>
              <h2 className="text-2xl font-bold mt-2">{surveyData?.title || "Survey Template"}</h2>
              {surveyData?.description && (
                <p className="text-teal-100/80 text-sm mt-1 max-w-xl">{surveyData.description}</p>
              )}
            </div>
            <div>
              <Badge className="bg-teal-600 border border-teal-500 text-white text-xs uppercase tracking-wider font-bold px-3 py-1">
                {surveyData?.status || "DRAFT"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="hidden lg:block w-64 shrink-0">
          <Card className="sticky top-24 border border-gray-200 shadow-sm">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider">Sections</h3>
              <div className="space-y-1.5">
                {sections.map((section, index) => (
                  <button
                    key={section.tempId || section.id || index}
                    onClick={() => {
                      const element = document.getElementById(`section-anchor-${index + 1}`);
                      if (element) {
                        element.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:bg-teal-50 hover:text-[#024D3E] flex items-center justify-between text-gray-600"
                  >
                    <span className="truncate max-w-[140px]">
                      {index + 1}. {section.title || "Untitled Section"}
                    </span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px] border">
                      {section.questions?.length || 0} Qs
                    </span>
                  </button>
                ))}
              </div>
              <Separator />
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddSection}
                className="w-full text-xs border-dashed text-[#024D3E] hover:text-[#024D3E]/80"
              >
                + Add Section
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 space-y-4">
          {sections.map((section, index) => {
            const key = section.tempId || section.id || `s-${index}-${Math.random()}`;
            return (
              <SectionComponent
                key={key}
                section={section}
                sectionNumber={index + 1}
                totalSections={sections.length}
                onUpdate={handleUpdateSection}
                onRemove={() => handleRemoveSection(section)}
                onMoveUp={() => handleMoveSection(index, index - 1)}
                onMoveDown={() => handleMoveSection(index, index + 1)}
                isFirst={index === 0}
                isLast={index === sections.length - 1}
              />
            );
          })}

          <Card className="border border-dashed border-gray-300 hover:border-teal-500 transition-colors">
            <CardContent className="p-4 flex justify-center">
              <Button
                variant="ghost"
                onClick={handleAddSection}
                className="text-[#024D3E] hover:text-teal-700 font-semibold"
              >
                + Add New Section
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-none border border-gray-200">
            <CardContent className="p-4 flex justify-between items-center bg-gray-50/50">
              <span className="text-xs font-semibold text-gray-500">
                Ensure all sections and questions are correctly named before saving.
              </span>
              <Button
                type="submit"
                onClick={handleSave}
                className="bg-[#024D3E] hover:bg-teal-700 font-semibold text-white px-6"
                disabled={!surveyData || isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Saving...
                  </>
                ) : (
                  "Save Survey"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SurveyManager;
