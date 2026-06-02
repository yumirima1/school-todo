"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  AlertTriangle,
  Camera,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
  WandSparkles,
} from "lucide-react";
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
  boardOcrTextToResult,
  boardOcrResultToMemo,
  updateBoardNote,
  updateBoardPeriod,
} from "@/lib/board";
import { toDateInputValue } from "@/lib/date";
import { boardNoteTypeLabels } from "@/lib/labels";
import { useSchoolData } from "@/lib/school-data";
import { BoardMemo, BoardNoteType, BoardOcrResult } from "@/lib/types";

type OcrStatus = "idle" | "loading" | "success" | "error";

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
  const [boardImageFile, setBoardImageFile] = useState<File | null>(null);
  const [boardImagePreview, setBoardImagePreview] = useState("");
  const [ocrResult, setOcrResult] = useState<BoardOcrResult | null>(null);
  const [ocrStatus, setOcrStatus] = useState<OcrStatus>("idle");
  const [ocrError, setOcrError] = useState("");
  const [ocrText, setOcrText] = useState("");
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrSource, setOcrSource] = useState("");

  const sortedMemos = useMemo(() => {
    return [...data.boardMemos].sort((a, b) => b.date.localeCompare(a.date));
  }, [data.boardMemos]);

  function resetMemo() {
    setMemo(createEmptyBoardMemo(getTomorrowValue(), defaultClassName, data.subjects));
    setOcrResult(null);
    setOcrStatus("idle");
    setOcrError("");
    setOcrText("");
    setOcrProgress(0);
    setOcrSource("");
  }

  function handleImageChange(file: File | null) {
    setBoardImageFile(file);
    setBoardImagePreview("");
    setOcrResult(null);
    setOcrStatus("idle");
    setOcrError("");
    setOcrText("");
    setOcrProgress(0);
    setOcrSource("");

    if (!file || ["image/heic", "image/heif"].includes(file.type)) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setBoardImagePreview(typeof reader.result === "string" ? reader.result : "");
    };
    reader.readAsDataURL(file);
  }

  function applyOcrResult(
    result: BoardOcrResult,
    source: string,
    extractedText = "",
  ) {
    setOcrResult(result);
    setOcrSource(source);
    if (extractedText) {
      setOcrText(extractedText);
    }
    setMemo((current) =>
      boardOcrResultToMemo(result, current, data.subjects),
    );
    setOcrStatus("success");
    setOcrProgress(100);
  }

  async function runFreeOcr() {
    if (!boardImageFile) {
      return;
    }

    setOcrSource("Tesseract.js 無料OCR");
    setOcrProgress(0);

    const { createWorker } = await import("tesseract.js");
    const worker = await createWorker("jpn+eng", undefined, {
      logger: (message) => {
        if (message.status === "recognizing text") {
          setOcrProgress(Math.round(message.progress * 100));
        }
      },
    });

    try {
      const {
        data: { text },
      } = await worker.recognize(boardImageFile);
      const extractedText = text.trim();

      if (!extractedText) {
        throw new Error("無料OCRで文字を抽出できませんでした。");
      }

      applyOcrResult(
        boardOcrTextToResult(extractedText, data.subjects),
        "Tesseract.js 無料OCR",
        extractedText,
      );
    } finally {
      await worker.terminate();
    }
  }

  async function analyzeBoardImage() {
    if (!boardImageFile) {
      return;
    }

    setOcrStatus("loading");
    setOcrError("");
    setOcrText("");
    setOcrProgress(0);
    setOcrSource("OpenAI Vision確認中");

    const formData = new FormData();
    formData.append("image", boardImageFile);

    try {
      const response = await fetch("/api/board-ocr", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as {
        result?: BoardOcrResult;
        error?: string;
      };

      if (!response.ok || !payload.result) {
        throw new Error(payload.error ?? "黒板解析に失敗しました。");
      }

      applyOcrResult(payload.result, "OpenAI Vision");
    } catch {
      try {
        await runFreeOcr();
      } catch (error) {
        setOcrStatus("error");
        setOcrSource("");
        setOcrError(
          error instanceof Error
            ? error.message
            : "無料OCRに失敗しました。手入力へ切り替えてください。",
        );
      }
    }
  }

  function reflectOcrTextToMemo() {
    if (!ocrText.trim()) {
      setOcrStatus("error");
      setOcrError("反映するOCRテキストがありません。");
      return;
    }

    applyOcrResult(
      boardOcrTextToResult(ocrText, data.subjects),
      "編集済みOCRテキスト",
      ocrText,
    );
  }

  function switchToManualInput() {
    setOcrStatus("idle");
    setOcrError("");
    setOcrSource("");
    document.getElementById("manual-board-periods")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
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
            <div className="grid gap-3 rounded-lg border border-dashed border-white/15 bg-[#0d141c] p-4">
              <div className="flex items-start gap-3">
                <span className="grid size-10 place-items-center rounded-md bg-white/10 text-slate-300">
                  <Camera size={18} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">
                    黒板写真から自動入力
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    OpenAI Visionが設定済みなら構造化解析を使い、未設定時はTesseract.jsの無料OCRへ自動で切り替えます。
                  </p>
                </div>
              </div>

              <label className="grid gap-2 text-xs font-medium text-slate-300">
                黒板写真
                <span className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-md border border-white/10 bg-[#0b1118] px-3 py-3 text-sm text-slate-200 transition hover:border-cyan-300/50">
                  <Upload size={16} aria-hidden="true" />
                  {boardImageFile ? boardImageFile.name : "画像を選択"}
                </span>
                <input
                  className="sr-only"
                  type="file"
                  accept=".jpg,.jpeg,.png,.heic,image/jpeg,image/png,image/heic,image/heif"
                  onChange={(event) =>
                    handleImageChange(event.target.files?.[0] ?? null)
                  }
                />
              </label>

              {boardImageFile ? (
                <div className="grid gap-3 rounded-md border border-white/10 bg-[#0b1118] p-2">
                  {boardImagePreview &&
                  !["image/heic", "image/heif"].includes(boardImageFile.type) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="max-h-72 w-full rounded-md object-contain"
                      src={boardImagePreview}
                      alt="選択した黒板写真のプレビュー"
                    />
                  ) : (
                    <div className="grid min-h-32 place-items-center rounded-md border border-white/10 bg-white/[0.03] px-3 text-center text-xs leading-5 text-slate-400">
                      HEIC画像は端末やブラウザによってプレビューや無料OCRが失敗する場合があります。失敗時はjpg / pngで再撮影してください。
                    </div>
                  )}
                  <button
                    className={primaryButtonClass}
                    type="button"
                    onClick={analyzeBoardImage}
                    disabled={ocrStatus === "loading"}
                  >
                    {ocrStatus === "loading" ? (
                      <Loader2 className="animate-spin" size={16} aria-hidden="true" />
                    ) : (
                      <WandSparkles size={16} aria-hidden="true" />
                    )}
                    {ocrStatus === "loading" ? "解析中" : "黒板を解析"}
                  </button>
                  {ocrStatus === "loading" ? (
                    <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
                      <div className="flex items-center justify-between gap-3 text-xs text-slate-300">
                        <span>{ocrSource || "OCR解析中"}</span>
                        <span>{ocrProgress ? `${ocrProgress}%` : "準備中"}</span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-cyan-300 transition-all"
                          style={{ width: `${Math.max(8, ocrProgress)}%` }}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {ocrStatus === "error" ? (
                <div className="rounded-md border border-amber-300/30 bg-amber-400/10 p-3">
                  <div className="flex items-start gap-2 text-sm font-semibold text-amber-100">
                    <AlertTriangle size={16} aria-hidden="true" />
                    {ocrError || "解析に失敗しました。"}
                  </div>
                  <button
                    className={`${secondaryButtonClass} mt-3 w-full`}
                    type="button"
                    onClick={switchToManualInput}
                  >
                    手入力へ切り替え
                  </button>
                </div>
              ) : null}

              {ocrResult ? (
                <div className="rounded-md border border-cyan-300/20 bg-cyan-400/10 p-3">
                  <p className="text-xs font-semibold text-cyan-100">
                    {ocrSource}の結果を入力欄に反映しました。保存前に修正できます。
                  </p>
                  <div className="mt-3 grid gap-2">
                    {ocrResult.periods.map((period) => (
                      <div
                        key={`${period.period}-${period.subject}`}
                        className="rounded-md border border-white/10 bg-[#0b1118] p-2"
                      >
                        <p className="text-sm font-semibold text-white">
                          {period.period}限 {period.subject}
                        </p>
                        {period.notes.length ? (
                          <ul className="mt-2 grid gap-1 text-xs text-slate-300">
                            {period.notes.map((note, noteIndex) => (
                              <li
                                key={`${period.period}-${note.type}-${noteIndex}`}
                                className="flex gap-2"
                              >
                                <span className="shrink-0 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[11px] text-cyan-100">
                                  {boardNoteTypeLabels[note.type]}
                                </span>
                                <span>{note.text}</span>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {ocrText ? (
                <div className="grid gap-2 rounded-md border border-white/10 bg-[#0b1118] p-3">
                  <label className="grid gap-1 text-xs font-medium text-slate-300">
                    抽出した文字
                    <textarea
                      className={`${inputClass} min-h-32 resize-y leading-6`}
                      value={ocrText}
                      onChange={(event) => setOcrText(event.target.value)}
                      placeholder="OCRで読み取った文字がここに入ります。"
                    />
                  </label>
                  <button
                    className={secondaryButtonClass}
                    type="button"
                    onClick={reflectOcrTextToMemo}
                  >
                    <WandSparkles size={16} aria-hidden="true" />
                    テキストをメモへ反映
                  </button>
                </div>
              ) : null}
            </div>
          </Card>

          <div id="manual-board-periods" className="grid scroll-mt-4 gap-3">
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
