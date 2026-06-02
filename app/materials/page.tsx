"use client";

import { FormEvent, useMemo, useState } from "react";
import { ImagePlus, Pencil, Save, Trash2 } from "lucide-react";
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
import { resizeImageToDataUrl } from "@/lib/materials";
import { studyMaterialCategoryLabels } from "@/lib/labels";
import { useSchoolData } from "@/lib/school-data";
import { StudyMaterial, StudyMaterialCategory } from "@/lib/types";

type MaterialForm = Omit<StudyMaterial, "id">;

const initialForm: MaterialForm = {
  subjectId: "",
  title: "",
  shortTitle: "",
  category: "textbook",
  imageDataUrl: "",
  active: true,
};

export default function MaterialsPage() {
  const { data, subjectById, upsertMaterial, removeMaterial } = useSchoolData();
  const [form, setForm] = useState<MaterialForm>({
    ...initialForm,
    subjectId: data.subjects[0]?.id ?? "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageStatus, setImageStatus] = useState("");

  const sortedMaterials = useMemo(() => {
    return [...data.materials].sort(
      (a, b) =>
        a.subjectId.localeCompare(b.subjectId) ||
        a.category.localeCompare(b.category) ||
        a.title.localeCompare(b.title),
    );
  }, [data.materials]);

  function resetForm() {
    setEditingId(null);
    setImageStatus("");
    setForm({
      ...initialForm,
      subjectId: data.subjects[0]?.id ?? "",
    });
  }

  async function handleImage(file?: File) {
    if (!file) {
      return;
    }
    setImageStatus("画像を縮小しています...");
    try {
      const imageDataUrl = await resizeImageToDataUrl(file, 400);
      setForm((current) => ({ ...current, imageDataUrl }));
      setImageStatus("幅400px以内に縮小して保存準備しました。");
    } catch (error) {
      setImageStatus(error instanceof Error ? error.message : "画像処理に失敗しました。");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim() || !form.subjectId) {
      return;
    }
    const payload: StudyMaterial = {
      ...form,
      id: editingId ?? "",
      title: form.title.trim(),
      shortTitle: form.shortTitle.trim() || form.title.trim(),
    };
    upsertMaterial(payload);
    resetForm();
  }

  function beginEdit(material: StudyMaterial) {
    setEditingId(material.id);
    setImageStatus("");
    setForm({
      subjectId: material.subjectId,
      title: material.title,
      shortTitle: material.shortTitle,
      category: material.category,
      imageDataUrl: material.imageDataUrl,
      active: material.active,
    });
  }

  return (
    <>
      <PageHeader
        title="教材ライブラリ"
        description="教科書やワークの表紙画像を登録し、明日の持ち物を画像付きで確認します。"
      />

      <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <Card title={editingId ? "教材を編集" : "教材を追加"}>
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

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-xs font-medium text-slate-300">
                教材名
                <input
                  className={inputClass}
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Seek Next"
                  required
                />
              </label>
              <label className="grid gap-1 text-xs font-medium text-slate-300">
                短縮名
                <input
                  className={inputClass}
                  value={form.shortTitle}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      shortTitle: event.target.value,
                    }))
                  }
                  placeholder="Seek"
                />
              </label>
            </div>

            <label className="grid gap-1 text-xs font-medium text-slate-300">
              種類
              <select
                className={selectClass}
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    category: event.target.value as StudyMaterialCategory,
                  }))
                }
              >
                {(
                  [
                    "textbook",
                    "workbook",
                    "vocabulary",
                    "notebook",
                    "print",
                    "other",
                  ] as StudyMaterialCategory[]
                ).map((category) => (
                  <option key={category} value={category}>
                    {studyMaterialCategoryLabels[category]}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 text-xs font-medium text-slate-300">
              表紙画像
              <input
                className={inputClass}
                type="file"
                accept="image/*"
                onChange={(event) => handleImage(event.target.files?.[0])}
              />
            </label>
            {imageStatus && <p className="text-xs text-slate-400">{imageStatus}</p>}

            {form.imageDataUrl ? (
              <div className="rounded-lg border border-white/10 bg-[#0d141c] p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.imageDataUrl}
                  alt="教材画像プレビュー"
                  className="h-40 w-full rounded-md object-contain"
                />
              </div>
            ) : (
              <div className="grid place-items-center rounded-lg border border-dashed border-white/15 bg-[#0d141c] p-6 text-sm text-slate-500">
                <ImagePlus size={22} aria-hidden="true" />
                <span className="mt-2">画像なしでも保存できます。</span>
              </div>
            )}

            <label className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-[#0d141c] px-3 py-2 text-sm text-slate-200">
              使用中
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    active: event.target.checked,
                  }))
                }
                className="size-4 accent-cyan-400"
              />
            </label>

            <div className="flex flex-wrap gap-2">
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
                  取消
                </button>
              )}
            </div>
          </form>
        </Card>

        <Card title="登録済み教材">
          {sortedMaterials.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {sortedMaterials.map((material) => {
                const subject = subjectById.get(material.subjectId);
                return (
                  <article
                    key={material.id}
                    className="rounded-lg border border-white/10 bg-[#0d141c] p-3"
                  >
                    <div className="mb-3 aspect-[4/3] overflow-hidden rounded-md bg-black/25">
                      {material.imageDataUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={material.imageDataUrl}
                          alt={material.title}
                          className="size-full object-contain"
                        />
                      ) : (
                        <div className="grid size-full place-items-center text-xs text-slate-500">
                          画像なし
                        </div>
                      )}
                    </div>
                    <div className="mb-2 flex flex-wrap gap-2">
                      <span className="rounded-md border border-cyan-300/20 bg-cyan-400/10 px-2 py-1 text-xs text-cyan-100">
                        {subject?.shortName ?? subject?.name ?? "未設定"}
                      </span>
                      <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300">
                        {studyMaterialCategoryLabels[material.category]}
                      </span>
                      {!material.active && (
                        <span className="rounded-md border border-slate-500/30 px-2 py-1 text-xs text-slate-500">
                          非表示
                        </span>
                      )}
                    </div>
                    <h2 className="break-words text-sm font-semibold text-white">
                      {material.title}
                    </h2>
                    <p className="mt-1 text-xs text-slate-400">
                      {material.shortTitle}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        className={iconButtonClass}
                        type="button"
                        onClick={() => beginEdit(material)}
                        title="編集"
                        aria-label="編集"
                      >
                        <Pencil size={16} aria-hidden="true" />
                      </button>
                      <button
                        className={iconButtonClass}
                        type="button"
                        onClick={() => removeMaterial(material.id)}
                        title="削除"
                        aria-label="削除"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyState text="教材はまだ登録されていません。" />
          )}
        </Card>
      </div>
    </>
  );
}
