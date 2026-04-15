import Link from "next/link";
import type { ReactNode } from "react";

import { AppIcon } from "@/components/spidernet/icons";
import { boardRegistry } from "@/lib/spidernet/registry";
import type { QuickStat } from "@/lib/spidernet/types";

type DashboardShellProps = {
  activePath: string;
  eyebrow: string;
  title: string;
  description: string;
  quickStats: QuickStat[];
  children: ReactNode;
};

const controlValues = {
  manager: "Saarthi",
  gatekeeper: "Chitragupt",
  persistence: "Local JSON runtime",
  mode: "White web dashboard",
};

export function DashboardShell({
  activePath,
  eyebrow,
  title,
  description,
  quickStats,
  children,
}: DashboardShellProps) {
  const liveBoards = boardRegistry.filter((board) => board.visibility === "main");

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.10),_transparent_28%),linear-gradient(180deg,#fbfdff_0%,#f2f6fb_52%,#edf2f8_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1720px] gap-4 px-3 py-4 sm:px-5 lg:px-6">
        <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-20 shrink-0 rounded-[26px] border border-slate-200/80 bg-white/90 p-2 shadow-[0_16px_60px_rgba(15,23,42,0.08)] backdrop-blur lg:flex lg:flex-col lg:items-center lg:justify-between">
          <div className="space-y-4">
            <Link
              href="/"
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white"
            >
              SN
            </Link>
            <nav className="space-y-2">
              <Link
                href="/"
                className={`flex h-12 w-12 items-center justify-center rounded-2xl transition ${
                  activePath === "/"
                    ? "bg-cyan-500 text-white shadow-[0_12px_30px_rgba(6,182,212,0.28)]"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                }`}
                title="Overview"
              >
                <AppIcon name="overview" />
              </Link>
              {liveBoards.map((board) => (
                <Link
                  key={board.id}
                  href={board.route}
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl transition ${
                    activePath === board.route
                      ? "bg-cyan-500 text-white shadow-[0_12px_30px_rgba(6,182,212,0.28)]"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                  title={board.title}
                >
                  <AppIcon name={board.icon} />
                </Link>
              ))}
            </nav>
          </div>

          <div className="rounded-2xl bg-slate-50 px-2 py-3 text-center text-[10px] uppercase tracking-[0.18em] text-slate-500">
            web-first
          </div>
        </aside>

        <div className="flex min-h-[calc(100vh-2rem)] flex-1 flex-col gap-4">
          <header className="rounded-[30px] border border-white/90 bg-white/88 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_380px]">
              <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
                      {eyebrow}
                    </p>
                    <div>
                      <h1 className="max-w-4xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-[2.6rem]">
                        {title}
                      </h1>
                      <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600 sm:text-base">
                        {description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-sm font-medium text-cyan-700">
                      White UI is primary
                    </span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-600">
                      Tk visuals excluded
                    </span>
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                  <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center gap-3 rounded-[20px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
                      <span className="rounded-xl bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">
                        /
                      </span>
                      <input
                        aria-label="Global command input"
                        className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                        defaultValue=""
                        placeholder="Ask what to do next, search packets, or jump to a board..."
                      />
                      <span className="hidden rounded-xl border border-slate-200 px-2 py-1 text-xs text-slate-500 sm:inline-block">
                        Ctrl K
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                      <span className="rounded-full bg-white px-2.5 py-1">policy first</span>
                      <span className="rounded-full bg-white px-2.5 py-1">six boards locked</span>
                      <span className="rounded-full bg-white px-2.5 py-1">novice-first shell</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {quickStats.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3"
                      >
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          {item.label}
                        </p>
                        <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {boardRegistry.map((board) => (
                    <Link
                      key={board.id}
                      href={board.route}
                      className={`rounded-full border px-3 py-1.5 text-sm transition ${
                        activePath === board.route
                          ? "border-slate-950 bg-slate-950 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {board.code} {board.shortTitle}
                    </Link>
                  ))}
                </div>
              </div>

              <aside className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Control Cluster</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Clear defaults for the current white web workflow.
                    </p>
                  </div>
                  <div className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500">
                    novice-first
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  <label className="rounded-[22px] border border-slate-200 bg-white px-4 py-3">
                    <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Manager</span>
                    <select
                      aria-label="Active manager"
                      defaultValue={controlValues.manager}
                      className="mt-2 w-full bg-transparent text-sm text-slate-900 outline-none"
                    >
                      <option>{controlValues.manager}</option>
                    </select>
                  </label>
                  <label className="rounded-[22px] border border-slate-200 bg-white px-4 py-3">
                    <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Gate owner</span>
                    <select
                      aria-label="Active gate owner"
                      defaultValue={controlValues.gatekeeper}
                      className="mt-2 w-full bg-transparent text-sm text-slate-900 outline-none"
                    >
                      <option>{controlValues.gatekeeper}</option>
                    </select>
                  </label>
                  <label className="rounded-[22px] border border-slate-200 bg-white px-4 py-3">
                    <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Persistence</span>
                    <select
                      aria-label="Persistence mode"
                      defaultValue={controlValues.persistence}
                      className="mt-2 w-full bg-transparent text-sm text-slate-900 outline-none"
                    >
                      <option>{controlValues.persistence}</option>
                    </select>
                  </label>
                  <label className="rounded-[22px] border border-slate-200 bg-white px-4 py-3">
                    <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Visual mode</span>
                    <select
                      aria-label="Visual mode"
                      defaultValue={controlValues.mode}
                      className="mt-2 w-full bg-transparent text-sm text-slate-900 outline-none"
                    >
                      <option>{controlValues.mode}</option>
                    </select>
                  </label>
                </div>
              </aside>
            </div>
          </header>

          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
