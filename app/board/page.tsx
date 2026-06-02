"use client";

import { FormEvent, useMemo, useState } from "react";
import { Camera, Plus, Save, Trash2 } from "lucide-react";
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
  createBoardNote,
  createEmptyBoardMemo,
  updateBoardNote,
  updateBoardPeriod,
} from "@/lib/board";
import { toDateInputValue } from "@/lib/date";
import { boardNoteTypeLabels } from "@/lib/labels";
import { useSchoolData } from "@/lib/school-data";
import { BoardMemo, BoardNoteType } from "@/lib/types";

function getTomorrowValue() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return toDateInputValue(tomorrow);
}

export default function BoardPage() {
  const { data, upsertBoardMemo, removeBoardMemo } = useSchoolData();
  const defaultClassName = `${data.settings.grade}${data.settings.className}`;
  const [memo, setMemo] = useState<BoardMemo>(() =>
    createEmptyBoardMemo(getTomorrowValue(), defaultClassName, data.subjects),
  );

  const sortedMemos = useMemo(() => {
    return [...data.boardMemos].sort((a, b) => b.date.localeCompare(a.date));
  }, [data.boardMemos]);

  function resetMemo() {
    setMemo(createEmptyBoardMemo(getTomorrowValue(), defaultClassName, data.subjects));
  }

  function handleSubjectChange(periodNumber: number, subjectId: string) {
    const subject = data.subjects.find((item) => item.id === subjectId);
    setMemo((current) => ({
      ...current,
      periods: updateBoardPeriod(current.periods, periodNumber, {
        subjectId,
        subjectName: subject?.name ?? "",
      }),
    }));
  }

  function addNote(periodNumber: number) {
    setMemo((current) => {
      const target = current.periods.find(
        (period) => period.period === periodNumber,
      );
      return {
        ...current,
        periods: updateBoardPeriod(current.periods, periodNumber, {
          notes: [...(target?.notes ?? []), createBoardNote()],
        }),
      };
    });
  }

  function removeNote(periodNumber: number, noteIndex: number) {
    setMemo((current) => {
      const target = current.periods.find(
        (period) => period.period === periodNumber,
      );
      return {
        ...current,
        periods: updateBoardPeriod(current.periods, periodNumber, {
          notes: (target?.notes ?? []).filter((_, index) => index !== noteIndex),
        }),
      };
    });
  }

  function updateNote(
    periodNumber: number,
    noteIndex: number,
    patch: Parameters<typeof updateBoardNote>[2],
  ) {
    setMemo((current) => {
      const target = current.periods.find(
        (period) => period.period === periodNumber,
      );
      return {
        ...current,
        periods: updateBoardPeriod(current.periods, periodNumber, {
          notes: updateBoardNote(target?.notes ?? [], noteIndex, patch),
        }),
      };
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleaned: BoardMemo = {
      ...memo,
      className: memo.className.trim() || defaultClassName,
      periods: memo.periods.map((period) => ({
        ...period,
        subjectName:
          period.subjectName.trim() ||
          data.subjects.find((subject) => subject.id === period.subjectId)?.name ||
          "",
        notes: period.notes
          .map((note) => ({ ...note, text: note.text.trim() }))
          .filter((note) => note.text),
      })),
    };
    upsertBoardMemo(cleaned);
    resetMemo();
  }

  return (
    <>
      <PageHeader
        title="黒板メモ"
        description="帰りのHR後に、明日の時間割・小テスト・予習・宿題・持ち物を黒板から写します。"
      />

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <Card title={memo.id ? "黒板メモを編集" : "黒板メモを入力"}>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-xs font-medium text-slate-300">
                日付
                <input
                  className={inputClass}
                  type="date"
                  value={memo.date}
                  onChange={(event) =>
                    setMemo((current) => ({
                      ...current,
                      date: event.target.value,
                    }))
                  }
                  required
                />
              </label>
              <label className="grid gap-1 text-xs font-medium text-slate-300">
                クラス
                <input
                  className={inputClass}
                  value={memo.className}
                  onChange={(event) =>
                    setMemo((current) => ({
                      ...current,
                      className: event.target.value,
                    }))
                  }
                  placeholder="1年4組"
                />
              </label>
            </div>
          </Card>

          <Card title="黒板写真">
            <div className="rounded-lg border border-dashed border-white/15 bg-[#0d141c] p-4">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-md bg-white/10 text-slate-300">
                  <Camera size={18} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">
                    画像読み取りは今後対応予定
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Phase 3では手入力で保存します。将来、黒板写真からOCR結果をこのメモ構造へ流し込みます。
                  </p>
                </div>
              </div>
              <input
                className="mt-3 w-full rounded-md border border-white/10 bg-[#0b1118] px-3 py-2 text-sm text-slate-400"
                type="file"
                accept="image/*"
                disabled
              />
            </div>
          </Card>

          <div className="grid gap-3">
            {memo.periods.map((period) => (
              <Card key={period.period} title={`${period.period}限`}>
                <div className="grid gap-3">
                  <div className="grid gap-3 sm:grid-cols-[0.7fr_1fr]">
                    <label className="grid gap-1 text-xs font-medium text-slate-300">
                      教科
                      <select
                        className={selectClass}
                        value={period.subjectId}
                        onChange={(event) =>
                          handleSubjectChange(period.period, event.target.value)
                        }
                      >
                        {data.subjects.map((subject) => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-1 text-xs font-medium text-slate-300">
                      黒板の教科名
                      <input
                        className={inputClass}
                        value={period.subjectName}
                        onChange={(event) =>
                          setMemo((current) => ({
                            ...current,
                            periods: updateBoardPeriod(
                              current.periods,
                              period.period,
                              { subjectName: event.target.value },
                            ),
                          }))
                        }
                        placeholder="コミュⅠ"
                      />
                    </label>
                  </div>

                  {period.notes.length ? (
                    <div className="grid gap-2">
                      {period.notes.map((note, noteIndex) => (
                        <div
                          key={`${period.period}-${noteIndex}`}
                          className="grid gap-2 rounded-md border border-white/10 bg-[#0d141c] p-2 sm:grid-cols-[140px_1fr_auto]"
                        >
                          <select
                            className={selectClass}
                            value={note.type}
                            onChange={(event) =>
                              updateNote(period.period, noteIndex, {
                                type: event.target.value as BoardNoteType,
                              })
                            }
                            aria-label={`${period.period}限 メモ種別`}
                          >
                            {(
                              [
                                "quiz",
                                "prep",
                                "homework",
                                "item",
                                "notice",
                              ] as BoardNoteType[]
                            ).map((type) => (
                              <option key={type} value={type}>
                                {boardNoteTypeLabels[type]}
                              </option>
                            ))}
                          </select>
                          <input
                            className={inputClass}
                            value={note.text}
                            onChange={(event) =>
                              updateNote(period.period, noteIndex, {
                                text: event.target.value,
                              })
                            }
                            placeholder="小テスト 5/6で合格"
                          />
                          <button
                            className={iconButtonClass}
                            type="button"
                            onClick={() => removeNote(period.period, noteIndex)}
                            title="メモを削除"
                            aria-label="メモを削除"
                          >
                            <Trash2 size={16} aria-hidden="true" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState text="この時限のメモはありません。" />
                  )}

                  <button
                    className={secondaryButtonClass}
                    type="button"
                    onClick={() => addNote(period.period)}
                  >
                    <Plus size={16} aria-hidden="true" />
                    メモ追加
                  </button>
                </div>
              </Card>
            ))}
          </div>

          <div className="sticky bottom-20 z-10 flex gap-2 rounded-lg border border-white/10 bg-[#0b0f14]/95 p-2 backdrop-blur md:bottom-4">
            <button className={primaryButtonClass} type="submit">
              <Save size={16} aria-hidden="true" />
              保存
            </button>
            <button className={secondaryButtonClass} type="button" onClick={resetMemo}>
              新規入力
            </button>
          </div>
        </form>

        <Card title="保存済みメモ">
          {sortedMemos.length ? (
            <div className="grid gap-2">
              {sortedMemos.map((item) => (
                <article
                  key={item.id}
                  className="rounded-lg border border-white/10 bg-[#0d141c] p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      className="min-w-0 text-left"
                      onClick={() => setMemo(item)}
                    >
                      <p className="text-xs font-medium text-cyan-200">
                        {item.date}
                      </p>
                      <h2 className="mt-1 text-sm font-semibold text-white">
                        {item.className}
                      </h2>
                      <p className="mt-1 text-xs text-slate-400">
                        メモあり:{" "}
                        {item.periods.reduce(
                          (total, period) => total + period.notes.length,
                          0,
                        )}
                        件
                      </p>
                    </button>
                    <button
                      className={iconButtonClass}
                      type="button"
                      onClick={() => removeBoardMemo(item.id)}
                      title="削除"
                      aria-label="削除"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState text="保存済みの黒板メモはありません。" />
          )}
        </Card>
      </div>
    </>
  );
}
