"use client";

import { FormEvent, useMemo, useState } from "react";
import { Save, Trash2 } from "lucide-react";
import { Card, EmptyState, PageHeader, iconButtonClass, inputClass, primaryButtonClass, selectClass } from "@/components/ui";
import { SubjectPill } from "@/components/ui";
import { dayNames, getDayOfWeek } from "@/lib/date";
import { useSchoolData } from "@/lib/school-data";
import { DayOfWeek, TimetableItem } from "@/lib/types";

type TimetableForm = Omit<TimetableItem, "id">;

function emptyForm(dayOfWeek: DayOfWeek): TimetableForm {
  return {
    dayOfWeek,
    period: 1,
    subjectId: "japanese",
    room: "",
    teacher: "",
    items: "",
  };
}

export default function TimetablePage() {
  const {
    data,
    subjectById,
    upsertTimetableItem,
    removeTimetableItem,
  } = useSchoolData();
  const todayDow = getDayOfWeek();
  const initialDay = todayDow === 0 ? 1 : todayDow;
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(initialDay);
  const [form, setForm] = useState<TimetableForm>(emptyForm(initialDay));

  const days = useMemo<DayOfWeek[]>(() => {
    return data.settings.hasSaturday ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5];
  }, [data.settings.hasSaturday]);

  const periods = useMemo(() => {
    return Array.from({ length: data.settings.periodCount }, (_, index) => index + 1);
  }, [data.settings.periodCount]);

  const selectedItems = data.timetable
    .filter((item) => item.dayOfWeek === selectedDay)
    .sort((a, b) => a.period - b.period);

  function handleSelectDay(day: DayOfWeek) {
    setSelectedDay(day);
    setForm((current) => ({ ...current, dayOfWeek: day }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    upsertTimetableItem({
      ...form,
      subjectId: form.subjectId || data.subjects[0]?.id || "japanese",
      room: form.room.trim(),
      teacher: form.teacher.trim(),
      items: form.items.trim(),
    });
    setSelectedDay(form.dayOfWeek);
    setForm((current) => ({
      ...emptyForm(current.dayOfWeek),
      subjectId: current.subjectId,
      period: Math.min(current.period + 1, data.settings.periodCount),
    }));
  }

  function loadItem(item: TimetableItem) {
    setSelectedDay(item.dayOfWeek);
    setForm({
      dayOfWeek: item.dayOfWeek,
      period: item.period,
      subjectId: item.subjectId,
      room: item.room,
      teacher: item.teacher,
      items: item.items,
    });
  }

  return (
    <>
      <PageHeader
        title="時間割管理"
        description="月曜から金曜の1限から6限を登録し、今日の時間割と次の持ち物に反映します。"
      />

      <div className="grid gap-4 lg:grid-cols-[0.82fr_1.18fr]">
        <Card title="授業を登録">
          <form className="grid gap-3" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1 text-xs font-medium text-slate-300">
                曜日
                <select
                  className={selectClass}
                  value={form.dayOfWeek}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      dayOfWeek: Number(event.target.value) as DayOfWeek,
                    }))
                  }
                >
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {dayNames[day]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-xs font-medium text-slate-300">
                時限
                <select
                  className={selectClass}
                  value={form.period}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      period: Number(event.target.value),
                    }))
                  }
                >
                  {periods.map((period) => (
                    <option key={period} value={period}>
                      {period}限
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="grid gap-1 text-xs font-medium text-slate-300">
              教科
              <select
                className={selectClass}
                value={form.subjectId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    subjectId: event.target.value,
                  }))
                }
              >
                {data.subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1 text-xs font-medium text-slate-300">
                教室
                <input
                  className={inputClass}
                  value={form.room}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, room: event.target.value }))
                  }
                  placeholder="2-B"
                />
              </label>
              <label className="grid gap-1 text-xs font-medium text-slate-300">
                先生
                <input
                  className={inputClass}
                  value={form.teacher}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      teacher: event.target.value,
                    }))
                  }
                  placeholder="田中先生"
                />
              </label>
            </div>

            <label className="grid gap-1 text-xs font-medium text-slate-300">
              持ち物
              <textarea
                className={`${inputClass} min-h-20 resize-none`}
                value={form.items}
                onChange={(event) =>
                  setForm((current) => ({ ...current, items: event.target.value }))
                }
                placeholder="教科書、ノート、ワーク"
              />
            </label>

            <button className={primaryButtonClass} type="submit">
              <Save size={16} aria-hidden="true" />
              登録
            </button>
          </form>
        </Card>

        <Card title="曜日別時間割">
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            {days.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => handleSelectDay(day)}
                className={`shrink-0 rounded-md px-3 py-2 text-sm font-medium ${
                  selectedDay === day
                    ? "bg-cyan-400 text-slate-950"
                    : "border border-white/10 bg-white/5 text-slate-300"
                }`}
              >
                {dayNames[day]}
              </button>
            ))}
          </div>

          {selectedItems.length ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {selectedItems.map((item) => (
                <article
                  key={item.id}
                  className="rounded-lg border border-white/10 bg-[#0d141c] p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      className="min-w-0 text-left"
                      onClick={() => loadItem(item)}
                    >
                      <span className="mb-2 inline-flex rounded-md bg-white/10 px-2 py-1 text-xs font-semibold text-slate-200">
                        {item.period}限
                      </span>
                      <div>
                        <SubjectPill subject={subjectById.get(item.subjectId)} />
                      </div>
                    </button>
                    <button
                      className={iconButtonClass}
                      type="button"
                      onClick={() => removeTimetableItem(item.id)}
                      title="削除"
                      aria-label="削除"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                  <div className="mt-3 grid gap-1 text-xs text-slate-400">
                    {item.room && <span>教室: {item.room}</span>}
                    {item.teacher && <span>先生: {item.teacher}</span>}
                    {item.items && (
                      <span className="break-words">持ち物: {item.items}</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState text={`${dayNames[selectedDay]}の時間割は未登録です。`} />
          )}
        </Card>
      </div>
    </>
  );
}
