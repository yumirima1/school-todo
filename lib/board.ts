import {
  BoardMemo,
  BoardNote,
  BoardNoteType,
  BoardNotebookSummary,
  BoardOcrRegionResult,
  BoardOcrResult,
  BoardPeriod,
  BoardSubjectCorrectionCandidate,
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

export const chikuzenClassSubjectDictionary = [
  "数Ⅰ",
  "数A",
  "公共",
  "現国",
  "言文",
  "英コミⅠ",
  "論理・表現Ⅰ",
  "物理基礎",
  "化学基礎",
  "体育",
  "保健",
  "美術Ⅰ",
  "総探",
];

const subjectDictionaryAliases: Record<string, string[]> = {
  "数Ⅰ": ["数I", "数1", "数学Ⅰ", "数学I", "数学1", "数一"],
  "数A": ["数Ａ", "数学A", "数学Ａ"],
  現国: ["現固", "現図", "現代文", "現代の国語"],
  言文: ["言間", "言丈", "言語文化"],
  "英コミⅠ": ["英コミI", "英コミ1", "コミュⅠ", "コミュI", "コミュ1"],
  "論理・表現Ⅰ": ["論表", "論理表現Ⅰ", "論理 表現Ⅰ", "論理・表現I"],
  物理基礎: ["物基", "物狸基礎"],
  化学基礎: ["化基", "科学基礎"],
  美術Ⅰ: ["英Ⅰ", "英I", "英1", "美術I", "美術1", "美Ⅰ", "美I"],
  総探: ["総採", "総深", "総合探究", "総合的な探究"],
};

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

function normalizeSubjectDictionaryText(value: string) {
  return normalizeText(value)
    .replace(/[Ａａ]/g, "a")
    .replace(/i/g, "1")
    .replace(/固/g, "国")
    .replace(/圖/g, "国")
    .replace(/採/g, "探")
    .replace(/深/g, "探")
    .replace(/狸/g, "理")
    .replace(/科/g, "化")
    .replace(/[()（）[\]【】]/g, "");
}

function levenshteinDistance(a: string, b: string) {
  const matrix = Array.from({ length: a.length + 1 }, (_, row) =>
    Array.from({ length: b.length + 1 }, (_, column) =>
      row === 0 ? column : column === 0 ? row : 0,
    ),
  );

  for (let row = 1; row <= a.length; row += 1) {
    for (let column = 1; column <= b.length; column += 1) {
      const cost = a[row - 1] === b[column - 1] ? 0 : 1;
      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + cost,
      );
    }
  }

  return matrix[a.length][b.length];
}

function evaluateSubjectCorrection(
  source: string,
  candidate: string,
): BoardSubjectCorrectionCandidate {
  const normalizedSource = normalizeSubjectDictionaryText(source);
  const normalizedCandidate = normalizeSubjectDictionaryText(candidate);
  const aliases = subjectDictionaryAliases[candidate] ?? [];
  const aliasMatch = aliases.some(
    (alias) => normalizeSubjectDictionaryText(alias) === normalizedSource,
  );

  if (normalizedSource === normalizedCandidate) {
    return {
      source,
      candidate,
      score: 100,
      reason: "完全一致",
      exact: true,
    };
  }

  if (aliasMatch) {
    return {
      source,
      candidate,
      score: 92,
      reason: "OCR類似文字",
      exact: false,
    };
  }

  const maxLength = Math.max(normalizedSource.length, normalizedCandidate.length);
  const distance = levenshteinDistance(normalizedSource, normalizedCandidate);
  const score = maxLength ? Math.round((1 - distance / maxLength) * 100) : 0;

  return {
    source,
    candidate,
    score,
    reason: "類似文字列",
    exact: false,
  };
}

export function getBestSubjectCorrectionCandidate(source: string) {
  const trimmedSource = source.trim();
  if (!trimmedSource) {
    return undefined;
  }

  return chikuzenClassSubjectDictionary
    .map((candidate) => evaluateSubjectCorrection(trimmedSource, candidate))
    .filter((candidate) => candidate.score >= 60)
    .sort((a, b) => b.score - a.score)[0];
}

