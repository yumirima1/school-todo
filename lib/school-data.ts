"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Assignment,
  BoardMemo,
  EventSource,
  RecurringTask,
  RecurringTaskCategory,
  SchoolData,
  SchoolEvent,
  SchoolSettings,
  Subject,
  TimetableItem,
} from "@/lib/types";

const storageKey = "school-dock:data:v1";

function recurring(
  category: RecurringTaskCategory,
  title: string,
  description = "",
): RecurringTask {
  return {
    id: `default-${category}-${title}`,
    title,
    description,
    category,
    active: true,
  };
}

const defaultSubjects: Subject[] = [
  {
    id: "japanese",
    name: "現代の国語",
    shortName: "現国",
    color: "#ef4444",
    items: "教科書、ノート、漢字ノート",
    recurringAssignments: [],
    recurringQuizzes: [
      recurring("quiz", "漢字テスト"),
      recurring("quiz", "現代文単語テスト"),
    ],
    recurringPreparations: [],
  },
  {
    id: "math",
    name: "数学",
    shortName: "数学",
    color: "#38bdf8",
    items: "教科書、ノート、ワーク、定規",
    recurringAssignments: [],
    recurringQuizzes: [],
    recurringPreparations: [],
  },
  {
    id: "english",
    name: "英語",
    shortName: "英語",
    color: "#22c55e",
    items: "教科書、ノート、単語帳",
    recurringAssignments: [],
    recurringQuizzes: [],
    recurringPreparations: [],
  },
  {
    id: "science",
    name: "理科",
    shortName: "理科",
    color: "#a78bfa",
    items: "教科書、ノート、資料集",
    recurringAssignments: [],
    recurringQuizzes: [],
    recurringPreparations: [],
  },
  {
    id: "social",
    name: "社会",
    shortName: "社会",
    color: "#f59e0b",
    items: "教科書、ノート、資料集",
    recurringAssignments: [],
    recurringQuizzes: [],
    recurringPreparations: [],
  },
  {
    id: "pe",
    name: "体育",
    shortName: "体育",
    color: "#fb7185",
    items: "体操服、タオル",
    recurringAssignments: [],
    recurringQuizzes: [],
    recurringPreparations: [],
  },
  {
    id: "communication-1",
    name: "英語コミュニケーションⅠ",
    shortName: "英コミ",
    color: "#14b8a6",
    items: "教科書、ノート、単語帳",
    recurringAssignments: [recurring("assignment", "Seek Next 週末課題")],
    recurringQuizzes: [recurring("quiz", "英単語テスト")],
    recurringPreparations: [recurring("preparation", "VQ予習")],
  },
  {
    id: "public",
    name: "公共",
    shortName: "公共",
    color: "#f97316",
    items: "教科書、ノート",
    recurringAssignments: [],
    recurringQuizzes: [],
    recurringPreparations: [],
  },
  {
    id: "logic-expression-1",
    name: "論理・表現Ⅰ",
    shortName: "論表",
    color: "#84cc16",
    items: "教科書、ノート、ワーク",
    recurringAssignments: [],
    recurringQuizzes: [],
    recurringPreparations: [],
  },
  {
    id: "math-1",
    name: "数学Ⅰ",
    shortName: "数Ⅰ",
    color: "#0ea5e9",
    items: "教科書、ノート、問題集",
    recurringAssignments: [recurring("assignment", "数学週末課題")],
    recurringQuizzes: [],
    recurringPreparations: [],
  },
  {
    id: "language-culture",
    name: "言語文化",
    shortName: "言文",
    color: "#f43f5e",
    items: "教科書、ノート、古典単語帳",
    recurringAssignments: [],
    recurringQuizzes: [
      recurring(
        "quiz",
        "古文単語テスト",
        "合格ライン70%。古文単語351対応。",
      ),
    ],
    recurringPreparations: [],
  },
  {
    id: "basic-physics",
    name: "物理基礎",
    shortName: "物基",
    color: "#8b5cf6",
    items: "教科書、ノート、問題集",
    recurringAssignments: [],
    recurringQuizzes: [],
    recurringPreparations: [],
  },
  {
    id: "school-common",
    name: "学校共通",
    shortName: "共通",
    color: "#eab308",
    items: "",
    recurringAssignments: [recurring("assignment", "学校提出書類")],
    recurringQuizzes: [],
    recurringPreparations: [],
  },
];

