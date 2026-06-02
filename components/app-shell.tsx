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
  { href: "/study", label: "予習", icon: BookOpenCheck },
  { href: "/calendar", label: "予定", icon: CalendarDays },
  { href: "/subjects", label: "教科", icon: GraduationCap },
  { href: "/settings", label: "設定", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#0b0f14] text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b0f14]/95 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-2" aria-label="School Dock">
              <span className="grid size-9 place-items-center rounded-md bg-cyan-400 text-slate-950">
                <Sparkles size={18} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-base font-semibold leading-tight">
                  School Dock
                </span>
                <span className="block text-xs text-slate-400">
                  学校生活ダッシュボード
                </span>
              </span>
            </Link>
            <span className="rounded-md border border-cyan-300/30 px-2.5 py-1 text-xs font-medium text-cyan-200">
              Phase 4
            </span>
          </div>
        </header>

        <div className="flex flex-1 md:grid md:grid-cols-[212px_1fr]">
          <aside className="hidden border-r border-white/10 px-3 py-5 md:block">
            <nav className="grid gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition ${
                      active
                        ? "bg-cyan-400 text-slate-950"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
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

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#0b0f14]/95 px-2 py-2 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 rounded-md px-1 py-2 text-[11px] ${
                  active
                    ? "bg-cyan-400 text-slate-950"
                    : "text-slate-400 hover:text-white"
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