function extractSubjectCorrectionSegments(text: string) {
  return text
    .split(/\r?\n/)
    .flatMap((line) => {
      const normalizedLine = normalizeOcrLine(line)
        .replace(/^\[[^\]]+\]/, "")
        .replace(/^([1-7])\s*(?:限|時間目|校時)?\s*[:：.)、-]?\s*/, "")
        .trim();
      return [
        normalizedLine,
        ...normalizedLine.split(/[\s,、／/;；:：|｜()（）[\]【】]+/),
      ];
    })
    .map((segment) => segment.trim())
    .filter(
      (segment) =>
        segment.length >= 2 &&
        segment.length <= 12 &&
        /[一-龠ぁ-んァ-ンA-Za-zⅠⅡⅢⅣ0-9０-９]/.test(segment),
    );
}

export function getSubjectCorrectionCandidatesFromText(
  text: string,
): BoardSubjectCorrectionCandidate[] {
  const candidateBySource = new Map<string, BoardSubjectCorrectionCandidate>();

  for (const segment of extractSubjectCorrectionSegments(text)) {
    const correction = getBestSubjectCorrectionCandidate(segment);
    if (!correction || correction.candidate === segment || correction.exact) {
      continue;
    }
    const current = candidateBySource.get(correction.source);
    if (!current || correction.score > current.score) {
      candidateBySource.set(correction.source, correction);
    }
  }

  return [...candidateBySource.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}

function correctSubjectNameCandidate(value: string) {
  const correction = getBestSubjectCorrectionCandidate(value);
  return correction && correction.score >= 85 ? correction.candidate : value;
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
        subjectName: correctSubjectNameCandidate(subjectName),
        notes: splitInlineNotes(remainingText),
      };
    }
  }

  const [subjectName = "", ...noteParts] = text.split(/\s+/);
  return {
    subjectName: correctSubjectNameCandidate(subjectName),
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

function isLikelyTask(text: string) {
  return /宿題|課題|提出|持ち物|持参|用意|p\.?\s*\d+|ページ|問\d+|小テスト|単語テスト|予習/i.test(
    text,
  );
}

function cleanupNotebookLine(text: string) {
  return stripNotePrefix(text)
    .replace(/\s+/g, " ")
    .replace(/[|｜]+/g, " ")
    .trim();
}

export function createBoardNotebookSummary(
  regions: BoardOcrRegionResult[],
  subjects: Subject[],
): BoardNotebookSummary {
  const readableRegions = regions.filter((region) => region.text.trim());
  const allLines = readableRegions
    .flatMap((region) =>
      region.text
        .split(/\r?\n/)
        .map(cleanupNotebookLine)
        .filter(Boolean)
        .map((line) => ({
          line,
          region,
        })),
    )
    .filter(({ line }) => line.length >= 2);

  const subjectHit = allLines
    .map(({ line }) => findSubjectByOcrName(line, subjects))
    .find(Boolean);

  const tasks = Array.from(
    new Set(
      allLines
        .filter(({ line }) => isLikelyTask(line))
        .map(({ line }) => line),
    ),
  );
  const boardContent = Array.from(
    new Set(
      allLines
        .filter(({ line }) => !isLikelyTask(line))
        .map(({ line }) => line),
    ),
  ).slice(0, 12);

  const unknowns = regions
    .filter((region) => region.unknownReason)
    .map((region) => `${region.label}: ${region.unknownReason}`);

  const confidence =
    regions.length === 0
      ? 0
      : Math.round(
          regions.reduce((total, region) => total + region.confidence, 0) /
            regions.length,
        );

  return {
    subject: correctSubjectNameCandidate(
      subjectHit?.shortName || subjectHit?.name || "不明",
    ),
    boardContent,
    tasks,
    unknowns,
    sourceRegions: readableRegions.map((region) => region.label),
    confidence,
  };
}

export function boardNotebookSummaryToOcrResult(
  summary: BoardNotebookSummary,
): BoardOcrResult {
  const notes = [
    ...summary.boardContent.map((text) => ({
      type: "notice" as BoardNoteType,
      text,
    })),
    ...summary.tasks.map((text) => ({
      type: classifyBoardNoteText(text),
      text,
    })),
    ...summary.unknowns.map((text) => ({
      type: "notice" as BoardNoteType,
      text: `不明: ${text}`,
    })),
  ];

  return {
    periods: [
      {
        period: 1,
        subject: summary.subject,
        notes,
      },
    ],
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
        correctSubjectNameCandidate(ocrPeriod.subject.trim()) ||
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
