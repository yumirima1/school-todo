export type Subject = {
  id: string;
  name: string;
  shortName: string;
  color: string;
  items: string;
  fixedItems?: string;
  recurringAssignments: RecurringTask[];
  recurringQuizzes: RecurringTask[];
  recurringPreparations: RecurringTask[];
};

export type RecurringTaskCategory = "assignment" | "quiz" | "preparation";

export type RecurringTask = {
  id: string;
  title: string;
  description: string;
  category: RecurringTaskCategory;
  active: boolean;
};

export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6;

export type TimetableItem = {
  id: string;
  dayOfWeek: DayOfWeek;
  period: number;
  subjectId: string;
  room: string;
  teacher: string;
  items: string;
};

export type AssignmentStatus = "todo" | "doing" | "done" | "submitted";
export type Priority = "low" | "middle" | "high";

export type Assignment = {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  dueDate: string;
  status: AssignmentStatus;
  priority: Priority;
  memo: string;
};

export type StudyTaskType = "prep" | "review" | "quiz";

export type StudyTask = {
  id: string;
  subjectId: string;
  title: string;
  range: string;
  dueDate: string;
  type: StudyTaskType;
  done: boolean;
  memo: string;
};

export type StudyMaterialCategory =
  | "textbook"
  | "workbook"
  | "vocabulary"
  | "notebook"
  | "print"
  | "other";

export type StudyMaterial = {
  id: string;
  subjectId: string;
  title: string;
  shortTitle: string;
  category: StudyMaterialCategory;
  imageDataUrl: string;
  active: boolean;
};

export type SchoolEventType =
  | "test"
  | "school_event"
  | "club"
  | "exam"
  | "other";

export type SchoolEvent = {
  id: string;
  title: string;
  date: string;
  type: SchoolEventType;
  importance: Priority;
  memo: string;
};

export type EventSourceType = "monthly" | "yearly" | "manual";
export type EventSourceStatus = "pending" | "imported" | "failed";

export type EventSource = {
  id: string;
  title: string;
  url: string;
  articleUrl: string;
  pdfUrl: string;
  sourceType: EventSourceType;
  fetchedAt: string;
  discoveredAt: string;
  lastCheckedAt: string;
  status: EventSourceStatus;
  memo: string;
};

export type BoardNoteType = "quiz" | "prep" | "homework" | "item" | "notice";

export type BoardNote = {
  type: BoardNoteType;
  text: string;
  done: boolean;
};

export type BoardPeriod = {
  period: number;
  subjectId: string;
  subjectName: string;
  notes: BoardNote[];
};

export type BoardMemo = {
  id: string;
  date: string;
  className: string;
  periods: BoardPeriod[];
};

export type BoardOcrNote = {
  type: BoardNoteType;
  text: string;
};

export type BoardOcrPeriod = {
  period: number;
  subject: string;
  notes: BoardOcrNote[];
};

export type BoardOcrResult = {
  periods: BoardOcrPeriod[];
};

export type SchoolSettings = {
  schoolName: string;
  grade: string;
  className: string;
  periodCount: number;
  hasSaturday: boolean;
  themeColor: string;
  darkMode: boolean;
};

export type SchoolData = {
  subjects: Subject[];
  timetable: TimetableItem[];
  assignments: Assignment[];
  studyTasks: StudyTask[];
  materials: StudyMaterial[];
  events: SchoolEvent[];
  eventSources: EventSource[];
  boardMemos: BoardMemo[];
  settings: SchoolSettings;
};
