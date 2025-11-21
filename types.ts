export type QuestionType = "single" | "multiple" | "dropdown" | "drag_drop";

export interface Option {
  label: string;
  text: string;
}

export interface DropdownItem {
  label: string;
  options: string[];
}

export interface DropZone {
  label?: string; // Text description or context for the slot
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  imageUrl?: string; // Base64 string of the attached image
  options: Option[]; // Used for single/multiple/drag_drop (as source items)
  dropdowns?: DropdownItem[]; // Used for dropdown type
  dropZones?: DropZone[]; // Used for drag_drop type
  correctAnswers: string[]; // Array of labels (A, B) or exact strings. For drag_drop, ordered list of Option labels matching dropZones.
  explanation?: string;
}

export interface QuestionBank {
  id: string;
  name: string;
  questions: Question[];
}

export interface UserAnswer {
  [questionId: string]: string[]; // e.g., { "uuid-123": ["B"] } or ["Option 1", "Option 2"] for dropdowns/drag_drop
}

export interface ExamResult {
  id: string;
  bankId: string;
  bankName: string;
  date: string;
  score: number; // Percentage
  timeTaken: number; // in seconds
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  userAnswers: UserAnswer;
  revealedAnswers: string[]; // Array of question IDs
  flaggedQuestions: string[];
}

export type AppView = "banks" | "take_exam" | "history" | "import_export";

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}