import {
  BoardMemo,
  BoardNote,
  BoardNoteType,
  BoardOcrResult,
  BoardPeriod,
  Subject,
  TimetableItem,
} from "@/lib/types";

export type BoardAttentionGroup = {
  key: string;
  period: number;
  subjectName: string;
  notes: BoardNote[];
};

export function createEmptyBoardMemo(
  date: string,
  className: string,
  subjects: Subject[],
): BoardMemo {
  return {
    id: "",
    date,
    className,
    periods: Array.from({ length: 7 }, (_, index) => {
      const subject = subjects[0];
      return {
        period: index + 1,
        subjectId: subject?.id ?? "",
        subjectName: subject?.name ?? "",
        notes: [],
      };
    }),
  };
}

export function boardMemoToTimetable(
  memo: BoardMemo,
  subjectById: Map<string, Subject>,
): TimetableItem[] {
  return memo.periods
    .filter((period) => period.subjectId || period.subjectName)
    .map((period) => {
      const subject = subjectById.get(period.subjectId);
      const itemNotes = period.notes
        .filter((note) => note.type === "item")
        .map((note) => note.text)
        .join("、");

      return {
        id: `${memo.id}-${period.period}`,
        dayOfWeek: 1,
        period: period.period,
        subjectId: period.subjectId,
        room: "",
        teacher: "",
        items: itemNotes,
        subjectName: period.subjectName || subject?.name || "未設定",
      };
    });
}

export function getBoardAttentionGroups(memo?: BoardMemo): BoardAttentionGroup[] {
  if (!memo) {
    return [];
  }

  return memo.periods
    .map((period) => ({
      key: `${memo.id}-${period.period}`,
      period: period.period,
      subjectName: period.subjectName || "未設定",
      notes: period.notes.filter((note) => note.text.trim()),
    }))
    .filter((group) => group.notes.length);
}

export function updateBoardPeriod(
  periods: BoardPeriod[],
  periodNumber: number,
  patch: Partial<BoardPeriod>,
): BoardPeriod[] {
  return periods.map((period) =>
    period.period === periodNumber ? { ...period, ...patch } : period,
  );
}

export function updateBoardNote(
  notes: BoardNote[],
  index: number,
  patch: Partial<BoardNote>,
): BoardNote[] {
  return notes.map((note, noteIndex) =>
    noteIndex === index ? { ...note, ...patch } : note,
  );
}

export function createBoardNote(type: BoardNoteType = "quiz"): BoardNote {
  return {
    type,
    text: "",
    done: false,
  };
}

const validNoteTypes: BoardNoteType[] = [
  "quiz",
  "prep",
  "homework",
  "item",
  "notice",
];

const subjectAliases: Record<string, string[]> = {
  "communication-1": [
    "コミュ",
    "コミュ1",
    "コミュⅠ",
    "コミュニケーション1",
    "コミュニケーションⅠ",
    "コミュニケーション",
    "英コミ",
    "英コミ1",
    "英コミⅠ",
    "英語コミュニケーション",
  ],
  "logic-expression-1": [
    "論表",
    "論表1",
    "論表Ⅰ",
    "論理表現",
    "論理表現1",
    "論理表現Ⅰ",
  ],
  "math-1": ["数1", "数Ⅰ", "数学1", "数学Ⅰ"],
  japanese: ["現国", "現代文", "現代の国語"],
  "language-culture": ["言文", "古典", "言語文化"],
  "basic-physics": ["物基", "物理", "物理基礎"],
};

function normalizeText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[　\s・\-ー]/g, "")
    .replace(/Ⅰ/g, "1")
    .replace(/Ⅱ/g, "2")
    .replace(/Ⅲ/g, "3")
    .replace(/Ⅳ/g, "4");
}

function normalizeOcrLine(value: string) {
  return value
    .replace(/[０-９]/g, (char) =>
      String.fromCharCode(char.charCodeAt(0) - 0xfee0),
    )
    .replace(/[•●○◎□■◆◇・]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeBoardNoteType(value: unknown): BoardNoteType {
  if (typeof value === "string" && validNoteTypes.includes(value as BoardNoteType)) {
    return value as BoardNoteType;
  }
  return "notice";
}

export function findSubjectByOcrName(subjectName: string, subjects: Subject[]) {
  const normalizedSubjectName = normalizeText(subjectName);
  if (!normalizedSubjectName) {
    return undefined;
  }

  return subjects.find((subject) => {
    const candidates = [
      subject.name,
      subject.shortName,
      ...(subjectAliases[subject.id] ?? []),
    ].map(normalizeText);
    return candidates.some(
      (candidate) =>
        candidate === normalizedSubjectName ||
        normalizedSubjectName.includes(candidate) ||
        candidate.includes(normalizedSubjectName),
    );
  });
}

function classifyBoardNoteText(text: string): BoardNoteType {
  if (/小テスト|単語テスト|漢字テスト|テスト|quiz/i.test(text)) {
    return "quiz";
  }
  if (/予習|prep/i.test(text)) {
    return "prep";
  }
  if (/宿題|課題|提出|homework/i.test(text)) {
    return "homework";
  }
  if (/持ち物|持参|用意|bring|item/i.test(text)) {
    return "item";
  }
  return "notice";
}

function stripNotePrefix(text: string) {
  return text.replace(/^[-*、。:：)\]）\s]+/, "").trim();
}