const sampleBoardMemo: BoardMemo = {
  id: "board-2026-06-03-sample",
  date: "2026-06-03",
  className: "1年4組",
  periods: [
    {
      period: 1,
      subjectId: "communication-1",
      subjectName: "コミュⅠ",
      notes: [
        { type: "quiz", text: "小テスト", done: false },
        { type: "prep", text: "予習", done: false },
      ],
    },
    {
      period: 2,
      subjectId: "public",
      subjectName: "公共",
      notes: [],
    },
    {
      period: 3,
      subjectId: "logic-expression-1",
      subjectName: "論理・表現Ⅰ",
      notes: [{ type: "prep", text: "予習あり", done: false }],
    },
    {
      period: 4,
      subjectId: "math-1",
      subjectName: "数学Ⅰ",
      notes: [{ type: "quiz", text: "小テスト 5/6で合格", done: false }],
    },
    {
      period: 5,
      subjectId: "pe",
      subjectName: "体育",
      notes: [],
    },
    {
      period: 6,
      subjectId: "language-culture",
      subjectName: "言語文化",
      notes: [{ type: "quiz", text: "小テスト", done: false }],
    },
    {
      period: 7,
      subjectId: "basic-physics",
      subjectName: "物理基礎",
      notes: [
        { type: "quiz", text: "小テスト", done: false },
        { type: "homework", text: "宿題", done: false },
      ],
    },
  ],
};

export const defaultSchoolData: SchoolData = {
  subjects: defaultSubjects,
  timetable: [],
  assignments: [],
  studyTasks: [],
  events: [],
  eventSources: [],
  boardMemos: [sampleBoardMemo],
  settings: {
    schoolName: "筑前高校",
    grade: "1年",
    className: "4組",
    periodCount: 6,
    hasSaturday: false,
    themeColor: "#38bdf8",
    darkMode: true,
  },
};

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function normalizeData(data: Partial<SchoolData>): SchoolData {
  const defaultSubjectById = new Map(
    defaultSchoolData.subjects.map((subject) => [subject.id, subject]),
  );
  const storedSubjectById = new Map(
    (data.subjects ?? []).map((subject) => [subject.id, subject]),
  );
  const subjects = defaultSchoolData.subjects.map((defaultSubject) => {
    const storedSubject = storedSubjectById.get(defaultSubject.id);
    if (!storedSubject) {
      return defaultSubject;
    }
    return {
      ...defaultSubject,
      ...storedSubject,
      shortName: storedSubject.shortName ?? defaultSubject.shortName,
      items:
        storedSubject.items ??
        storedSubject.fixedItems ??
        defaultSubject.items ??
        defaultSubject.fixedItems ??
        "",
      recurringAssignments:
        storedSubject.recurringAssignments ??
        defaultSubject.recurringAssignments ??
        [],
      recurringQuizzes:
        storedSubject.recurringQuizzes ?? defaultSubject.recurringQuizzes ?? [],
      recurringPreparations:
        storedSubject.recurringPreparations ??
        defaultSubject.recurringPreparations ??
        [],
    };
  });
  for (const storedSubject of data.subjects ?? []) {
    if (!defaultSubjectById.has(storedSubject.id)) {
      subjects.push({
        ...storedSubject,
        shortName: storedSubject.shortName ?? storedSubject.name,
        items: storedSubject.items ?? storedSubject.fixedItems ?? "",
        recurringAssignments: storedSubject.recurringAssignments ?? [],
        recurringQuizzes: storedSubject.recurringQuizzes ?? [],
        recurringPreparations: storedSubject.recurringPreparations ?? [],
      });
    }
  }

  return {
    subjects,
    timetable: data.timetable ?? [],
    assignments: data.assignments ?? [],
    studyTasks: data.studyTasks ?? [],
    events: data.events ?? [],
    eventSources: data.eventSources ?? [],
    boardMemos: data.boardMemos ?? defaultSchoolData.boardMemos,
    settings: { ...defaultSchoolData.settings, ...data.settings },
  };
}

