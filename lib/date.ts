import { DayOfWeek, SchoolSettings } from "@/lib/types";

export const SCHOOL_DAY_SWITCH_HOUR = 14;

export const dayNames: Record<DayOfWeek, string> = {
  1: "月曜",
  2: "火曜",
  3: "水曜",
  4: "木曜",
  5: "金曜",
  6: "土曜",
};

export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function daysBetween(targetDate: string, baseDate = new Date()): number {
  const target = startOfLocalDay(parseLocalDate(targetDate)).getTime();
  const base = startOfLocalDay(baseDate).getTime();
  return Math.round((target - base) / 86_400_000);
}

export function formatJapaneseDate(date: Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(date);
}

export function getDayOfWeek(date = new Date()): DayOfWeek | 0 {
  const day = date.getDay();
  if (day >= 1 && day <= 6) {
    return day as DayOfWeek;
  }
  return 0;
}

export function getSchoolTargetDate(now = new Date()) {
  const targetDate = new Date(now);
  if (now.getHours() >= SCHOOL_DAY_SWITCH_HOUR) {
    targetDate.setDate(targetDate.getDate() + 1);
  }
  return targetDate;
}

export function getSchoolTargetLabel(now = new Date()) {
  return now.getHours() >= SCHOOL_DAY_SWITCH_HOUR ? "明日" : "今日";
}

export function getNextSchoolDate(settings: SchoolSettings, date = new Date()) {
  const next = new Date(date);
  for (let i = 1; i <= 7; i += 1) {
    next.setDate(date.getDate() + i);
    const day = next.getDay();
    if (day >= 1 && day <= 5) {
      return next;
    }
    if (settings.hasSaturday && day === 6) {
      return next;
    }
  }
  return next;
}
