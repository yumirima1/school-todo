"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CalendarClock,
  Camera,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  Loader2,
  Moon,
  PackageCheck,
  RefreshCw,
  Sparkles,
  Sun,
  Sunset,
  Zap,
} from "lucide-react";
import { TimetableSlot } from "@/components/school-cards";
import {
  Card,
  EmptyState,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/ui";
import { boardMemoToTimetable } from "@/lib/board";
import {
  dayNames,
  daysBetween,
  getDayOfWeek,
  getSchoolTargetDate,
  getSchoolTargetLabel,
  toDateInputValue,
} from "@/lib/date";
import { matchMaterialsForPack } from "@/lib/materials";
import { buildTargetPacks } from "@/lib/prep";
import { useSchoolData } from "@/lib/school-data";
import { BoardNoteType, EventSource, News, RecurringTask } from "@/lib/types";

type ChikuzenEventsResponse = {
  checkedAt: string;
  sources: EventSource[];
  error?: string;
};

type CriticalItem = {
  id: string;
  label: string;
  title: string;
  detail: string;
  urgent: boolean;
};

const noteTypeLabels: Record<BoardNoteType, string> = {
  quiz: "小テスト",
  prep: "予習",
  homework: "宿題",
  item: "持ち物",
  notice: "連絡",
};

function formatTargetDateLabel(date: Date, dayLabel: string) {
  return `${date.getMonth() + 1}月${date.getDate()}日 ${dayLabel.replace(
    "曜",
    "曜日",
  )}`;
}

function sourceLink(source: EventSource) {
  return source.pdfUrl || source.url;
}

function NewsIcon({ news }: { news: News }) {
  if (news.category === "warning") {
    return <AlertTriangle size={15} aria-hidden="true" />;
  }
  if (news.category === "school") {
    return <CalendarClock size={15} aria-hidden="true" />;
  }
  return <Sparkles size={15} aria-hidden="true" />;
}

function getHomeTheme(hour: number) {
  if (hour >= 19) {
    return {
      shell:
        "from-slate-200 via-blue-100 to-indigo-200 text-slate-950",
      hero:
        "border-blue-200/80 bg-gradient-to-br from-slate-800 via-blue-800 to-indigo-700 text-white",
      orb: "bg-blue-300/40",
      icon: Moon,
      mode: "夜モード",
    };
  }
  if (hour >= 14) {
    return {
      shell:
        "from-orange-50 via-sky-50 to-rose-100 text-slate-950",
      hero:
        "border-orange-200/80 bg-gradient-to-br from-orange-100 via-sky-100 to-rose-100 text-slate-950",
      orb: "bg-orange-300/40",
      icon: Sunset,
      mode: "放課後モード",
    };
  }
  return {
    shell:
      "from-sky-50 via-white to-blue-100 text-slate-950",
    hero:
      "border-sky-200/80 bg-gradient-to-br from-white via-sky-50 to-blue-100 text-slate-950",
    orb: "bg-sky-300/40",
    icon: Sun,
    mode: "朝・昼モード",
  };
}

function recurringTasksForSubject(tasks: RecurringTask[], label: string) {
  return tasks
    .filter((task) => task.active)
    .map((task) => ({
      label,
      title: task.title,
      detail: task.description,
    }));
}

export default function TodayPage() {
  const { data, subjectById, upsertEventSource } = useSchoolData();
  const [fetchingSchoolEvents, setFetchingSchoolEvents] = useState(false);
  const [schoolFetchMessage, setSchoolFetchMessage] = useState("");
  const [discoveredSources, setDiscoveredSources] = useState<EventSource[]>([]);

  const now = new Date();
  const theme = getHomeTheme(now.getHours());
  const ThemeIcon = theme.icon;
  const targetDate = getSchoolTargetDate(now);
  const targetLabel = getSchoolTargetLabel(now);
  const targetDow = getDayOfWeek(targetDate);
  const targetDayLabel = targetDow ? dayNames[targetDow] : "日曜";
  const targetValue = toDateInputValue(targetDate);
  const className = `${data.settings.grade}${data.settings.className}`;
  const classLabel = `${data.settings.schoolName} ${className}`;
  const preparationMode = `${targetLabel}の準備`;

  const boardMemo =
    data.boardMemos.find(
      (memo) => memo.date === targetValue && memo.className === className,
    ) ?? data.boardMemos.find((memo) => memo.date === targetValue);

  const weekdayTimetable =
    targetDow === 0
      ? []
      : data.timetable
          .filter((item) => item.dayOfWeek === targetDow)
          .sort((a, b) => a.period - b.period);
  const targetTimetable = boardMemo
    ? boardMemoToTimetable(boardMemo, subjectById)
    : weekdayTimetable;

  const targetPacks = buildTargetPacks(targetTimetable, subjectById);
  const hasTargetItems = targetPacks.some((pack) => pack.items.length);
  const readiness =
    targetPacks.length > 0
      ? Math.round(
          (targetPacks.filter((pack) => pack.items.length > 0).length /
            targetPacks.length) *
            100,
        )
      : null;

  const targetAssignments = data.assignments
    .filter(
      (assignment) =>
        assignment.dueDate === targetValue &&
        !["done", "submitted"].includes(assignment.status),
    )
    .sort((a, b) => a.priority.localeCompare(b.priority));

  const latestNews = [...data.news]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  const countdownEvents = data.events
    .map((event) => ({ event, daysLeft: daysBetween(event.date) }))
    .filter(({ daysLeft }) => daysLeft > 0)
    .sort((a, b) => {
      const aUrgent = a.daysLeft <= 14 ? 0 : 1;
      const bUrgent = b.daysLeft <= 14 ? 0 : 1;
      return (
        aUrgent - bUrgent ||
        a.daysLeft - b.daysLeft ||
        (b.event.importance === "high" ? 1 : 0) -
          (a.event.importance === "high" ? 1 : 0)
      );
    })
    .slice(0, 5);

  const criticalItems: CriticalItem[] = [];
  targetAssignments.forEach((assignment) => {
    criticalItems.push({
      id: `assignment-${assignment.id}`,
      label: `${targetLabel}提出`,
      title: assignment.title,
      detail: subjectById.get(assignment.subjectId)?.shortName ?? "",
      urgent: true,
    });
  });

  boardMemo?.periods.forEach((period) => {
    period.notes
      .filter((note) => !note.done)
      .forEach((note, index) => {
        criticalItems.push({
          id: `board-${period.period}-${index}-${note.text}`,
          label: noteTypeLabels[note.type],
          title: note.text,
          detail: `${period.period}限 ${period.subjectName}`,
          urgent: note.type !== "notice",
        });
      });
  });

  const seenRecurring = new Set<string>();
  targetTimetable.forEach((lesson) => {
    const subject = subjectById.get(lesson.subjectId);
    if (!subject) {
      return;
    }
    [
      ...recurringTasksForSubject(subject.recurringAssignments, "固定提出物"),
      ...recurringTasksForSubject(subject.recurringQuizzes, "固定小テスト"),
      ...recurringTasksForSubject(subject.recurringPreparations, "固定予習"),
    ].forEach((task) => {
      const key = `${subject.id}-${task.label}-${task.title}`;
      if (seenRecurring.has(key)) {
        return;
      }
      seenRecurring.add(key);
      criticalItems.push({
        id: `recurring-${key}`,
        label: task.label,
        title: task.title,
        detail: task.detail || subject.shortName,
        urgent: task.label !== "固定予習",
      });
    });
  });

  countdownEvents
    .filter(({ daysLeft }) => daysLeft <= 14)
    .forEach(({ event, daysLeft }) => {
      criticalItems.push({
        id: `event-${event.id}`,
        label: "近い行事",
        title: `${event.title}まで${daysLeft}日`,
        detail: event.date,
        urgent: true,
      });
    });

  const visibleCriticalItems = criticalItems.slice(0, 8);
  const schoolSourceCandidates = discoveredSources.length
    ? discoveredSources
    : data.eventSources;
  const schoolSources = [...schoolSourceCandidates]
    .sort((a, b) =>
      (b.lastCheckedAt || b.fetchedAt).localeCompare(
        a.lastCheckedAt || a.fetchedAt,
      ),
    )
    .slice(0, 3);

  async function refreshChikuzenEvents() {
    setFetchingSchoolEvents(true);
    setSchoolFetchMessage("");

    try {
      const response = await fetch("/api/chikuzen-events");
      const payload = (await response.json()) as ChikuzenEventsResponse;

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "筑前高校からの取得に失敗しました。");
      }

      payload.sources.forEach((source) => upsertEventSource(source));
      setDiscoveredSources(payload.sources);
      setSchoolFetchMessage(
        payload.sources.length
          ? `${payload.sources.length}件の行事予定PDFを検出しました。`
          : "新しい行事予定PDFは検出されませんでした。",
      );
    } catch (error) {
      setSchoolFetchMessage(
        error instanceof Error
          ? error.message
          : "筑前高校からの取得に失敗しました。",
      );
    } finally {
      setFetchingSchoolEvents(false);
    }
  }

  return (
    <div className={`-mx-4 -mt-5 min-h-screen bg-gradient-to-br ${theme.shell} px-4 pb-10 pt-4 md:-mx-6 md:px-6`}>
      <section
        className={`relative overflow-hidden rounded-[2rem] border p-6 shadow-xl shadow-slate-300/30 ${theme.hero}`}
      >
        <div
          className={`absolute -right-12 -top-12 size-40 rounded-full blur-3xl ${theme.orb}`}
        />
        <div className="relative">
          <div className="mb-8 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-white/70 backdrop-blur">
              <ThemeIcon size={14} aria-hidden="true" />
              {theme.mode}
            </span>
            {readiness !== null && (
              <span className="rounded-full bg-white/60 px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-white/70 backdrop-blur">
                準備率 {readiness}%
              </span>
            )}
          </div>
          <p className="text-lg font-semibold opacity-80">{classLabel}</p>
          <h1 className="mt-2 text-5xl font-semibold tracking-normal max-[360px]:text-4xl md:text-6xl">
            {formatTargetDateLabel(targetDate, targetDayLabel)}
          </h1>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-950/80 px-4 py-2 text-base font-semibold text-white shadow-lg shadow-slate-900/15">
            <Sparkles size={18} aria-hidden="true" />
            {preparationMode}
          </div>
        </div>
      </section>

      <section className="mt-5">
        <Card
          className="border-rose-200/80 bg-rose-50/90 shadow-rose-100/80"
          title="やばいもの"
          action={
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-rose-600">
              <Zap size={13} aria-hidden="true" />
              最優先
            </span>
          }
        >
          {visibleCriticalItems.length ? (
            <ul className="grid gap-2">
              {visibleCriticalItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start gap-3 rounded-2xl border border-white/80 bg-white/80 p-3 shadow-sm"
                >
                  <span
                    className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full ${
                      item.urgent
                        ? "bg-rose-100 text-rose-600"
                        : "bg-sky-100 text-sky-600"
                    }`}
                  >
                    {item.urgent ? (
                      <AlertTriangle size={16} aria-hidden="true" />
                    ) : (
                      <CheckCircle2 size={16} aria-hidden="true" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-rose-500">
                      {item.label}
                    </p>
                    <p className="break-words text-base font-semibold text-slate-950">
                      {item.title}
                    </p>
                    {item.detail && (
                      <p className="mt-0.5 break-words text-xs font-medium text-slate-500">
                        {item.detail}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl bg-white/75 p-4 text-slate-700">
              <CheckCircle2 className="text-emerald-500" size={22} />
              <span className="text-base font-semibold">今のところ大丈夫</span>
            </div>
          )}
        </Card>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3 max-[420px]:grid-cols-1">
        <Card
          title={`${targetLabel}の時間割`}
          action={
            <Link
              className={secondaryButtonClass}
              href={boardMemo ? "/board" : "/timetable"}
            >
              {boardMemo ? "黒板" : "編集"}
            </Link>
          }
        >
          {boardMemo && (
            <p className="mb-3 rounded-2xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700">
              黒板メモ優先
            </p>
          )}
          {targetTimetable.length ? (
            <div className="grid gap-2">
              {targetTimetable.map((item) => (
                <TimetableSlot
                  key={item.id}
                  item={item}
                  subject={subjectById.get(item.subjectId)}
                />
              ))}
            </div>
          ) : (
            <EmptyState text={`${targetLabel}の時間割は未登録です。`} />
          )}
        </Card>

        <Card
          title={`${targetLabel}の持ち物`}
          action={
            <Link className={secondaryButtonClass} href="/materials">
              教材
              <PackageCheck size={15} aria-hidden="true" />
            </Link>
          }
        >
          {hasTargetItems ? (
            <div className="grid gap-2">
              {targetPacks.map((pack) => {
                const materialMatches = matchMaterialsForPack(
                  pack,
                  data.materials,
                ).filter((match) => match.material);
                return (
                  <article
                    key={pack.key}
                    className="rounded-2xl border border-slate-200/80 bg-white/75 p-3 shadow-sm"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-bold text-sky-700">
                        {pack.period}限
                      </span>
                      <span className="break-words text-right text-sm font-bold text-slate-900">
                        {pack.subjectName}
                      </span>
                    </div>
                    {materialMatches.length ? (
                      <div className="mb-2 grid grid-cols-2 gap-2">
                        {materialMatches.map((match) => (
                          <div
                            key={match.material?.id}
                            className="rounded-2xl border border-sky-100 bg-sky-50/80 p-2"
                          >
                            <div className="aspect-[4/3] overflow-hidden rounded-xl bg-white">
                              {match.material?.imageDataUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  className="size-full object-contain"
                                  src={match.material.imageDataUrl}
                                  alt={match.material.title}
                                />
                              ) : null}
                            </div>
                            <p className="mt-1 break-words text-[11px] font-bold text-slate-800">
                              {match.material?.shortTitle || match.item}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {pack.items.length ? (
                      <ul className="flex flex-wrap gap-2">
                        {pack.items.map((item) => (
                          <li
                            key={`${pack.key}-${item}`}
                            className="rounded-full border border-sky-100 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-800"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400">固定持ち物なし</p>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyState text={`${targetLabel}の持ち物は未登録です。`} />
          )}
        </Card>
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <Card
          title={`${targetLabel}提出のもの`}
          action={
            <Link className={secondaryButtonClass} href="/assignments">
              提出物
            </Link>
          }
        >
          {targetAssignments.length ? (
            <ul className="grid gap-2">
              {targetAssignments.map((assignment) => (
                <li
                  key={assignment.id}
                  className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-700"
                >
                  <AlertTriangle
                    className="mt-0.5 shrink-0"
                    size={16}
                    aria-hidden="true"
                  />
                  <span className="break-words">{assignment.title}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState text={`${targetLabel}は提出物なし`} />
          )}
        </Card>

        <Card
          title="行事カウントダウン"
          action={
            <Link className={secondaryButtonClass} href="/events">
              行事
              <CalendarClock size={15} aria-hidden="true" />
            </Link>
          }
        >
          {countdownEvents.length ? (
            <ul className="grid gap-2">
              {countdownEvents.map(({ event, daysLeft }) => (
                <li
                  key={event.id}
                  className={`flex items-center justify-between gap-3 rounded-2xl border p-3 ${
                    daysLeft <= 14
                      ? "border-amber-200 bg-amber-50"
                      : "border-slate-200 bg-white/70"
                  }`}
                >
                  <div className="flex min-w-0 items-start gap-2">
                    {daysLeft <= 14 && (
                      <AlertTriangle
                        className="mt-0.5 shrink-0 text-amber-600"
                        size={16}
                        aria-hidden="true"
                      />
                    )}
                    <span
                      className={`break-words font-semibold ${
                        daysLeft <= 14
                          ? "text-base text-amber-800"
                          : "text-sm text-slate-700"
                      }`}
                    >
                      {event.title}まで{daysLeft}日
                    </span>
                  </div>
                  <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-500">
                    {event.date}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState text="未来の行事はまだ登録されていません。" />
          )}
        </Card>
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <Card title="ショートカット">
          <div className="grid grid-cols-2 gap-2">
            <Link className={secondaryButtonClass} href="/board">
              <Camera size={16} aria-hidden="true" />
              黒板OCR
            </Link>
            <Link className={secondaryButtonClass} href="/materials">
              <BookOpen size={16} aria-hidden="true" />
              教材
            </Link>
            <Link className={secondaryButtonClass} href="/timetable">
              <CalendarClock size={16} aria-hidden="true" />
              時間割
            </Link>
            <Link className={secondaryButtonClass} href="/assignments">
              <ClipboardList size={16} aria-hidden="true" />
              提出物
            </Link>
          </div>
        </Card>

        <Card
          title="学校からのお知らせ"
          action={
            <button
              className={primaryButtonClass}
              type="button"
              onClick={refreshChikuzenEvents}
              disabled={fetchingSchoolEvents}
            >
              {fetchingSchoolEvents ? (
                <Loader2 className="animate-spin" size={16} aria-hidden="true" />
              ) : (
                <RefreshCw size={16} aria-hidden="true" />
              )}
              筑前高校から更新取得
            </button>
          }
        >
          {schoolFetchMessage && (
            <p className="mb-3 rounded-2xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700">
              {schoolFetchMessage}
            </p>
          )}
          {schoolSources.length ? (
            <div className="grid gap-2">
              {schoolSources.map((source) => (
                <article
                  key={source.id}
                  className="rounded-2xl border border-slate-200 bg-white/75 p-3"
                >
                  <p className="text-sm font-bold text-slate-900">
                    {source.title}を検出
                  </p>
                  <Link
                    className="mt-2 inline-flex max-w-full items-center gap-1 break-all text-xs font-semibold text-sky-700 underline-offset-4 hover:underline"
                    href={sourceLink(source)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    PDFを開く
                    <ExternalLink size={13} aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState text="ボタンを押すと筑前高校のお知らせから行事予定PDFを探します。" />
          )}
        </Card>
      </section>

      <section className="mt-5">
        <Card
          className="bg-white/60 shadow-none"
          title="School Dock News"
          action={
            <Link className={secondaryButtonClass} href="/news">
              もっと見る
            </Link>
          }
        >
          {latestNews.length ? (
            <ul className="grid gap-2">
              {latestNews.map((newsItem) => (
                <li
                  key={newsItem.id}
                  className="flex items-start gap-2 rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 text-sm text-slate-600"
                >
                  <span className="mt-0.5 shrink-0 text-sky-600">
                    <NewsIcon news={newsItem} />
                  </span>
                  <span className="break-words">{newsItem.title}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState text="Newsはまだありません。" />
          )}
        </Card>
      </section>
    </div>
  );
}
