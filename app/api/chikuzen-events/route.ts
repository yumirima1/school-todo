import { NextResponse } from "next/server";
import {
  chikuzenNewsUrl,
  createEventSourceFromDiscovery,
  extractChikuzenEventCandidatesFromNewsHtml,
  extractChikuzenEventSourcesFromNewsHtml,
  extractPdfLinksFromNewsPage,
} from "@/lib/event-importer";
import { EventSource } from "@/lib/types";

export const runtime = "nodejs";

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "School Dock event importer",
    },
    next: { revalidate: 60 * 60 },
  });

  if (!response.ok) {
    throw new Error(`${url} の取得に失敗しました: ${response.status}`);
  }

  return response.text();
}

function uniqueSources(sources: EventSource[]) {
  const sourceByPdfUrl = new Map<string, EventSource>();
  for (const source of sources) {
    sourceByPdfUrl.set(source.pdfUrl, source);
  }
  return [...sourceByPdfUrl.values()];
}

export async function GET() {
  try {
    const checkedAt = new Date().toISOString();
    const newsHtml = await fetchHtml(chikuzenNewsUrl);
    const directSources = extractChikuzenEventSourcesFromNewsHtml(
      newsHtml,
      checkedAt,
    );
    const articleCandidates = extractChikuzenEventCandidatesFromNewsHtml(newsHtml)
      .filter((candidate) => !candidate.pdfUrl)
      .slice(0, 8);

    const articleSources = await Promise.all(
      articleCandidates.map(async (candidate) => {
        try {
          const articleHtml = await fetchHtml(candidate.url);
          return extractPdfLinksFromNewsPage(articleHtml).map((pdfUrl) =>
            createEventSourceFromDiscovery({
              title: candidate.title,
              articleUrl: candidate.url,
              pdfUrl,
              checkedAt,
              publishedAt: candidate.publishedAt,
            }),
          );
        } catch {
          return [];
        }
      }),
    );

    return NextResponse.json({
      checkedAt,
      sources: uniqueSources([...directSources, ...articleSources.flat()]),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "筑前高校のお知らせ取得に失敗しました。",
      },
      { status: 502 },
    );
  }
}
