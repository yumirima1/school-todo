import { EventSource, SchoolEvent } from "@/lib/types";

export const chikuzenHomeUrl = "https://chikuzen.fku.ed.jp/";
export const chikuzenNewsUrl = "https://chikuzen.fku.ed.jp/news/";

export type ChikuzenEventPageCandidate = {
  title: string;
  url: string;
  publishedAt?: string;
  pdfUrl?: string;
};

export type ChikuzenEventDiscoveryResult = {
  checkedAt: string;
  sources: EventSource[];
};

export type ParsedEventPdf = {
  sourceUrl: string;
  events: Array<{
    title: string;
    date: string;
    memo: string;
  }>;
};

const eventTitlePattern =
  /(行事予定|年間行事予定|月間行事予定|[0-9０-９一二三四五六七八九十]{1,2}月行事予定)/;

function decodeHtml(value: string) {
  return value
    .replace(/&amp;|&#038;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function stripTags(value: string) {
  return decodeHtml(value.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function resolveChikuzenUrl(url: string) {
  return new URL(decodeHtml(url), chikuzenHomeUrl).toString();
}

function createEventSourceId(pdfUrl: string) {
  let hash = 0;
  for (let index = 0; index < pdfUrl.length; index += 1) {
    hash = (hash * 31 + pdfUrl.charCodeAt(index)) >>> 0;
  }
  return `chikuzen-event-source-${hash.toString(36)}`;
}

export function detectEventSourceType(title: string) {
  return /年間/.test(title) ? "yearly" : "monthly";
}

export function createEventSourceFromDiscovery({
  title,
  articleUrl,
  pdfUrl,
  checkedAt,
  publishedAt,
  memo = "筑前高校お知らせから自動検出",
}: {
  title: string;
  articleUrl: string;
  pdfUrl: string;
  checkedAt: string;
  publishedAt?: string;
  memo?: string;
}): EventSource {
  return {
    id: createEventSourceId(pdfUrl),
    title,
    url: pdfUrl,
    articleUrl,
    pdfUrl,
    sourceType: detectEventSourceType(title),
    fetchedAt: checkedAt,
    discoveredAt: publishedAt ?? checkedAt,
    lastCheckedAt: checkedAt,
    status: "pending",
    memo,
  };
}

export function extractChikuzenEventCandidatesFromNewsHtml(
  html: string,
  pageUrl = chikuzenNewsUrl,
): ChikuzenEventPageCandidate[] {
  const candidates: ChikuzenEventPageCandidate[] = [];
  const itemMatches = html.matchAll(/<li[^>]*class="[^"]*c-post__item[^"]*"[^>]*>([\s\S]*?)<\/li>/g);

  for (const match of itemMatches) {
    const itemHtml = match[1];
    const hrefMatch = itemHtml.match(/<a[^>]+href=["']([^"']+)["'][^>]*>/i);
    const titleMatch = itemHtml.match(/<p[^>]*class=["'][^"']*c-post__title[^"']*["'][^>]*>([\s\S]*?)<\/p>/i);
    const dateMatch = itemHtml.match(/<p[^>]*class=["'][^"']*c-post__data[^"']*["'][^>]*>([\s\S]*?)<\/p>/i);

    if (!hrefMatch || !titleMatch) {
      continue;
    }

    const title = stripTags(titleMatch[1]);
    if (!eventTitlePattern.test(title)) {
      continue;
    }

    const url = resolveChikuzenUrl(hrefMatch[1]);
    candidates.push({
      title,
      url,
      publishedAt: dateMatch ? stripTags(dateMatch[1]) : undefined,
      pdfUrl: /\.pdf(?:$|[?#])/i.test(url) ? url : undefined,
    });
  }

  return candidates.map((candidate) => ({
    ...candidate,
    url: new URL(candidate.url, pageUrl).toString(),
  }));
}

export function extractChikuzenEventSourcesFromNewsHtml(
  html: string,
  checkedAt: string,
  pageUrl = chikuzenNewsUrl,
): EventSource[] {
  return extractChikuzenEventCandidatesFromNewsHtml(html, pageUrl)
    .filter((candidate) => candidate.pdfUrl)
    .map((candidate) =>
      createEventSourceFromDiscovery({
        title: candidate.title,
        articleUrl: /\.pdf(?:$|[?#])/i.test(candidate.url) ? pageUrl : candidate.url,
        pdfUrl: candidate.pdfUrl ?? candidate.url,
        checkedAt,
        publishedAt: candidate.publishedAt,
      }),
    );
}

export async function findChikuzenEventPages(): Promise<
  ChikuzenEventPageCandidate[]
> {
  const response = await fetch(chikuzenNewsUrl, {
    headers: {
      "User-Agent": "School Dock event importer",
    },
  });
  if (!response.ok) {
    throw new Error(`筑前高校お知らせページの取得に失敗しました: ${response.status}`);
  }
  return extractChikuzenEventCandidatesFromNewsHtml(await response.text());
}

export function extractPdfLinksFromNewsPage(html: string): string[] {
  const matches = html.match(/https?:\/\/[^"'\s<>]+\.pdf(?:\?[^"'\s<>]*)?/gi);
  return Array.from(new Set(matches ?? [])).map(resolveChikuzenUrl);
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
