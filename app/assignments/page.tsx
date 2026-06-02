"use client";

import { FormEvent, useMemo, useState } from "react";
import { Save, X } from "lucide-react";
import { AssignmentCard } from "@/components/school-cards";
import {
  Card,
  EmptyState,
  PageHeader,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
  selectClass,
} from "@/components/ui";
import { assignmentStatusLabels, priorityLabels } from "@/lib/labels";
import { daysBetween, toDateInputValue } from "@/lib/date";
import { useSchoolData } from "@/lib/school-data";
import { Assignment, AssignmentStatus, Priority } from "@/lib/types";

type AssignmentForm = Omit<Assignment, "id">;

const initialForm: AssignmentForm = {
  subjectId: "japanese",
  title: "",
  description: "",
  dueDate: toDateInputValue(new Date()),
  status: "todo",
  priority: "middle",
  memo: "",
};

export default function AssignmentsPage() {
  const {
    data,
    subjectById,
    addAssignment,
    updateAssignment,
    removeAssignment,
  } = useSchoolData();
  const [form, setForm] = useState<AssignmentForm>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [onlyActive, setOnlyActive] = useState(true);

  const sortedAssignments = useMemo(() => {
    return [...data.assignments]
      .filter((assignment) =>
        onlyActive
          ? !["done", "submitted"].includes(assignment.status)
          : true,
      )
      .sort(
        (a, b) =>
          daysBetween(a.dueDate) - daysBetween(b.dueDate) ||
          (b.priority === "high" ? 1 : 0) - (a.priority === "high" ? 1 : 0),
      );
  }, [data.assignments, onlyActive]);

  function resetForm() {
    setEditingId(null);
    setForm({
      ...initialForm,
      subjectId: data.subjects[0]?.id ?? "japanese",
      dueDate: toDateInputValue(new Date()),
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim()) {
      return;
    }

    const payload = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      memo: form.memo.trim(),
    };

    if (editingId) {
      updateAssignment(editingId, payload);
    } else {
      addAssignment(payload);
    }
    resetForm();
  }

  function beginEdit(assignment: Assignment) {
    setEditingId(assignment.id);
    setForm({
      subjectId: assignment.subjectId,
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate,
      status: assignment.status,
      priority: assignment.priority,
      memo: assignment.memo,
    });
  }

  return (
    <>
      <PageHeader
        title="提出物管理"
        description="未提出を締切順で確認し、完了・提出済みに切り替えます。"
      />

      <div className="grid gap-4 lg:grid-cols-[0.82fr_1.18fr]">
        <Card title={editingId ? "提出物を編集" : "提出物を追加"}>
          <form className="grid gap-3" onSubmit={handleSubmit}>
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

            <label className="grid gap-1 text-xs font-medium text-slate-300">
              内容
              <input
                className={inputClass}
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="数学ワーク p.32-35"
                required
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1 text-xs font-medium text-slate-300">
                締切
                <input
                  className={inputClass}
                  type="date"
                  value={form.dueDate}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      dueDate: event.target.value,
                    }))
                  }
                  required
                />
              </label>
              <label className="grid gap-1 text-xs font-medium text-slate-300">
                優先度
                <select
                  className={selectClass}
                  value={form.priority}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      priority: event.target.value as Priority,
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
              状態
              <select
                className={selectClass}
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value as AssignmentStatus,
                  }))
                }
              >
                {(["todo", "doing", "done", "submitted"] as AssignmentStatus[]).map(
                  (status) => (
                    <option key={status} value={status}>
                      {assignmentStatusLabels[status]}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className="grid gap-1 text-xs font-medium text-slate-300">
              詳細
              <input
                className={inputClass}
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="提出形式や範囲"
              />
            </label>

            <label className="grid gap-1 text-xs font-medium text-slate-300">
              メモ
              <textarea
                className={`${inputClass} min-h-20 resize-none`}
                value={form.memo}
                onChange={(event) =>
                  setForm((current) => ({ ...current, memo: event.target.value }))
                }
                placeholder="先生からの注意など"
              />
            </label>

            <div className="flex gap-2">
              <button className={primaryButtonClass} type="submit">
                <Save size={16} aria-hidden="true" />
                {editingId ? "更新" : "保存"}
              </button>
              {editingId && (
                <button
                  className={secondaryButtonClass}
                  type="button"
                  onClick={resetForm}
                >
                  <X size={16} aria-hidden="true" />
                  取消
                </button>
              )}
            </div>
          </form>
        </Card>

        <Card
          title="提出物一覧"
          action={
            <label className="flex items-center gap-2 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={onlyActive}
                onChange={(event) => setOnlyActive(event.target.checked)}
                className="size-4 accent-cyan-400"
              />
              未完了のみ
            </label>
          }
        >
          {sortedAssignments.length ? (
            <div className="grid gap-2">
              {sortedAssignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  subject={subjectById.get(assignment.subjectId)}
                  onToggle={() =>
                    updateAssignment(assignment.id, {
                      status:
                        assignment.status === "done" ||
                        assignment.status === "submitted"
                          ? "todo"
                          : "done",
                    })
                  }
                  onEdit={() => beginEdit(assignment)}
                  onDelete={() => removeAssignment(assignment.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState text="表示する提出物はありません。" />
          )}
        </Card>
      </div>
    </>
  );
}
