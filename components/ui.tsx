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
      <h1 className="text-2xl font-semibold tracking-normal text-white md:text-3xl">
        {title}
      </h1>
      <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>
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
      className={`rounded-lg border border-white/10 bg-[#111821] p-4 shadow-sm shadow-black/20 ${className}`}
    >
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          {title ? (
            <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
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
    <div className="rounded-md border border-dashed border-white/15 px-3 py-6 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}

export function SubjectPill({ subject }: { subject?: Subject }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-200">
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
    high: "border-rose-300/35 bg-rose-400/15 text-rose-100",
    middle: "border-amber-300/35 bg-amber-400/15 text-amber-100",
    low: "border-emerald-300/35 bg-emerald-400/10 text-emerald-100",
  };

  return (
    <span
      className={`rounded-md border px-2 py-1 text-xs font-medium ${styles[priority]}`}
    >
      優先{priorityLabels[priority]}
    </span>
  );
}

export function StatusBadge({ status }: { status: AssignmentStatus }) {
  const Icon =
    status === "submitted" ? Send : status === "done" ? CheckCircle2 : Circle;
  const styles: Record<AssignmentStatus, string> = {
    todo: "border-slate-500/40 bg-slate-500/10 text-slate-200",
    doing: "border-cyan-300/35 bg-cyan-400/15 text-cyan-100",
    done: "border-emerald-300/35 bg-emerald-400/15 text-emerald-100",
    submitted: "border-violet-300/35 bg-violet-400/15 text-violet-100",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium ${styles[status]}`}
    >
      <Icon size={13} aria-hidden="true" />
      {assignmentStatusLabels[status]}
    </span>
  );
}

export function DueBadge({ daysLeft }: { daysLeft: number }) {
  if (daysLeft < 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-rose-300/40 bg-rose-500/20 px-2 py-1 text-xs font-semibold text-rose-100">
        <AlertTriangle size={13} aria-hidden="true" />
        {Math.abs(daysLeft)}日超過
      </span>
    );
  }
  if (daysLeft === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-rose-300/40 bg-rose-500/20 px-2 py-1 text-xs font-semibold text-rose-100">
        <AlertTriangle size={13} aria-hidden="true" />
        今日締切
      </span>
    );
  }
  if (daysLeft === 1) {
    return (
      <span className="rounded-md border border-amber-300/40 bg-amber-400/20 px-2 py-1 text-xs font-semibold text-amber-100">
        明日締切
      </span>
    );
  }
  return (
    <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300">
      あと{daysLeft}日
    </span>
  );
}

export const inputClass =
  "w-full rounded-md border border-white/10 bg-[#0b1118] px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/70";

export const selectClass =
  "w-full rounded-md border border-white/10 bg-[#0b1118] px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-300/70";

export const iconButtonClass =
  "inline-grid size-9 place-items-center rounded-md border border-white/10 bg-white/5 text-slate-300 transition hover:border-cyan-300/50 hover:text-white";

export const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-md bg-cyan-400 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50";

export const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-300/50 hover:text-white";
