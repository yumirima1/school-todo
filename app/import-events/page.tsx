"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import {
  ExternalLink,
  FileDown,
  Pencil,
  Save,
  Trash2,
} from "lucide-react";
import {
  Card,
  EmptyState,
  PageHeader,
  iconButtonClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/ui";
import { chikuzenHomeUrl, chikuzenNewsUrl } from "@/lib/event-importer";
import {
  eventSourceStatusLabels,
  eventSourceTypeLabels,
} from "@/lib/labels";
import { useSchoolData } from "@/lib/school-data";
import { EventSource, EventSourceType } from "@/lib/types";

type ImportForm = {
  monthlyUrl: string;
  yearlyUrl: string;
  memo: string;
};

const emptyForm: ImportForm = {
  monthlyUrl: "",
  yearlyUrl: "",
  memo: "",
};

function createSource(
  url: string,
  sourceType: EventSourceType,
  memo: string,
  id = "",
): EventSource {
  return {
    id,
    title:
      sourceType === "monthly"
        ? "月間行事予定PDF"
        : sourceType === "yearly"
          ? "年間行事予定PDF"
          : "手動行事予定メモ",
    url,
    sourceType,
    fetchedAt: new Date().toISOString(),
    status: "pending",
    memo,
  };
}

export default function ImportEventsPage() {
  const { data, upsertEventSource, removeEventSource } = useSchoolData();
  const [form, setForm] = useState<ImportForm>(emptyForm);
  const [editingSource, setEditingSource] = useState<EventSource | null>(null);

  const sortedSources = useMemo(() => {
    return [...data.eventSources].sort((a, b) =>
      b.fetchedAt.localeCompare(a.fetchedAt),
    );
  }, [data.eventSources]);

  function resetForm() {
    setForm(emptyForm);
    setEditingSource(null);
  }

  function handleEdit(source: EventSource) {
    setEditingSource(source);
    setForm({
      monthlyUrl: source.sourceType === "monthly" ? source.url : "",
      yearlyUrl: source.sourceType === "yearly" ? source.url : "",
      memo: source.memo,
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const monthlyUrl = form.monthlyUrl.trim();
    const yearlyUrl = form.yearlyUrl.trim();
    const memo = form.memo.trim();

    if (editingSource) {
      const url =
        editingSource.sourceType === "monthly" ? monthlyUrl : yearlyUrl;
      if (!url) {
        return;
      }
      upsertEventSource(
        createSource(url, editingSource.sourceType, memo, editingSource.id),
      );
      resetForm();
      return;
    }

    if (monthlyUrl) {
      upsertEventSource(createSource(monthlyUrl, "monthly", memo));
    }
    if (yearlyUrl) {
      upsertEventSource(createSource(yearlyUrl, "yearly", memo));
    }
    resetForm();
  }

  return (
    <>
      <PageHeader
        title="行事予定取り込み"
        description="筑前高校のお知らせから月間・年間行事予定PDFを探し、URLを保存します。"
      />

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-4 content-start">
          <Card title="学校HPから探す">
            <div className="grid gap-2">
              <Link
                className={secondaryButtonClass}
                href={chikuzenHomeUrl}
                target="_blank"
                rel="noreferrer"
              >
                筑前高校公式サイト
                <ExternalLink size={15} aria-hidden="true" />
              </Link>
              <Link
                className={secondaryButtonClass}
                href={chikuzenNewsUrl}
                target="_blank"
                rel="noreferrer"
              >
                お知らせ一覧
                <ExternalLink size={15} aria-hidden="true" />
              </Link>
            </div>
            <p className="mt-3 rounded-md border border-amber-300/25 bg-amber-400/10 px-3 py-2 text-xs leading-5 text-amber-100">
              Phase 4ではPDF解析は今後対応予定です。学校HPから記事を開き、「PDFはこちら」のURLを貼り付けて保存します。
            </p>
          </Card>

          <Card title={editingSource ? "PDF URLを編集" : "PDF URLを保存"}>
            <form className="grid gap-3" onSubmit={handleSubmit}>
              <label className="grid gap-1 text-xs font-medium text-slate-300">
                月間行事予定PDFのURLを貼り付け
                <input
                  className={inputClass}
                  type="url"
                  value={form.monthlyUrl}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      monthlyUrl: event.target.value,
                    }))
                  }
                  placeholder="https://chikuzen.fku.ed.jp/...pdf"
                  disabled={editingSource?.sourceType === "yearly"}
                />
              </label>

              <label className="grid gap-1 text-xs font-medium text-slate-300">
                年間行事予定PDFのURLを貼り付け
                <input
                  className={inputClass}
                  type="url"
                  value={form.yearlyUrl}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      yearlyUrl: event.target.value,
                    }))
                  }
                  placeholder="https://chikuzen.fku.ed.jp/...pdf"
                  disabled={editingSource?.sourceType === "monthly"}
                />
              </label>

              <label className="grid gap-1 text-xs font-medium text-slate-300">
                メモ
                <textarea
                  className={`${inputClass} min-h-20 resize-none`}
                  value={form.memo}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      memo: event.target.value,
                    }))
                  }
                  placeholder="6月行事予定、年間行事予定など"
                />
              </label>

              <div className="flex flex-wrap gap-2">
                <button className={primaryButtonClass} type="submit">
                  <Save size={16} aria-hidden="true" />
                  {editingSource ? "更新" : "取り込み"}
                </button>
                {editingSource && (
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
        </div>

        <Card title="保存済みPDF URL">
          {sortedSources.length ? (
            <div className="grid gap-2">
              {sortedSources.map((source) => (
                <article
                  key={source.id}
                  className="rounded-lg border border-white/10 bg-[#0d141c] p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap gap-2">
                        <span className="rounded-md border border-cyan-300/25 bg-cyan-400/10 px-2 py-1 text-xs font-medium text-cyan-100">
                          {eventSourceTypeLabels[source.sourceType]}
                        </span>
                        <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300">
                          {eventSourceStatusLabels[source.status]}
                        </span>
                      </div>
                      <h2 className="break-words text-sm font-semibold text-white">
                        {source.title}
                      </h2>
                      <Link
                        className="mt-2 inline-flex max-w-full items-center gap-1 break-all text-xs text-cyan-200 underline-offset-4 hover:underline"
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {source.url}
                        <ExternalLink size={13} aria-hidden="true" />
                      </Link>
                      {source.memo && (
                        <p className="mt-2 break-words rounded-md bg-black/20 px-2 py-1.5 text-xs text-slate-300">
                          {source.memo}
                        </p>
                      )}
                      <p className="mt-2 text-[11px] text-slate-500">
                        保存日時: {new Date(source.fetchedAt).toLocaleString("ja-JP")}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2">
                      <button
                        className={iconButtonClass}
                        type="button"
                        onClick={() => handleEdit(source)}
                        title="編集"
                        aria-label="編集"
                      >
                        <Pencil size={16} aria-hidden="true" />
                      </button>
                      <button
                        className={iconButtonClass}
                        type="button"
                        onClick={() => removeEventSource(source.id)}
                        title="削除"
                        aria-label="削除"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState text="保存済みのPDF URLはありません。" />
          )}
        </Card>
      </div>

      <Card title="将来の自動取り込み" className="mt-4">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-md bg-white/10 text-slate-300">
            <FileDown size={18} aria-hidden="true" />
          </span>
          <p className="text-sm leading-6 text-slate-300">
            クライアント側から学校HPを直接取得するとCORSで失敗する可能性があります。将来はNext.js API Routeでサーバー側fetchし、PDFテキスト抽出やOCR結果をSchoolEventへ変換します。
          </p>
        </div>
      </Card>
    </>
  );
}
