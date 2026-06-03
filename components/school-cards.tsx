"use client";

import { Check, Pencil, Trash2 } from "lucide-react";
import { DueBadge, PriorityBadge, SubjectPill, StatusBadge, iconButtonClass } from "@/components/ui";
import { eventTypeLabels } from "@/lib/labels";
import { daysBetween } from "@/lib/date";
import { Assignment, SchoolEvent, Subject, TimetableItem } from "@/lib/types";

export function AssignmentCard({
  assignment,
  subject,
  onToggle,
  onEdit,
  onDelete,
}: {
  assignment: Assignment;
  subject?: Subject;
  onToggle?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const daysLeft = daysBetween(assignment.dueDate);
  const finished =
    assignment.status === "done" || assignment.status === "submitted";

  return (
    <article
      className={`rounded-2xl border p-3 shadow-sm ${
        finished
          ? "border-slate-200 bg-white/55"
          : daysLeft <= 1
            ? "border-rose-200 bg-rose-50"
            : "border-slate-200 bg-white/75"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <SubjectPill subject={subject} />
            <DueBadge daysLeft={daysLeft} />
            <PriorityBadge priority={assignment.priority} />
          </div>
          <h3 className="break-words text-sm font-bold text-slate-950">
            {assignment.title}
          </h3>
          {assignment.description && (
            <p className="mt-1 break-words text-xs leading-5 text-slate-500">
              {assignment.description}
            </p>
          )}
          {assignment.memo && (
            <p className="mt-2 break-words rounded-2xl bg-slate-100 px-2 py-1.5 text-xs text-slate-500">
              {assignment.memo}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          {onToggle && (
            <button
              className={iconButtonClass}
              type="button"
              onClick={onToggle}
              title={finished ? "未完了に戻す" : "完了にする"}
              aria-label={finished ? "未完了に戻す" : "完了にする"}
            >
              <Check size={17} aria-hidden="true" />
            </button>
          )}
          {onEdit && (
            <button
              className={iconButtonClass}
              type="button"
              onClick={onEdit}
              title="編集"
              aria-label="編集"
            >
              <Pencil size={16} aria-hidden="true" />
            </button>
          )}
          {onDelete && (
            <button
              className={iconButtonClass}
              type="button"
              onClick={onDelete}
              title="削除"
              aria-label="削除"
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
      <div className="mt-3">
        <StatusBadge status={assignment.status} />
      </div>
    </article>
  );
}

export function TimetableSlot({
  item,
  subject,
}: {
  item: TimetableItem;
  subject?: Subject;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white/75 p-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-bold text-sky-700">
          {item.period}限
        </span>
        <SubjectPill subject={subject} />
      </div>
      <div className="mt-3 grid gap-1 text-xs font-medium text-slate-500">
        {item.room && <span>教室: {item.room}</span>}
        {item.teacher && <span>先生: {item.teacher}</span>}
        {item.items && <span className="break-words">持ち物: {item.items}</span>}
      </div>
    </article>
  );
}

export function EventCountdown({
  event,
}: {
  event: SchoolEvent;
}) {
  const daysLeft = daysBetween(event.date);
  const urgent = daysLeft <= 7;

  return (
    <article
      className={`rounded-2xl border p-3 shadow-sm ${
        urgent
          ? "border-amber-200 bg-amber-50"
          : "border-slate-200 bg-white/75"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500">
            {eventTypeLabels[event.type]} / {event.date}
          </p>
          <h3 className="mt-1 break-words text-sm font-bold text-slate-950">
            {event.title}
          </h3>
          {event.memo && (
            <p className="mt-2 break-words text-xs leading-5 text-slate-500">
              {event.memo}
            </p>
          )}
        </div>
        <div className="shrink-0 rounded-2xl border border-white/80 bg-white/80 px-3 py-2 text-center">
          <span className="block text-xl font-bold text-sky-700">
            {daysLeft < 0 ? "-" : daysLeft}
          </span>
          <span className="block text-[11px] font-semibold text-slate-400">
            days
          </span>
        </div>
      </div>
    </article>
  );
}
