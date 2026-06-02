"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  ClipboardList,
  PackageCheck,
  School,
} from "lucide-react";
import { AssignmentCard, EventCountdown, TimetableSlot } from "@/components/school-cards";
import { Card, EmptyState, PageHeader, secondaryButtonClass } from "@/components/ui";
import {
  dayNames,
  daysBetween,
  formatJapaneseDate,
  getDayOfWeek,
} from "@/lib/date";
import { buildTomorrowPacks } from "@/lib/prep";
import { useSchoolData } from "@/lib/school-data";

export default function TodayPage() {
  const { data, subjectById } = useSchoolData();
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowDow = getDayOfWeek(tomorrow);
  const tomorrowLabel = tomorrowDow ? dayNames[tomorrowDow] : "日曜";

  const nextTimetable =
    tomorrowDow === 0
      ? []
      : data.timetable
          .filter((item) => item.dayOfWeek === tomorrowDow)
          .sort((a, b) => a.period - b.period);

  const activeAssignments = data.assignments
    .filter((assignment) => !["done", "submitted"].includes(assignment.status))
    .sort((a, b) => daysBetween(a.dueDate) - daysBetween(b.dueDate));

  const dueTomorrow = activeAssignments.filter(
    (assignment) => daysBetween(assignment.dueDate) === 1,
  );

  const upcomingEvent = data.events
    .filter((event) => daysBetween(event.date) >= 0)
    .sort(
      (a, b) =>
        daysBetween(a.date) - daysBetween(b.date) ||
        (b.importance === "high" ? 1 : 0) - (a.importance === "high" ? 1 : 0),
    )[0];

  const tomorrowPacks = buildTomorrowPacks(nextTimetable, subjectById);
  const allTomorrowItems = Array.from(
    new Set(tomorrowPacks.flatMap((pack) => pack.items)),
  );
  const classLabel = `${data.settings.schoolName} ${data.settings.grade}${data.settings.className}`;

  return (
    <>
      <PageHeader
        title="明日の準備"
        description={`${formatJapaneseDate(tomorrow)} / ${tomorrowLabel}`}
      />

      <section className="mb-4 rounded-lg border border-cyan-300/30 bg-cyan-400/10 p-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-md bg-cyan-400 text-slate-950">
            <School size={20} aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-medium text-cyan-100">明日の準備先</p>
            <h2 className="text-xl font-semibold text-white">{classLabel}</h2>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.9fr]">
        <div className="grid gap-4">
          <Card
            title="明日の時間割"
            action={
              <Link className={secondaryButtonClass} href="/timetable">
                編集
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            }
          >
            {nextTimetable.length ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {nextTimetable.map((item) => (
                  <TimetableSlot
                    key={item.id}
                    item={item}
                    subject={subjectById.get(item.subjectId)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState text="明日の時間割はまだ登録されていません。" />
            )}
          </Card>

          <Card
            title="明日の提出物"
            action={
              <Link className={secondaryButtonClass} href="/assignments">
                追加
                <ClipboardList size={15} aria-hidden="true" />
              </Link>
            }
          >
            {dueTomorrow.length ? (
              <div className="grid gap-2">
                {dueTomorrow.map((assignment) => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    subject={subjectById.get(assignment.subjectId)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState text="明日締切の未完了提出物はありません。" />
            )}
          </Card>

          <Card title="明日の準備チェック">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md border border-white/10 bg-[#0d141c] px-2 py-3">
                <span className="block text-2xl font-semibold text-cyan-200">
                  {nextTimetable.length}
                </span>
                <span className="text-xs text-slate-400">授業</span>
              </div>
              <div className="rounded-md border border-white/10 bg-[#0d141c] px-2 py-3">
                <span className="block text-2xl font-semibold text-amber-200">
                  {allTomorrowItems.length}
                </span>
                <span className="text-xs text-slate-400">持ち物</span>
              </div>
              <div className="rounded-md border border-white/10 bg-[#0d141c] px-2 py-3">
                <span className="block text-2xl font-semibold text-rose-200">
                  {dueTomorrow.length}
                </span>
                <span className="text-xs text-slate-400">提出物</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-4 content-start">
          <Card
            title="明日の持ち物"
            action={
              <Link className={secondaryButtonClass} href="/settings">
                固定持ち物
                <PackageCheck size={15} aria-hidden="true" />
              </Link>
            }
          >
            {tomorrowPacks.some((pack) => pack.items.length) ? (
              <div className="grid gap-2">
                {tomorrowPacks.map((pack) => (
                  <article
                    key={pack.key}
                    className="rounded-lg border border-white/10 bg-[#0d141c] p-3"
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="rounded-md bg-white/10 px-2 py-1 text-xs font-semibold text-slate-200">
                        {pack.period}限
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-white">
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: pack.subjectColor }}
                        />
                        {pack.subjectName}
                      </span>
                    </div>
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
                      <p className="text-xs text-slate-500">
                        固定持ち物は未設定です。
                      </p>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState text="明日の時間割か教科ごとの固定持ち物を登録してください。" />
            )}
          </Card>

          <Card
            title="次の重要予定"
            action={
              <Link className={secondaryButtonClass} href="/events">
                登録
                <CalendarClock size={15} aria-hidden="true" />
              </Link>
            }
          >
            {upcomingEvent ? (
              <EventCountdown event={upcomingEvent} />
            ) : (
              <EmptyState text="行事・テストを登録すると残り日数が表示されます。" />
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
