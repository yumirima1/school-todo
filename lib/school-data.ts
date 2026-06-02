"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Assignment,
  SchoolData,
  SchoolEvent,
  SchoolSettings,
  Subject,
  TimetableItem,
} from "@/lib/types";

const storageKey = "school-dock:data:v1";

const defaultSubjects: Subject[] = [
  {
    id: "japanese",
    name: "国語",
    color: "#ef4444",
    fixedItems: "教科書、ノート、漢字ノート",
  },
  {
    id: "math",
    name: "数学",
    color: "#38bdf8",
    fixedItems: "教科書、ノート、ワーク、定規",
  },
  {
    id: "english",
    name: "英語",
    color: "#22c55e",
    fixedItems: "教科書、ノート、単語帳",
  },
  {
    id: "science",
    name: "理科",
    color: "#a78bfa",
    fixedItems: "教科書、ノート、資料集",
  },
  {
    id: "social",
    name: "社会",
    color: "#f59e0b",
    fixedItems: "教科書、ノート、資料集",
  },
  {
    id: "pe",
    name: "体育",
    color: "#fb7185",
    fixedItems: "体操服、タオル",
  },
];

export const defaultSchoolData: SchoolData = {
  subjects: defaultSubjects,
  timetable: [],
  assignments: [],
  studyTasks: [],
  events: [],
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
  const subjects = data.subjects?.length
    ? data.subjects.map((subject) => ({
        ...defaultSubjectById.get(subject.id),
        ...subject,
        fixedItems:
          subject.fixedItems ?? defaultSubjectById.get(subject.id)?.fixedItems ?? "",
      }))
    : defaultSchoolData.subjects;

  return {
    subjects,
    timetable: data.timetable ?? [],
    assignments: data.assignments ?? [],
    studyTasks: data.studyTasks ?? [],
    events: data.events ?? [],
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
  };
}
