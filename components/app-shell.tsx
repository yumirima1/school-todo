"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenCheck,
  CalendarDays,
  ClipboardList,
  Clock3,
  Download,
  GraduationCap,
  Home,
  Images,
  NotebookPen,
  Settings,
  Sparkles,
  Trophy,
} from "lucide-react";

const navItems = [
  { href: "/", label: "ホーム", icon: Home },
  { href: "/assignments", label: "提出物", icon: ClipboardList },
  { href: "/timetable", label: "時間割", icon: Clock3 },
  { href: "/board", label: "黒板メモ", icon: NotebookPen },
  { href: "/events", label: "行事", icon: Trophy },
  { href: "/import-events", label: "行事取込", icon: Download },
  { href: "/materials", label: "教材", icon: Images },
  { href: "/study", label: "予習", icon: BookOpenCheck },
  { href: "/calendar", label: "予定", icon: CalendarDays },
  { href: "/subjects", label: "教科", icon: GraduationCap },
  { href: "/settings", label: "設定", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-orange-50 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col">
        <header className="sticky top-0 z-20 border-b border-white/70 bg-white/80 px-4 py-3 shadow-sm shadow-sky-100/70 backdrop-blur md:px-6">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-2" aria-label="School Dock">
              <span className="grid size-10 place-items-center rounded-2xl bg-sky-500 text-white shadow-lg shadow-sky-200">
                <Sparkles size={18} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-base font-bold leading-tight text-slate-950">
                  School Dock
                </span>
                <span className="block text-xs font-medium text-slate-500">
                  学校生活ダッシュボード
                </span>
              </span>
            </Link>
            <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">
              School OS
            </span>
          </div>
        </header>

        <div className="flex flex-1 md:grid md:grid-cols-[212px_1fr]">
          <aside className="hidden border-r border-white/70 bg-white/35 px-3 py-5 backdrop-blur md:block">
            <nav className="grid gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${
                      active
                        ? "bg-sky-500 text-white shadow-lg shadow-sky-100"
                        : "text-slate-600 hover:bg-white/80 hover:text-slate-950"
                    }`}
                  >
                    <Icon size={18} aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <main className="w-full flex-1 px-4 pb-28 pt-5 md:px-6 md:pb-10">
            {children}
          </main>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 px-3 pb-3 md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1 rounded-[1.6rem] border border-white/80 bg-white/85 p-1.5 shadow-2xl shadow-slate-300/60 backdrop-blur">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-semibold ${
                  active
                    ? "bg-sky-500 text-white"
                    : "text-slate-500 hover:text-slate-950"
                }`}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
