"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { Download, ExternalLink, Save, Trash2 } from "lucide-react";
import { EventCountdown } from "@/components/school-cards";
import {
  Card,
  EmptyState,
  PageHeader,
  iconButtonClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
  selectClass,
} from "@/components/ui";
import {
  eventSourceStatusLabels,
  eventSourceTypeLabels,
  eventTypeLabels,
  priorityLabels,
} from "@/lib/labels";
import { daysBetween, toDateInputValue } from "@/lib/date";
import { useSchoolData } from "@/lib/school-data";
import { Priority, SchoolEvent, SchoolEventType } from "@/lib/types";

type EventForm = Omit<SchoolEvent, "id">;

function defaultDateAfter(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateInputValue(date);
}

const initialForm: EventForm = {
  title: "",
  date: defaultDateAfter(7),
  type: "test",
  importance: "high",
  memo: "",
};

export default function EventsPage() {
  const { data, addEvent, removeEvent } = useSchoolData();
  const [form, setForm] = useState<EventForm>(initialForm);

  const sortedEvents = useMemo(() => {
    return [...data.events].sort(
      (a, b) =>
        daysBetween(a.date) - daysBetween(b.date) ||
        (b.importance === "high" ? 1 : 0) - (a.importance === "high" ? 1 : 0),
    );
  }, [data.events]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim()) {
      return;
    }
    addEvent({
      ...form,
      title: form.title.trim(),
      memo: form.memo.trim(),
    });
    setForm({ ...initialForm, date: defaultDateAfter(7) });
  }

  return (
    <>
      <PageHeader
        title="行事・カウントダウン"
        description="テスト、文化祭、検定、部活大会までの残り日数をトップに表示します。"
      />

      <div className="grid gap-4 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="grid gap-4 content-start">
          <Card title="行事を登録">
            <form className="grid gap-3" onSubmit={handleSubmit}>
              <label className="grid gap-1 text-xs font-medium text-slate-300">
                行事名
                <input
                  className={inputClass}
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="期末テスト"
                  required
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1 text-xs font-medium text-slate-300">
                  日付
                  <input
                    className={inputClass}
                    type="date"
                    value={form.date}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, date: event.target.value }))
                    }
                    required
                  />
                </label>
                <label className="grid gap-1 text-xs font-medium text-slate-300">
                  重要度
                  <select
                    className={selectClass}
                    value={form.importance}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        importance: event.target.value as Priority,
                      }))
                    }
                  >
                    {(["low", "middle", "high"] as Priority[]).map((priority) => (
                      <option key={priority} value={priority}>
                        {priorityLabels[priority]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="grid gap-1 text-xs font-medium text-slate-300">
                種類
                <select
                  className={selectClass}
                  value={form.type}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      type: event.target.value as SchoolEventType,
                    }))
                  }
                >
                  {(
                    [
                      "test",
                      "school_event",
                      "club",
                      "exam",
                      "other",
                    ] as SchoolEventType[]
                  ).map((type) => (
                    <option key={type} value={type}>
                      {eventTypeLabels[type]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-xs font-medium text-slate-300">
                メモ
                <textarea
                  className={`${inputClass} min-h-20 resize-none`}
                  value={form.memo}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, memo: event.target.value }))
                  }
                  placeholder="集合時間や持ち物など"
                />
              </label>

              <button className={primaryButtonClass} type="submit">
                <Save size={16} aria-hidden="true" />
                保存
              </button>
            </form>
          </Card>

          <Card
            title="取り込んだPDF URL"
            action={
              <Link className={secondaryButtonClass} href="/import-events">
                行事取込
                <Download size={15} aria-hidden="true" />
              </Link>
            }
          >
            {data.eventSources.length ? (
              <div className="grid gap-2">
                {data.eventSources.map((source) => (
                  <article
                    key={source.id}
                    className="rounded-lg border border-white/10 bg-[#0d141c] p-3"
                  >
                    <div className="mb-2 flex flex-wrap gap-2">
                      <span className="rounded-md border border-cyan-300/25 bg-cyan-400/10 px-2 py-1 text-xs font-medium text-cyan-100">
                        {eventSourceTypeLabels[source.sourceType]}
                      </span>
                      <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300">
                        {eventSourceStatusLabels[source.status]}
                      </span>
                    </div>
                    <Link
                      className="inline-flex max-w-full items-center gap-1 break-all text-xs text-cyan-200 underline-offset-4 hover:underline"
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {source.url}
                      <ExternalLink size={13} aria-hidden="true" />
                    </Link>
                    {source.memo && (
                      <p className="mt-2 break-words text-xs text-slate-400">
                        {source.memo}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState text="行事予定PDFのURLはまだ保存されていません。" />
            )}
          </Card>
        </div>

        <Card title="カウントダウン一覧">
          {sortedEvents.length ? (
            <div className="grid gap-2">
              {sortedEvents.map((event) => (
                <div key={event.id} className="grid grid-cols-[1fr_auto] gap-2">
                  <EventCountdown event={event} />
                  <button
                    className={iconButtonClass}
                    type="button"
                    onClick={() => removeEvent(event.id)}
                    title="削除"
                    aria-label="削除"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="まだ行事が登録されていません。" />
          )}
        </Card>
      </div>
    </>
  );
}
