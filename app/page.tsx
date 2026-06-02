"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CalendarClock,
  Camera,
  ClipboardList,
  ExternalLink,
  Loader2,
  PackageCheck,
  RefreshCw,
  School,
  Wrench,
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
import { EventSource, News } from "@/lib/types";

type ChikuzenEventsResponse = {
  checkedAt: string;
  sources: EventSource[];
  error?: string;
};

function formatTargetDateLabel(date: Date, dayLabel: string) {
  return `${date.getMonth() + 1}月${date.getDate()}日（${dayLabel}）`;
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
  return <Wrench size={15} aria-hidden="true" />;
}

export default function TodayPage() {
  const { data, subjectById, upsertEventSource } = useSchoolData();
  const [fetchingSchoolEvents, setFetchingSchoolEvents] = useState(false);
  const [schoolFetchMessage, setSchoolFetchMessage] = useState("");
  const [discoveredSources, setDiscoveredSources] = useState<EventSource[]>([]);

  const now = new Date();
  const targetDate = getSchoolTargetDate(now);
  const targetLabel = getSchoolTargetLabel(now);
  const targetDow = getDayOfWeek(targetDate);
  const targetDayLabel = targetDow ? dayNames[targetDow] : "日曜";
  const targetValue = toDateInputValue(targetDate);
  const className = `${data.settings.grade}${data.settings.className}`;
  const classLabel = `${data.settings.schoolName} ${className}`;

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

  const schoolSources = useMemo(() => {
    const sources = discoveredSources.length
      ? discoveredSources
      : data.eventSources;
    return [...sources]
      .sort((a, b) =>
        (b.lastCheckedAt || b.fetchedAt).localeCompare(
          a.lastCheckedAt || a.fetchedAt,
        ),
      )
      .slice(0, 4);
  }, [data.eventSources, discoveredSources]);

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
    <>
      <header className="mb-4 rounded-lg border border-cyan-300/25 bg-cyan-400/10 p-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-md bg-cyan-400 text-slate-950">
            <School size={20} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h1 className="break-words text-2xl font-semibold tracking-normal text-white">
              {classLabel}
            </h1>
            <p className="mt-1 text-sm text-cyan-100">
              {targetLabel}: {formatTargetDateLabel(targetDate, targetDayLabel)}
            </p>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 max-[420px]:grid-cols-1">
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
            <p className="mb-3 rounded-md border border-cyan-300/25 bg-cyan-400/10 px-3 py-2 text-xs font-medium text-cyan-100">
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
                    className="rounded-lg border border-white/10 bg-[#0d141c] p-3"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="rounded-md bg-white/10 px-2 py-1 text-xs font-semibold text-slate-200">
                        {pack.period}限
                      </span>
                      <span className="break-words text-right text-sm font-semibold text-white">
                        {pack.subjectName}
                      </span>
                    </div>
                    {materialMatches.length ? (
                      <div className="mb-2 grid grid-cols-2 gap-2">
                        {materialMatches.map((match) => (
                          <div
                            key={match.material?.id}
                            className="rounded-md border border-cyan-300/20 bg-cyan-400/[0.06] p-2"
                          >
                            <div className="aspect-[4/3] overflow-hidden rounded bg-black/25">
                              {match.material?.imageDataUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  className="size-full object-contain"
                                  src={match.material.imageDataUrl}
                                  alt={match.material.title}
                                />
                              ) : null}
                            </div>
                            <p className="mt-1 break-words text-[11px] font-medium text-white">
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
                            className="rounded-md border border-cyan-300/20 bg-cyan-400/10 px-2 py-1 text-xs text-cyan-50"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-500">固定持ち物なし</p>
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

      <section className="mt-4 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
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
                  className="flex items-start gap-2 rounded-lg border border-rose-300/30 bg-rose-500/[0.08] p-3 text-sm font-semibold text-white"
                >
                  <AlertTriangle
                    className="mt-0.5 shrink-0 text-rose-200"
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
                  className={`flex items-center justify-between gap-3 rounded-lg border p-3 ${
                    daysLeft <= 14
                      ? "border-amber-300/35 bg-amber-400/[0.10]"
                      : "border-white/10 bg-[#0d141c]"
                  }`}
                >
                  <div className="flex min-w-0 items-start gap-2">
                    {daysLeft <= 14 && (
                      <AlertTriangle
                        className="mt-0.5 shrink-0 text-amber-100"
                        size={16}
                        aria-hidden="true"
                      />
                    )}
                    <span className="break-words text-sm font-semibold text-white">
                      {event.title}まで{daysLeft}日
                    </span>
                  </div>
                  <span className="shrink-0 rounded-md bg-black/25 px-2 py-1 text-xs text-slate-300">
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

      <section className="mt-4 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
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
            <p className="mb-3 rounded-md border border-cyan-300/25 bg-cyan-400/10 px-3 py-2 text-xs font-medium text-cyan-100">
              {schoolFetchMessage}
            </p>
          )}
          {schoolSources.length ? (
            <div className="grid gap-2">
              {schoolSources.map((source) => (
                <article
                  key={source.id}
                  className="rounded-lg border border-white/10 bg-[#0d141c] p-3"
                >
                  <p className="text-sm font-semibold text-white">
                    {source.title}を検出
                  </p>
                  <Link
                    className="mt-2 inline-flex max-w-full items-center gap-1 break-all text-xs text-cyan-200 underline-offset-4 hover:underline"
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

      <section className="mt-4">
        <Card
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
                  className="flex items-start gap-2 rounded-md border border-white/10 bg-[#0d141c] px-3 py-2 text-sm text-slate-200"
                >
                  <span className="mt-0.5 shrink-0 text-cyan-200">
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
    </>
  );
}
