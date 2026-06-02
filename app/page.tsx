"use client";

import Link from "next/link";
import { ArrowRight, CalendarClock, ClipboardList, PackageCheck } from "lucide-react";
import { AssignmentCard, EventCountdown, TimetableSlot } from "@/components/school-cards";
import { Card, EmptyState, PageHeader, secondaryButtonClass } from "@/components/ui";
import {
  dayNames,
  daysBetween,
  formatJapaneseDate,
  getDayOfWeek,
  getNextSchoolDate,
} from "@/lib/date";
import { useSchoolData } from "@/lib/school-data";

function splitItems(value: string) {
  return value
    .split(/[\n,、]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function TodayPage() {
  const { data, subjectById } = useSchoolData();
  const today = new Date();
  const todayDow = getDayOfWeek(today);
  const nextSchoolDate = getNextSchoolDate(data.settings, today);
  const nextDow = getDayOfWeek(nextSchoolDate);

  const todayTimetable =
    todayDow === 0
      ? []
      : data.timetable
          .filter((item) => item.dayOfWeek === todayDow)
          .sort((a, b) => a.period - b.period);

  const nextTimetable =
    nextDow === 0
      ? []
      : data.timetable
          .filter((item) => item.dayOfWeek === nextDow)
          .sort((a, b) => a.period - b.period);

  const activeAssignments = data.assignments
    .filter((assignment) => !["done", "submitted"].includes(assignment.status))
    .sort((a, b) => daysBetween(a.dueDate) - daysBetween(b.dueDate));

  const dueToday = activeAssignments.filter(
    (assignment) => daysBetween(assignment.dueDate) === 0,
  );
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

  const prepItems = Array.from(
    new Set(nextTimetable.flatMap((item) => splitItems(item.items))),
  );

  return (
    <>
      <PageHeader
        title="今日の司令室"
        description={formatJapaneseDate(today)}
      />

      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.9fr]">
        <div className="grid gap-4">
          <Card
            title="今日の時間割"
            action={
              <Link className={secondaryButtonClass} href="/timetable">
                編集
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            }
          >
            {todayTimetable.length ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {todayTimetable.map((item) => (
                  <TimetableSlot
                    key={item.id}
                    item={item}
                    subject={subjectById.get(item.subjectId)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState text="今日の時間割はまだ登録されていません。" />
            )}
          </Card>

          <Card
            title="今日締切の提出物"
            action={
              <Link className={secondaryButtonClass} href="/assignments">
                追加
                <ClipboardList size={15} aria-hidden="true" />
              </Link>
            }
          >
            {dueToday.length ? (
              <div className="grid gap-2">
                {dueToday.map((assignment) => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    subject={subjectById.get(assignment.subjectId)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState text="今日締切の未完了提出物はありません。" />
            )}
          </Card>

          <Card title="明日までの提出物">
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
        </div>

        <div className="grid gap-4 content-start">
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

          <Card
            title={`${nextDow ? dayNames[nextDow] : "次"}の持ち物`}
            action={
              <Link className={secondaryButtonClass} href="/timetable">
                時間割
                <PackageCheck size={15} aria-hidden="true" />
              </Link>
            }
          >
            {prepItems.length ? (
              <ul className="grid gap-2">
                {prepItems.map((item) => (
                  <li
                    key={item}
                    className="rounded-md border border-white/10 bg-[#0d141c] px-3 py-2 text-sm text-slate-200"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState text="次の登校日の持ち物はまだ登録されていません。" />
            )}
          </Card>

          <Card title="今日やる予習・復習">
            <EmptyState text="Phase 2で予習・復習タスク管理を追加します。" />
          </Card>
        </div>
      </div>
    </>
  );
}
