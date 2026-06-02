import { Subject, TimetableItem } from "@/lib/types";

export type PrepPack = {
  key: string;
  period: number;
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  items: string[];
};

export function splitItems(value: string) {
  return value
    .split(/[\n,、]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function buildTargetPacks(
  timetable: TimetableItem[],
  subjectById: Map<string, Subject>,
): PrepPack[] {
  return timetable.map((lesson) => {
    const subject = subjectById.get(lesson.subjectId);
    const items = Array.from(
      new Set([
        ...splitItems(subject?.items ?? subject?.fixedItems ?? ""),
        ...splitItems(lesson.items),
      ]),
    );

    return {
      key: lesson.id,
      period: lesson.period,
      subjectId: lesson.subjectId,
      subjectName: subject?.name ?? "未設定",
      subjectColor: subject?.color ?? "#64748b",
      items,
    };
  });
}

export function buildTomorrowPacks(
  timetable: TimetableItem[],
  subjectById: Map<string, Subject>,
): PrepPack[] {
  return buildTargetPacks(timetable, subjectById);
}
