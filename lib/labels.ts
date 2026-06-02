import {
  AssignmentStatus,
  BoardNoteType,
  EventSourceStatus,
  EventSourceType,
  Priority,
  RecurringTaskCategory,
  SchoolEventType,
  StudyTaskType,
} from "@/lib/types";

export const assignmentStatusLabels: Record<AssignmentStatus, string> = {
  todo: "未着手",
  doing: "進行中",
  done: "完了",
  submitted: "提出済み",
};

export const priorityLabels: Record<Priority, string> = {
  low: "低",
  middle: "中",
  high: "高",
};

export const eventTypeLabels: Record<SchoolEventType, string> = {
  test: "定期テスト",
  school_event: "学校行事",
  club: "部活大会",
  exam: "検定・模試",
  other: "その他",
};

export const studyTaskTypeLabels: Record<StudyTaskType, string> = {
  prep: "予習",
  review: "復習",
  quiz: "小テスト",
};

export const boardNoteTypeLabels: Record<BoardNoteType, string> = {
  quiz: "小テスト",
  prep: "予習",
  homework: "宿題",
  item: "持ち物",
  notice: "連絡",
};

export const eventSourceTypeLabels: Record<EventSourceType, string> = {
  monthly: "月間行事予定",
  yearly: "年間行事予定",
  manual: "手動メモ",
};

export const eventSourceStatusLabels: Record<EventSourceStatus, string> = {
  pending: "解析待ち",
  imported: "取込済み",
  failed: "失敗",
};

export const recurringTaskCategoryLabels: Record<RecurringTaskCategory, string> = {
  assignment: "固定提出物",
  quiz: "固定小テスト",
  preparation: "固定予習",
};
