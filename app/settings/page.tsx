"use client";

import { Settings, SlidersHorizontal } from "lucide-react";
import {
  Card,
  PageHeader,
  inputClass,
  selectClass,
} from "@/components/ui";
import { useSchoolData } from "@/lib/school-data";

export default function SettingsPage() {
  const { data, updateSettings, updateSubject } = useSchoolData();
  const classLabel = `${data.settings.schoolName} ${data.settings.grade}${data.settings.className}`;

  return (
    <>
      <PageHeader
        title="設定"
        description="明日の準備に使う学校・クラスと教科ごとの固定持ち物を管理します。"
      />

      <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="grid gap-4 content-start">
          <Card title="学年・クラス">
            <div className="mb-4 rounded-lg border border-cyan-300/25 bg-cyan-400/10 p-3">
              <p className="text-xs font-medium text-cyan-100">ホーム表示</p>
              <p className="mt-1 text-lg font-semibold text-white">{classLabel}</p>
            </div>

            <div className="grid gap-3">
              <label className="grid gap-1 text-xs font-medium text-slate-300">
                学校名
                <input
                  className={inputClass}
                  value={data.settings.schoolName}
                  onChange={(event) =>
                    updateSettings({ schoolName: event.target.value })
                  }
                  placeholder="筑前高校"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1 text-xs font-medium text-slate-300">
                  学年
                  <input
                    className={inputClass}
                    value={data.settings.grade}
                    onChange={(event) =>
                      updateSettings({ grade: event.target.value })
                    }
                    placeholder="1年"
                  />
                </label>
                <label className="grid gap-1 text-xs font-medium text-slate-300">
                  クラス
                  <input
                    className={inputClass}
                    value={data.settings.className}
                    onChange={(event) =>
                      updateSettings({ className: event.target.value })
                    }
                    placeholder="4組"
                  />
                </label>
              </div>
            </div>
          </Card>

          <Card title="基本設定">
            <div className="grid gap-3">
              <label className="grid gap-1 text-xs font-medium text-slate-300">
                時限数
                <select
                  className={selectClass}
                  value={data.settings.periodCount}
                  onChange={(event) =>
                    updateSettings({ periodCount: Number(event.target.value) })
                  }
                >
                  {[4, 5, 6, 7].map((period) => (
                    <option key={period} value={period}>
                      {period}限
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-[#0d141c] px-3 py-2 text-sm text-slate-200">
                <span className="inline-flex items-center gap-2">
                  <SlidersHorizontal size={16} aria-hidden="true" />
                  土曜授業
                </span>
                <input
                  type="checkbox"
                  checked={data.settings.hasSaturday}
                  onChange={(event) =>
                    updateSettings({ hasSaturday: event.target.checked })
                  }
                  className="size-4 accent-cyan-400"
                />
              </label>
            </div>
          </Card>
        </div>

        <Card
          title="教科ごとの固定持ち物"
          action={<Settings size={16} className="text-slate-400" aria-hidden="true" />}
        >
          <div className="grid gap-3">
            {data.subjects.map((subject) => (
              <article
                key={subject.id}
                className="rounded-lg border border-white/10 bg-[#0d141c] p-3"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className="size-3 rounded-full"
                    style={{ backgroundColor: subject.color }}
                  />
                  <h2 className="text-sm font-semibold text-white">
                    {subject.name}
                  </h2>
                </div>
                <label className="grid gap-1 text-xs font-medium text-slate-300">
                  固定持ち物
                  <textarea
                    className={`${inputClass} min-h-20 resize-none`}
                    value={subject.fixedItems}
                    onChange={(event) =>
                      updateSubject(subject.id, {
                        fixedItems: event.target.value,
                      })
                    }
                    placeholder="教科書、ノート、ワーク"
                  />
                </label>
              </article>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
