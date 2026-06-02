"use client";

import { AlertTriangle, CalendarClock, Wrench } from "lucide-react";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { useSchoolData } from "@/lib/school-data";
import { News, NewsCategory } from "@/lib/types";

const categoryLabels: Record<NewsCategory, string> = {
  update: "アプリ更新",
  school: "学校情報",
  warning: "重要",
};

const categoryStyles: Record<NewsCategory, string> = {
  update: "border-cyan-300/25 bg-cyan-400/10 text-cyan-100",
  school: "border-emerald-300/25 bg-emerald-400/10 text-emerald-100",
  warning: "border-amber-300/30 bg-amber-400/10 text-amber-100",
};

function NewsIcon({ news }: { news: News }) {
  if (news.category === "warning") {
    return <AlertTriangle size={17} aria-hidden="true" />;
  }
  if (news.category === "school") {
    return <CalendarClock size={17} aria-hidden="true" />;
  }
  return <Wrench size={17} aria-hidden="true" />;
}

export default function NewsPage() {
  const { data } = useSchoolData();
  const newsItems = [...data.news].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );

  return (
    <>
      <PageHeader
        title="School Dock News"
        description="アプリ更新情報と学校情報をまとめて確認します。"
      />

      <Card title="News一覧">
        {newsItems.length ? (
          <div className="grid gap-3">
            {newsItems.map((news) => (
              <article
                key={news.id}
                className="rounded-lg border border-white/10 bg-[#0d141c] p-3"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md bg-white/10 text-cyan-200">
                    <NewsIcon news={news} />
                  </span>
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap gap-2">
                      <span
                        className={`rounded-md border px-2 py-1 text-xs font-medium ${categoryStyles[news.category]}`}
                      >
                        {categoryLabels[news.category]}
                      </span>
                      <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-400">
                        {new Date(news.createdAt).toLocaleString("ja-JP")}
                      </span>
                    </div>
                    <h2 className="break-words text-sm font-semibold text-white">
                      {news.title}
                    </h2>
                    <p className="mt-2 break-words text-sm leading-6 text-slate-300">
                      {news.content}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState text="Newsはまだありません。" />
        )}
      </Card>
    </>
  );
}
