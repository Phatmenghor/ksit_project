"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Copy, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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

import {
  getAllSurveySectionService,
  updateSurveyService,
} from "@/service/survey/survey.service";
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
  // Internal tracking properties
  isNew: z.boolean().nullable().optional(),
  tempId: z.string().nullable().optional(),
});

const SectionSchema = z.object({
  id: z.number().nullable().optional(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  displayOrder: z.number().nullable().optional(),
  questions: z.array(QuestionSchema).nullable().optional(),
  // Internal tracking properties
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
  onUpdate: (question: Question) => void;
  onDelete: (id: number | string) => void;
  onDuplicate: (question: Question) => void;
}

// Question Component for TEXT type
const ParagraphQuestion: React.FC<QuestionProps> = ({
  question,
  onUpdate,
  onDelete,
  onDuplicate,
}) => {
  const [questionText, setQuestionText] = useState<string>(
    question.questionText || ""
  );
  const [displayOrder, setDisplayOrder] = useState<number | string>(
    question.displayOrder !== undefined ? question.displayOrder : ""
  );

  // Sync local state with prop changes (crucial for duplicated questions)
  useEffect(() => {
    setQuestionText(question.questionText || "");
    // Only update displayOrder if it's actually different to prevent input field flickering
    const newDisplayOrder =
      question.displayOrder !== undefined ? question.displayOrder : "";
    if (displayOrder !== newDisplayOrder) {
      setDisplayOrder(newDisplayOrder);
    }
  }, [
    question.questionText,
    question.displayOrder,
    question.tempId,
    question.id,
  ]);

  const handleQuestionTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setQuestionText(newText);

    const updatedQuestion = {
      ...question,
      questionText: newText,
    };
    onUpdate(updatedQuestion);
  };

  const handleDisplayOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayOrder(inputValue);

    // Allow empty string but don't update the question object until we have a valid number
    if (inputValue === "") {
      return;
    }

    const newOrder = parseInt(inputValue);
    if (!isNaN(newOrder) && newOrder >= 1) {
      const updatedQuestion = {
        ...question,
        displayOrder: newOrder,
      };
      onUpdate(updatedQuestion);
    }
  };

  const getQuestionId = () => {
    return question.tempId || question.id;
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="space-y-3">
              <div className="flex gap-3 items-center">
                <Input
                  type="text"
                  value={displayOrder}
                  onChange={handleDisplayOrderChange}
                  placeholder="#"
                  className="w-16 text-center"
                />
                <Input
                  type="text"
                  value={questionText}
                  onChange={handleQuestionTextChange}
                  placeholder="Enter your question..."
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDuplicate(question)}
              className="p-2"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(getQuestionId()!)}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="mt-3">
          <div className="p-3 bg-gray-50 rounded border-dashed border-2 border-gray-200">
            <p className="text-gray-500 text-sm">Answer Text Input</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Question Component for RATING type
