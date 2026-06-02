"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Assignment,
  SchoolData,
  SchoolEvent,
  Subject,
  TimetableItem,
} from "@/lib/types";

const storageKey = "school-dock:data:v1";

const defaultSubjects: Subject[] = [
  { id: "japanese", name: "国語", color: "#ef4444" },
  { id: "math", name: "数学", color: "#38bdf8" },
  { id: "english", name: "英語", color: "#22c55e" },
  { id: "science", name: "理科", color: "#a78bfa" },
  { id: "social", name: "社会", color: "#f59e0b" },
  { id: "pe", name: "体育", color: "#fb7185" },
];

export const defaultSchoolData: SchoolData = {
  subjects: defaultSubjects,
  timetable: [],
  assignments: [],
  studyTasks: [],
  events: [],
  settings: {
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
  return {
    subjects: data.subjects?.length ? data.subjects : defaultSchoolData.subjects,
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
    upsertTimetableItem,
    removeTimetableItem,
    addAssignment,
    updateAssignment,
    removeAssignment,
    addEvent,
    removeEvent,
  };
}
