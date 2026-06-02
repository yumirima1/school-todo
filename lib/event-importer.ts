import { EventSource, SchoolEvent } from "@/lib/types";

export const chikuzenHomeUrl = "https://chikuzen.fku.ed.jp/";
export const chikuzenNewsUrl = "https://chikuzen.fku.ed.jp/news/";

export type ChikuzenEventPageCandidate = {
  title: string;
  url: string;
  publishedAt?: string;
};

export type ParsedEventPdf = {
  sourceUrl: string;
  events: Array<{
    title: string;
    date: string;
    memo: string;
  }>;
};

export async function findChikuzenEventPages(): Promise<
  ChikuzenEventPageCandidate[]
> {
  // Phase 4では本番クライアントから学校HPを直接fetchしない。
  // 将来、Next.js API Routeでサーバー側fetchして候補記事を返す。
  return [];
}

export function extractPdfLinksFromNewsPage(html: string): string[] {
  // 将来、記事HTMLから「PDFはこちら」などのPDFリンクを抽出する。
  const matches = html.match(/https?:\/\/[^"'\s]+\.pdf/gi);
  return Array.from(new Set(matches ?? []));
}

export async function parseEventPdf(source: EventSource): Promise<ParsedEventPdf> {
  // 将来、PDFテキスト抽出またはOCR結果をここへ流し込む。
  return {
    sourceUrl: source.url,
    events: [],
  };
}

export function convertParsedEventsToSchoolEvents(
  parsed: ParsedEventPdf,
): Omit<SchoolEvent, "id">[] {
  return parsed.events.map((event) => ({
    title: event.title,
    date: event.date,
    type: "school_event",
    importance: "middle",
    memo: event.memo,
  }));
}
