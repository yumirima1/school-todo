import { NextResponse } from "next/server";
import { BoardNoteType, BoardOcrResult } from "@/lib/types";

export const runtime = "nodejs";

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
]);

const noteTypeAliases: Record<string, BoardNoteType> = {
  quiz: "quiz",
  "小テスト": "quiz",
  テスト: "quiz",
  prep: "prep",
  予習: "prep",
  homework: "homework",
  宿題: "homework",
  item: "item",
  持ち物: "item",
  notice: "notice",
  連絡: "notice",
};

type OpenAiChatCompletion = {
  choices?: {
    message?: {
      content?: string | null;
    };
  }[];
  error?: {
    message?: string;
  };
};

function normalizeNoteType(value: unknown): BoardNoteType {
  if (typeof value !== "string") {
    return "notice";
  }
  return noteTypeAliases[value.trim()] ?? "notice";
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }
  return undefined;
}

function sanitizeOcrResult(value: unknown): BoardOcrResult {
  const root = asRecord(value);
  const rawPeriods = Array.isArray(root?.periods) ? root.periods : [];

  return {
    periods: rawPeriods
      .map((rawPeriod) => {
        const periodRecord = asRecord(rawPeriod);
        const periodNumber = Number(periodRecord?.period);
        const rawNotes = Array.isArray(periodRecord?.notes)
          ? periodRecord.notes
          : [];

        return {
          period: periodNumber,
          subject:
            typeof periodRecord?.subject === "string"
              ? periodRecord.subject.trim()
              : "",
          notes: rawNotes
            .map((rawNote) => {
              const noteRecord = asRecord(rawNote);
              return {
                type: normalizeNoteType(noteRecord?.type),
                text:
                  typeof noteRecord?.text === "string"
                    ? noteRecord.text.trim()
                    : "",
              };
            })
            .filter((note) => note.text),
        };
      })
      .filter(
        (period) =>
          Number.isInteger(period.period) &&
          period.period >= 1 &&
          period.period <= 7 &&
          period.subject,
      )
      .slice(0, 7),
  };
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI解析未設定" }, { status: 503 });
  }

  const formData = await request.formData();
  const image = formData.get("image");
  if (!(image instanceof File)) {
    return NextResponse.json(
      { error: "黒板写真を選択してください。" },
      { status: 400 },
    );
  }

  const mimeType = image.type || "image/jpeg";
  if (!allowedMimeTypes.has(mimeType)) {
    return NextResponse.json(
      { error: "jpg / jpeg / png / heic の画像を選択してください。" },
      { status: 400 },
    );
  }

  const bytes = Buffer.from(await image.arrayBuffer());
  const dataUrl = `data:${mimeType};base64,${bytes.toString("base64")}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You extract Japanese high-school blackboard notes into strict JSON. Return only JSON with periods. Do not add commentary.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                "黒板写真から翌日の時間割と注意事項を読み取ってください。出力は必ず {\"periods\":[{\"period\":1,\"subject\":\"教科名\",\"notes\":[{\"type\":\"quiz|prep|homework|item|notice\",\"text\":\"内容\"}]}]} のJSONだけにしてください。typeは小テスト=quiz、予習=prep、宿題=homework、持ち物=item、連絡=noticeです。読めない時限は省略してください。",
            },
            {
              type: "image_url",
              image_url: {
                url: dataUrl,
              },
            },
          ],
        },
      ],
    }),
  });

  const payload = (await response.json()) as OpenAiChatCompletion;
  if (!response.ok) {
    return NextResponse.json(
      { error: payload.error?.message ?? "黒板解析に失敗しました。" },
      { status: 502 },
    );
  }

  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    return NextResponse.json(
      { error: "解析結果が空でした。手入力へ切り替えてください。" },
      { status: 502 },
    );
  }

  try {
    const parsed = JSON.parse(content) as unknown;
    return NextResponse.json({ result: sanitizeOcrResult(parsed) });
  } catch {
    return NextResponse.json(
      { error: "解析結果を読み取れませんでした。手入力へ切り替えてください。" },
      { status: 502 },
    );
  }
}