function splitInlineNotes(text: string) {
  return text
    .split(/[、,／/;；]+/)
    .map((value) => stripNotePrefix(value))
    .filter(Boolean);
}

function getSubjectCandidates(subject: Subject) {
  return [subject.name, subject.shortName, ...(subjectAliases[subject.id] ?? [])]
    .filter(Boolean)
    .sort((a, b) => normalizeText(b).length - normalizeText(a).length);
}

function extractSubjectAndNotes(text: string, subjects: Subject[]) {
  const normalizedLine = normalizeText(text);

  for (const subject of subjects) {
    for (const candidate of getSubjectCandidates(subject)) {
      const normalizedCandidate = normalizeText(candidate);
      if (!normalizedCandidate || !normalizedLine.includes(normalizedCandidate)) {
        continue;
      }

      const subjectName = candidate;
      const rawParts = text.split(/\s+/);
      const tokenIndex = rawParts.findIndex(
        (part) => normalizeText(part) === normalizedCandidate,
      );
      const remainingText =
        tokenIndex >= 0 ? rawParts.slice(tokenIndex + 1).join(" ") : "";

      return {
        subjectName,
        notes: splitInlineNotes(remainingText),
      };
    }
  }

  const [subjectName = "", ...noteParts] = text.split(/\s+/);
  return {
    subjectName,
    notes: splitInlineNotes(noteParts.join(" ")),
  };
}

export function boardOcrTextToResult(text: string, subjects: Subject[]): BoardOcrResult {
  const periods: BoardOcrResult["periods"] = [];
  let currentPeriod: BoardOcrResult["periods"][number] | undefined;

  const lines = text
    .split(/\r?\n/)
    .map(normalizeOcrLine)
    .filter(Boolean);

  for (const line of lines) {
    const periodMatch = line.match(/^([1-7])\s*(?:限|時間目|校時)?\s*[:：.)、-]?\s*(.*)$/);

    if (periodMatch) {
      const period = Number(periodMatch[1]);
      const rest = periodMatch[2].trim();
      const { subjectName, notes } = extractSubjectAndNotes(rest, subjects);
      currentPeriod = {
        period,
        subject: subjectName || rest || "未設定",
        notes: notes.map((note) => ({
          type: classifyBoardNoteText(note),
          text: note,
        })),
      };
      periods.push(currentPeriod);
      continue;
    }

    if (!currentPeriod) {
      continue;
    }

    const cleanedLine = stripNotePrefix(line);
    if (!cleanedLine) {
      continue;
    }

    const subject = findSubjectByOcrName(cleanedLine, subjects);
    const hasNoteKeyword =
      classifyBoardNoteText(cleanedLine) !== "notice" || /連絡|注意|あり/.test(cleanedLine);

    if (subject && !hasNoteKeyword && currentPeriod.subject === "未設定") {
      currentPeriod.subject = subject.shortName || subject.name;
      continue;
    }

    currentPeriod.notes.push({
      type: classifyBoardNoteText(cleanedLine),
      text: cleanedLine,
    });
  }

  return {
    periods: periods.filter(
      (period) => period.subject !== "未設定" || period.notes.length,
    ),
  };
}

export function boardOcrResultToMemo(
  result: BoardOcrResult,
  baseMemo: BoardMemo,
  subjects: Subject[],
): BoardMemo {
  const fallbackSubject = subjects[0];
  const periodsByNumber = new Map(
    result.periods
      .filter((period) => Number.isInteger(period.period))
      .map((period) => [period.period, period]),
  );

  return {
    ...baseMemo,
    periods: baseMemo.periods.map((period) => {
      const ocrPeriod = periodsByNumber.get(period.period);
      if (!ocrPeriod) {
        return period;
      }

      const matchedSubject = findSubjectByOcrName(ocrPeriod.subject, subjects);
      const subjectId =
        matchedSubject?.id || period.subjectId || fallbackSubject?.id || "";
      const subjectName =
        ocrPeriod.subject.trim() ||
        matchedSubject?.shortName ||
        matchedSubject?.name ||
        period.subjectName;

      return {
        ...period,
        subjectId,
        subjectName,
        notes: ocrPeriod.notes
          .map((note) => ({
            type: normalizeBoardNoteType(note.type),
            text: note.text.trim(),
            done: false,
          }))
          .filter((note) => note.text),
      };
    }),
  };
}
