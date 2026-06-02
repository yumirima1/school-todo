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
      className={`rounded-lg border p-3 ${
        finished
          ? "border-white/10 bg-white/[0.03]"
          : daysLeft <= 1
            ? "border-rose-300/30 bg-rose-500/[0.08]"
            : "border-white/10 bg-[#0d141c]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <SubjectPill subject={subject} />
            <DueBadge daysLeft={daysLeft} />
            <PriorityBadge priority={assignment.priority} />
          </div>
          <h3 className="break-words text-sm font-semibold text-white">
            {assignment.title}
          </h3>
          {assignment.description && (
            <p className="mt-1 break-words text-xs leading-5 text-slate-400">
              {assignment.description}
            </p>
          )}
          {assignment.memo && (
            <p className="mt-2 break-words rounded-md bg-black/20 px-2 py-1.5 text-xs text-slate-300">
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
    <article className="rounded-lg border border-white/10 bg-[#0d141c] p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-md bg-white/10 px-2 py-1 text-xs font-semibold text-slate-200">
          {item.period}限
        </span>
        <SubjectPill subject={subject} />
      </div>
      <div className="mt-3 grid gap-1 text-xs text-slate-400">
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
      className={`rounded-lg border p-3 ${
        urgent
          ? "border-amber-300/35 bg-amber-400/[0.10]"
          : "border-white/10 bg-[#0d141c]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-400">
            {eventTypeLabels[event.type]} / {event.date}
          </p>
          <h3 className="mt-1 break-words text-sm font-semibold text-white">
            {event.title}
          </h3>
          {event.memo && (
            <p className="mt-2 break-words text-xs leading-5 text-slate-400">
              {event.memo}
            </p>
          )}
        </div>
        <div className="shrink-0 rounded-md border border-white/10 bg-black/25 px-3 py-2 text-center">
          <span className="block text-xl font-semibold text-cyan-200">
            {daysLeft < 0 ? "-" : daysLeft}
          </span>
          <span className="block text-[11px] text-slate-400">days</span>
        </div>
      </div>
    </article>
  );
}