export function useSchoolData() {
  const [data, setData] = useState<SchoolData>(() => {
    if (typeof window === "undefined") {
      return defaultSchoolData;
    }
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return defaultSchoolData;
    }
    try {
      return normalizeData(JSON.parse(raw) as Partial<SchoolData>);
    } catch {
      return defaultSchoolData;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(storageKey, JSON.stringify(data));
  }, [data]);

  const subjectById = useMemo(() => {
    return new Map(data.subjects.map((subject) => [subject.id, subject]));
  }, [data.subjects]);

  const upsertTimetableItem = useCallback(
    (input: Omit<TimetableItem, "id">) => {
      setData((current) => {
        const nextItem = {
          ...input,
          id:
            current.timetable.find(
              (item) =>
                item.dayOfWeek === input.dayOfWeek && item.period === input.period,
            )?.id ?? createId("timetable"),
        };
        return {
          ...current,
          timetable: [
            ...current.timetable.filter(
              (item) =>
                item.dayOfWeek !== input.dayOfWeek || item.period !== input.period,
            ),
            nextItem,
          ].sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.period - b.period),
        };
      });
    },
    [],
  );

  const removeTimetableItem = useCallback((id: string) => {
    setData((current) => ({
      ...current,
      timetable: current.timetable.filter((item) => item.id !== id),
    }));
  }, []);

  const updateSubject = useCallback(
    (id: string, patch: Partial<Omit<Subject, "id">>) => {
      setData((current) => ({
        ...current,
        subjects: current.subjects.map((subject) =>
          subject.id === id ? { ...subject, ...patch } : subject,
        ),
      }));
    },
    [],
  );

  const updateSettings = useCallback((patch: Partial<SchoolSettings>) => {
    setData((current) => ({
      ...current,
      settings: { ...current.settings, ...patch },
    }));
  }, []);

  const addAssignment = useCallback((input: Omit<Assignment, "id">) => {
    setData((current) => ({
      ...current,
      assignments: [
        ...current.assignments,
        { ...input, id: createId("assignment") },
      ],
    }));
  }, []);

  const updateAssignment = useCallback(
    (id: string, patch: Partial<Omit<Assignment, "id">>) => {
      setData((current) => ({
        ...current,
        assignments: current.assignments.map((assignment) =>
          assignment.id === id ? { ...assignment, ...patch } : assignment,
        ),
      }));
    },
    [],
  );

  const removeAssignment = useCallback((id: string) => {
    setData((current) => ({
      ...current,
      assignments: current.assignments.filter((assignment) => assignment.id !== id),
    }));
  }, []);

  const addEvent = useCallback((input: Omit<SchoolEvent, "id">) => {
    setData((current) => ({
      ...current,
      events: [...current.events, { ...input, id: createId("event") }],
    }));
  }, []);

  const removeEvent = useCallback((id: string) => {
    setData((current) => ({
      ...current,
      events: current.events.filter((event) => event.id !== id),
    }));
  }, []);

  const upsertEventSource = useCallback((input: EventSource) => {
    setData((current) => {
      const id = input.id || createId("event-source");
      const nextSource = { ...input, id };
      return {
        ...current,
        eventSources: [
          ...current.eventSources.filter((source) => source.id !== id),
          nextSource,
        ].sort((a, b) => b.fetchedAt.localeCompare(a.fetchedAt)),
      };
    });
  }, []);

  const removeEventSource = useCallback((id: string) => {
    setData((current) => ({
      ...current,
      eventSources: current.eventSources.filter((source) => source.id !== id),
    }));
  }, []);

  const upsertBoardMemo = useCallback((input: BoardMemo) => {
    setData((current) => {
      const id = input.id || createId("board");
      const nextMemo = { ...input, id };
      return {
        ...current,
        boardMemos: [
          ...current.boardMemos.filter((memo) => memo.id !== id),
          nextMemo,
        ].sort((a, b) => b.date.localeCompare(a.date)),
      };
    });
  }, []);

  const removeBoardMemo = useCallback((id: string) => {
    setData((current) => ({
      ...current,
      boardMemos: current.boardMemos.filter((memo) => memo.id !== id),
    }));
  }, []);

  return {
    data,
    ready: true,
    subjectById,
    updateSubject,
    updateSettings,
    upsertTimetableItem,
    removeTimetableItem,
    addAssignment,
    updateAssignment,
    removeAssignment,
    addEvent,
    removeEvent,
    upsertEventSource,
    removeEventSource,
    upsertBoardMemo,
    removeBoardMemo,
  };
}