const LinearQuestion: React.FC<QuestionProps> = ({
  question,
  onUpdate,
  onDelete,
  onDuplicate,
}) => {
  const [questionText, setQuestionText] = useState<string>(
    question.questionText || ""
  );
  const [leftLabel, setLeftLabel] = useState<string>(question.leftLabel || "");
  const [rightLabel, setRightLabel] = useState<string>(
    question.rightLabel || ""
  );
  const [displayOrder, setDisplayOrder] = useState<number | string>(
    question.displayOrder !== undefined ? question.displayOrder : ""
  );

  // Sync local state with prop changes (crucial for duplicated questions)
  useEffect(() => {
    setQuestionText(question.questionText || "");
    setLeftLabel(question.leftLabel || "");
    setRightLabel(question.rightLabel || "");
    // Only update displayOrder if it's actually different to prevent input field flickering
    const newDisplayOrder =
      question.displayOrder !== undefined ? question.displayOrder : "";
    if (displayOrder !== newDisplayOrder) {
      setDisplayOrder(newDisplayOrder);
    }
  }, [
    question.questionText,
    question.leftLabel,
    question.rightLabel,
    question.displayOrder,
    question.tempId,
    question.id,
  ]);

  const updateQuestion = useCallback(
    (updates: Partial<Question>) => {
      const updatedQuestion: Question = {
        ...question,
        ...updates,
        minRating: 1,
        maxRating: 5,
        ratingOptions: [
          {
            value: 1,
            label:
              updates.leftLabel !== undefined
                ? updates.leftLabel
                : leftLabel || "1",
          },
          { value: 2, label: "2" },
          { value: 3, label: "3" },
          { value: 4, label: "4" },
          {
            value: 5,
            label:
              updates.rightLabel !== undefined
                ? updates.rightLabel
                : rightLabel || "5",
          },
        ],
      };
      onUpdate(updatedQuestion);
    },
    [question, leftLabel, rightLabel, onUpdate]
  );

  const handleQuestionTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setQuestionText(newText);
    updateQuestion({ questionText: newText });
  };

  const handleLeftLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLabel = e.target.value;
    setLeftLabel(newLabel);
    updateQuestion({ leftLabel: newLabel });
  };

  const handleRightLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLabel = e.target.value;
    setRightLabel(newLabel);
    updateQuestion({ rightLabel: newLabel });
  };

  const handleDisplayOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayOrder(inputValue);

    // Allow empty string but don't update the question object until we have a valid number
    if (inputValue === "") {
      return;
    }

    const newOrder = parseInt(inputValue);
    if (!isNaN(newOrder) && newOrder >= 1) {
      updateQuestion({ displayOrder: newOrder });
    }
  };

  const getQuestionId = () => {
    return question.tempId || question.id;
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        {/* First Row: Question Number, Text, and Action Buttons */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-3 items-center flex-1">
            <Input
              type="text"
              value={displayOrder}
              onChange={handleDisplayOrderChange}
              placeholder="#"
              className="w-16 text-center"
            />
            <Input
              type="text"
              value={questionText}
              onChange={handleQuestionTextChange}
              placeholder="Enter your question..."
              className="flex-1"
            />
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDuplicate(question)}
              className="p-2"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(getQuestionId()!)}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Second Row: Left Label, Minus Icon, Right Label */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Label className="text-sm font-medium text-gray-700">(1)</Label>
            <Input
              type="text"
              value={leftLabel}
              onChange={handleLeftLabelChange}
              placeholder="e.g., Very Disagree"
              className="flex-1"
            />
          </div>

          <div className="flex items-center justify-center">
            <Minus className="w-5 h-5 text-gray-500" />
          </div>

          <div className="flex items-center gap-2 flex-1">
            <Input
              type="text"
              value={rightLabel}
              onChange={handleRightLabelChange}
              placeholder="e.g., Strongly Agree"
              className="flex-1"
            />
            <Label className="text-sm font-medium text-gray-700">(5)</Label>
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
}

