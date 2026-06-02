"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  Card,
  EmptyState,
  PageHeader,
  iconButtonClass,
  inputClass,
  primaryButtonClass,
  selectClass,
} from "@/components/ui";
import { recurringTaskCategoryLabels } from "@/lib/labels";
import {
  createRecurringTask,
  getRecurringTasks,
  getTaskListKey,
} from "@/lib/recurring";
import { useSchoolData } from "@/lib/school-data";
import { RecurringTask, RecurringTaskCategory, Subject } from "@/lib/types";

type Draft = {
  title: string;
  description: string;
  category: RecurringTaskCategory;
};

const emptyDraft: Draft = {
  title: "",
  description: "",
  category: "assignment",
};

function getTasksByCategory(subject: Subject, category: RecurringTaskCategory) {
  if (category === "assignment") {
    return subject.recurringAssignments;
  }
  if (category === "quiz") {
    return subject.recurringQuizzes;
  }
  return subject.recurringPreparations;
}

export default function SubjectsPage() {
  const { data, updateSubject } = useSchoolData();
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});

  function getDraft(subjectId: string) {
    return drafts[subjectId] ?? emptyDraft;
  }

  function updateDraft(subjectId: string, patch: Partial<Draft>) {
    setDrafts((current) => ({
      ...current,
      [subjectId]: { ...getDraft(subjectId), ...patch },
    }));
  }

  function addTask(subject: Subject) {
    const draft = getDraft(subject.id);
    const title = draft.title.trim();
    if (!title) {
      return;
    }

    const key = getTaskListKey(draft.category);
    updateSubject(subject.id, {
      [key]: [
        ...subject[key],
        createRecurringTask(
          draft.category,
          title,
          draft.description.trim(),
        ),
      ],
    });
    setDrafts((current) => ({
      ...current,
      [subject.id]: emptyDraft,
    }));
  }

  function updateTask(
    subject: Subject,
    task: RecurringTask,
    patch: Partial<RecurringTask>,
  ) {
    const key = getTaskListKey(task.category);
    updateSubject(subject.id, {
      [key]: subject[key].map((item) =>
        item.id === task.id ? { ...item, ...patch } : item,
      ),
    });
  }

  function removeTask(subject: Subject, task: RecurringTask) {
    const key = getTaskListKey(task.category);
    updateSubject(subject.id, {
      [key]: subject[key].filter((item) => item.id !== task.id),
    });
  }

  return (
    <>
      <PageHeader
        title="教科別まとめ"
        description="筑前高校1年4組の固定提出物・固定小テスト・固定予習を教科ごとに管理します。"
      />

      <div className="grid gap-4 xl:grid-cols-2">
        {data.subjects.map((subject) => {
          const draft = getDraft(subject.id);
          const allTasks = getRecurringTasks(subject);

          return (
            <Card key={subject.id} title={subject.name}>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span
                  className="size-3 rounded-full"
                  style={{ backgroundColor: subject.color }}
                />
                <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300">
                  {subject.shortName}
                </span>
              </div>

              <div className="grid gap-3">
                {(
                  ["assignment", "quiz", "preparation"] as RecurringTaskCategory[]
                ).map((category) => {
                  const tasks = getTasksByCategory(subject, category);
                  return (
                    <section key={category} className="grid gap-2">
                      <h2 className="text-xs font-semibold text-cyan-100">
                        {recurringTaskCategoryLabels[category]}
                      </h2>
                      {tasks.length ? (
                        <div className="grid gap-2">
                          {tasks.map((task) => (
                            <article
                              key={task.id}
                              className="rounded-md border border-white/10 bg-[#0d141c] p-2"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <label className="flex min-w-0 items-start gap-2">
                                  <input
                                    type="checkbox"
                                    checked={task.active}
                                    onChange={(event) =>
                                      updateTask(subject, task, {
                                        active: event.target.checked,
                                      })
                                    }
                                    className="mt-1 size-4 shrink-0 accent-cyan-400"
                                  />
                                  <span>
                                    <span
                                      className={`block break-words text-sm font-medium ${
                                        task.active
                                          ? "text-white"
                                          : "text-slate-500 line-through"
                                      }`}
                                    >
                                      {task.title}
                                    </span>
                                    {task.description && (
                                      <span className="mt-1 block break-words text-xs leading-5 text-slate-400">
                                        {task.description}
                                      </span>
                                    )}
                                  </span>
                                </label>
                                <button
                                  className={iconButtonClass}
                                  type="button"
                                  onClick={() => removeTask(subject, task)}
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
                        <EmptyState text="登録なし" />
                      )}
                    </section>
                  );
                })}

                <div className="rounded-lg border border-white/10 bg-[#0d141c] p-3">
                  <div className="grid gap-2">
                    <select
                      className={selectClass}
                      value={draft.category}
                      onChange={(event) =>
                        updateDraft(subject.id, {
                          category: event.target.value as RecurringTaskCategory,
                        })
                      }
                      aria-label={`${subject.name} 固定タスク種別`}
                    >
                      {(
                        [
                          "assignment",
                          "quiz",
                          "preparation",
                        ] as RecurringTaskCategory[]
                      ).map((category) => (
                        <option key={category} value={category}>
                          {recurringTaskCategoryLabels[category]}
                        </option>
                      ))}
                    </select>
                    <input
                      className={inputClass}
                      value={draft.title}
                      onChange={(event) =>
                        updateDraft(subject.id, { title: event.target.value })
                      }
                      placeholder="Seek Next 週末課題"
                    />
                    <textarea
                      className={`${inputClass} min-h-16 resize-none`}
                      value={draft.description}
                      onChange={(event) =>
                        updateDraft(subject.id, {
                          description: event.target.value,
                        })
                      }
                      placeholder="合格ライン70%、範囲、提出日ルールなど"
                    />
                    <button
                      className={primaryButtonClass}
                      type="button"
                      onClick={() => addTask(subject)}
                    >
                      <Plus size={16} aria-hidden="true" />
                      追加
                    </button>
                  </div>
                </div>

                {!allTasks.length && (
                  <p className="text-xs leading-5 text-slate-500">
                    固定タスクを登録するとホームの「固定で確認するもの」に表示されます。
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
