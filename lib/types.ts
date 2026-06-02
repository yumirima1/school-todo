export type Subject = {
  id: string;
  name: string;
  color: string;
  fixedItems: string;
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
  events: SchoolEvent[];
  boardMemos: BoardMemo[];
  settings: SchoolSettings;
};
