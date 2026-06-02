import {
  BoardMemo,
  BoardNote,
  BoardNoteType,
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
