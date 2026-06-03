export interface SurveyMainModel {
  id?: number;
  title?: string;
  description?: string;
  status?: string;
  createdBy?: any;
  sections?: Section[];
  createdAt?: string;
}

export interface Section {
  id?: number;
  title?: string;
  description?: string;
  displayOrder?: number;
  questions?: Question[];

  // Internal tracking properties
  isNew?: boolean;
  tempId?: string;
}

export interface Question {
  id?: number;
  questionText?: string;
  questionType?: string;
  required?: boolean;
  displayOrder?: number;
  minRating?: number;
  maxRating?: number;
  leftLabel?: string;
  rightLabel?: string;
  ratingOptions?: RatingOption[];

  // Internal tracking properties
  isNew?: boolean;
  tempId?: string;
}

interface RatingOption {
  value?: number;
  label?: string;
}

export interface FormResponses {
  [questionId: string]: string | string[];
}

export interface SurveyFormDataModel {
  answers: Answer[];
  overallComment?: string;
  overallRating?: number;
}

export interface Answer {
  questionId: number;
  textAnswer: string;
  ratingAnswer: number;
}
export interface FormAnswers {
  [questionId: string]: string | number | string[]; // Allow various input types
}
