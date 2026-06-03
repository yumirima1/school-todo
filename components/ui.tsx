import { AlertTriangle, CheckCircle2, Circle, Send } from "lucide-react";
import { assignmentStatusLabels, priorityLabels } from "@/lib/labels";
import { AssignmentStatus, Priority, Subject } from "@/lib/types";

export function PageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5">
      <h1 className="text-3xl font-bold tracking-normal text-slate-950 md:text-4xl">
        {title}
      </h1>
      <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

export function Card({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[1.6rem] border border-white/80 bg-white/80 p-4 shadow-xl shadow-slate-200/60 backdrop-blur ${className}`}
    >
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          {title ? (
            <h2 className="text-base font-bold text-slate-950">{title}</h2>
          ) : (
            <span />
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white/50 px-3 py-6 text-center text-sm font-medium text-slate-400">
      {text}
    </div>
  );
}

export function SubjectPill({ subject }: { subject?: Subject }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-2.5 py-1 text-xs font-semibold text-slate-700">
      <span
        className="size-2 rounded-full"
        style={{ backgroundColor: subject?.color ?? "#64748b" }}
      />
      {subject?.name ?? "未設定"}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const styles: Record<Priority, string> = {
    high: "border-rose-200 bg-rose-50 text-rose-700",
    middle: "border-amber-200 bg-amber-50 text-amber-700",
    low: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[priority]}`}
    >
      優先{priorityLabels[priority]}
    </span>
  );
}

export function StatusBadge({ status }: { status: AssignmentStatus }) {
  const Icon =
    status === "submitted" ? Send : status === "done" ? CheckCircle2 : Circle;
  const styles: Record<AssignmentStatus, string> = {
    todo: "border-slate-200 bg-slate-50 text-slate-600",
    doing: "border-sky-200 bg-sky-50 text-sky-700",
    done: "border-emerald-200 bg-emerald-50 text-emerald-700",
    submitted: "border-violet-200 bg-violet-50 text-violet-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      <Icon size={13} aria-hidden="true" />
      {assignmentStatusLabels[status]}
    </span>
  );
}

export function DueBadge({ daysLeft }: { daysLeft: number }) {
  if (daysLeft < 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700">
        <AlertTriangle size={13} aria-hidden="true" />
        {Math.abs(daysLeft)}日超過
      </span>
    );
  }
  if (daysLeft === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700">
        <AlertTriangle size={13} aria-hidden="true" />
        今日締切
      </span>
    );
  }
  if (daysLeft === 1) {
    return (
      <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
        明日締切
      </span>
    );
  }
  return (
    <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-1 text-xs font-semibold text-slate-500">
      あと{daysLeft}日
    </span>
  );
}

export const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-white/85 px-3 py-2 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100";

export const selectClass =
  "w-full rounded-2xl border border-slate-200 bg-white/85 px-3 py-2 text-sm font-medium text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100";

export const iconButtonClass =
  "inline-grid size-10 place-items-center rounded-2xl border border-slate-200 bg-white/80 text-slate-500 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700";

export const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full bg-sky-500 px-3.5 py-2 text-sm font-bold text-white shadow-lg shadow-sky-100 transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50";

export const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/75 px-3.5 py-2 text-sm font-bold text-slate-600 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700";