// Section Component
const SectionComponent: React.FC<SectionProps> = ({
  section,
  sectionNumber,
  totalSections,
  onUpdate,
  onRemove,
}) => {
  const [sectionTitle, setSectionTitle] = useState<string>(section.title || "");
  const [sectionDisplayOrder, setSectionDisplayOrder] = useState<
    number | string
  >(section.displayOrder !== undefined ? section.displayOrder : "");
  const [questions, setQuestions] = useState<Question[]>(
    section.questions || []
  );
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);

  // Track if this is the initial mount to prevent unnecessary updates
  const isInitialMount = React.useRef(true);

  // Sync section questions when section prop changes
  useEffect(() => {
    setQuestions(section.questions || []);
    setSectionTitle(section.title || "");
    // Only update displayOrder if it's actually different to prevent input field flickering
    const newDisplayOrder =
      section.displayOrder !== undefined ? section.displayOrder : "";
    if (sectionDisplayOrder !== newDisplayOrder) {
      setSectionDisplayOrder(newDisplayOrder);
    }
  }, [
    section.questions,
    section.title,
    section.displayOrder,
    section.tempId,
    section.id,
  ]);

  // Debounced update function to prevent excessive updates
  const debouncedUpdate = useCallback(
    (updatedSection: Section) => {
      // Use setTimeout to defer the update and prevent infinite loops
      const timeoutId = setTimeout(() => {
        onUpdate(updatedSection);
      }, 0);

      return () => clearTimeout(timeoutId);
    },
    [onUpdate]
  );

  const handleSectionTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setSectionTitle(newTitle);

    const updatedSection = {
      ...section,
      title: newTitle,
      questions: questions,
    };
    debouncedUpdate(updatedSection);
  };

  const handleSectionDisplayOrderChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputValue = e.target.value;
    setSectionDisplayOrder(inputValue);

    // Allow empty string but don't update the section object until we have a valid number
    if (inputValue === "") {
      return;
    }

    const newOrder = parseInt(inputValue);
    if (!isNaN(newOrder) && newOrder >= 1) {
      const updatedSection = {
        ...section,
        displayOrder: newOrder,
        questions: questions,
      };
      debouncedUpdate(updatedSection);
    }
  };

  const handleAddQuestion = (type: "TEXT" | "RATING") => {
    const tempId = `temp-question-${Date.now()}-${Math.random()}`;
    const newQuestion: Question = {
      questionText: "",
      questionType: type,
      required: true,
      displayOrder: undefined, // Let user set the display order
      minRating: 1,
      maxRating: 5,
      leftLabel: type === "RATING" ? "" : undefined,
      rightLabel: type === "RATING" ? "" : undefined,
      ratingOptions: type === "RATING" ? [] : undefined,
      isNew: true,
      tempId,
    };

    const updatedQuestions = [...questions, newQuestion];
    setQuestions(updatedQuestions);

    const updatedSection = {
      ...section,
      questions: updatedQuestions,
    };
    debouncedUpdate(updatedSection);

    setShowDropdown(false);
  };

  const handleUpdateQuestion = useCallback(
    (updatedQuestion: Question) => {
      const updatedQuestions = questions.map((q) => {
        // Check for temp ID first, then regular ID
        if (q.tempId && q.tempId === updatedQuestion.tempId) {
          return updatedQuestion;
        }
        if (q.id && q.id === updatedQuestion.id) {
          return updatedQuestion;
        }
        return q;
      });

      setQuestions(updatedQuestions);

      const updatedSection = {
        ...section,
        questions: updatedQuestions,
      };
      debouncedUpdate(updatedSection);
    },
    [questions, section, debouncedUpdate]
  );

  const handleDeleteQuestion = (questionId: number | string) => {
    const updatedQuestions = questions.filter((q) => {
      // Handle both temp IDs (string) and regular IDs (number)
      if (typeof questionId === "string") {
        return q.tempId !== questionId;
      } else {
        return q.id !== questionId;
      }
    });

    setQuestions(updatedQuestions);

    const updatedSection = {
      ...section,
      questions: updatedQuestions,
    };
    debouncedUpdate(updatedSection);
  };

  const handleDuplicateQuestion = (questionToDuplicate: Question) => {
    const tempId = `temp-question-${Date.now()}-${Math.random()}`;
    const duplicated: Question = {
      ...questionToDuplicate,
      id: undefined, // Remove ID so backend assigns new one
      displayOrder: undefined, // Let user set the display order
      isNew: true,
      tempId,
    };

    const updatedQuestions = [...questions, duplicated];
    setQuestions(updatedQuestions);

    const updatedSection = {
      ...section,
      questions: updatedQuestions,
    };
    debouncedUpdate(updatedSection);
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Section {sectionNumber} of {totalSections}
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu open={showDropdown} onOpenChange={setShowDropdown}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#024D3E] hover:text-teal-700 hover:underline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <div className="p-2">
                  <div className="text-sm font-medium text-gray-600 mb-2 px-2">
                    Select Question Type
                  </div>
                  <div className="border-b mb-2"></div>
                  <DropdownMenuItem
                    onClick={() => handleAddQuestion("TEXT")}
                    className="cursor-pointer"
                  >
                    <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                    Paragraph
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleAddQuestion("RATING")}
                    className="cursor-pointer"
                  >
                    <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                    Linear Scale
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:underline"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Section
            </Button>
          </div>
        </div>

        <Separator className="mt-2 mb-4" />

        {/* Section Title */}
        <div className="mb-6">
          <div className="flex gap-4 items-center">
            <div className="border-l-4 border-[#024D3E] rounded-lg h-12"></div>
            <Input
              type="text"
              value={sectionDisplayOrder}
              onChange={handleSectionDisplayOrderChange}
              placeholder="#"
              className="w-16 text-center"
            />
            <Input
              type="text"
              placeholder="Name Section..."
              className="flex-1"
              value={sectionTitle}
              onChange={handleSectionTitleChange}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {questions.map((question) => {
            // Use tempId for new questions, id for existing ones
            const key = question.tempId || question.id || `q-${Math.random()}`;

            if (question.questionType === "TEXT") {
              return (
                <ParagraphQuestion
                  key={key}
                  question={question}
                  onUpdate={handleUpdateQuestion}
                  onDelete={handleDeleteQuestion}
                  onDuplicate={handleDuplicateQuestion}
                />
              );
            } else if (question.questionType === "RATING") {
              return (
                <LinearQuestion
                  key={key}
                  question={question}
                  onUpdate={handleUpdateQuestion}
                  onDelete={handleDeleteQuestion}
                  onDuplicate={handleDuplicateQuestion}
                />
              );
            }
            return null;
          })}
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Delete!</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this section?
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
  const [sections, setSections] = useState<Section[]>([]);
  const [surveyData, setSurveyData] = useState<SurveyMainModel | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadSurveyApi = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllSurveySectionService();
      if (response) {
        const surveyData = SurveySchema.parse(response) as SurveyMainModel;
        setSurveyData(surveyData);
        setSections(surveyData.sections || []);
      } else {
        console.warn("No survey data found");
        setSurveyData(null);
        setSections([]);
      }
    } catch (error) {
      toast.error("Failed to load survey data");
      setSurveyData(null);
      setSections([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSurveyApi();
  }, [loadSurveyApi]);

  const handleAddSection = () => {
    const tempId = `temp-section-${Date.now()}-${Math.random()}`;
    const newSection: Section = {
      title: "",
      description: "",
      displayOrder: undefined, // Let user set the display order
      questions: [],
      isNew: true,
      tempId,
    };
    setSections((prevSections) => [...prevSections, newSection]);
  };

  const handleUpdateSection = useCallback((updatedSection: Section) => {
    setSections((prevSections) =>
      prevSections.map((section) => {
        // Check for temp ID first, then regular ID
        if (section.tempId && section.tempId === updatedSection.tempId) {
          return updatedSection;
        }
        if (section.id && section.id === updatedSection.id) {
          return updatedSection;
        }
        return section;
      })
    );
  }, []);

  const handleRemoveSection = (sectionToRemove: Section) => {
    setSections((prevSections) =>
      prevSections.filter((section) => {
        // Handle both temp IDs and regular IDs
        if (sectionToRemove.tempId) {
          return section.tempId !== sectionToRemove.tempId;
        }
        return section.id !== sectionToRemove.id;
      })
    );
  };

  // Clean data before sending to API - preserves user's displayOrder input
  const cleanDataForApi = (data: SurveyMainModel): SurveyMainModel => {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status,
      createdBy: data.createdBy,
      createdAt: data.createdAt,
      sections: data.sections?.map((section) => ({
        ...(section.id && { id: section.id }), // Only include ID if it exists
        title: section.title,
        description: section.description,
        displayOrder: section.displayOrder || 0, // Keep user's input exactly as they entered it
        questions: section.questions?.map((question) => ({
          ...(question.id && { id: question.id }), // Only include ID if it exists
          questionText: question.questionText,
          questionType: question.questionType,
          required: question.required,
          displayOrder: question.displayOrder || 0, // Keep user's input exactly as they entered it
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
    try {
      if (!surveyData) {
        toast.error("No survey data available to save");
        return;
      }

      setIsSubmitting(true);

      // Prepare data for API using the current survey data structure
      const updatedSurveyData: SurveyMainModel = {
        ...surveyData,
        sections: sections,
      };

      console.log("## Saving before survey data:", updatedSurveyData);

      // Clean the data by removing temp properties and handling IDs properly
      const cleanedData = cleanDataForApi(updatedSurveyData);

      console.log("## Saving survey data:", cleanedData);
      const response = await updateSurveyService(cleanedData);

      if (response) {
        const surveyData = SurveySchema.parse(response) as SurveyMainModel;
        setSurveyData(surveyData);
        setSections(surveyData.sections || []);
        toast.success("Survey saved successfully!");
      } else {
        console.warn("No survey data found");
        setSurveyData(null);
        setSections([]);
        toast.error("Failed to save survey data");
      }
    } catch (error) {
      console.error("Error saving survey data:", error);
      toast.error("Failed to save survey data. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-4 py-8 px-4">
      <CardHeaderSection
        title=" User and Role permission"
        breadcrumbs={[
          { label: "Dashboard", href: ROUTE.DASHBOARD },
          { label: "manage Q&As", href: "" },
        ]}
      >
        <div className="-mt-4">
          {surveyData?.description && (
            <p className="text-gray-600 mt-1">{surveyData.description}</p>
          )}
        </div>
      </CardHeaderSection>
      <div className="space-y-4">
        {/* Sections */}
        {sections.map((section, index) => {
          // Use tempId for new sections, id for existing ones
          const key = section.tempId || section.id || `s-${Math.random()}`;
          return (
            <SectionComponent
              key={key}
              section={section}
              sectionNumber={index + 1}
              totalSections={sections.length}
              onUpdate={handleUpdateSection}
              onRemove={() => handleRemoveSection(section)}
            />
          );
        })}

        {/* Add New Section Button */}
        <Card>
          <CardContent className="p-4">
            <Button
              variant="ghost"
              onClick={handleAddSection}
              className="text-[#024D3E] hover:text-teal-700 underline"
            >
              + Add New Section
            </Button>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Card>
          <CardContent>
            <div className="mt-6 flex justify-end">
              <Button
                type="submit"
                onClick={handleSave}
                className="bg-[#024D3E] hover:bg-teal-700"
                disabled={!surveyData || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    {isSubmitting && "Saving..."}
                  </>
                ) : (
                  "Save Survey"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SurveyManager;
