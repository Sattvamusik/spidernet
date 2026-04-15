import Link from "next/link";

import { AppIcon } from "@/components/spidernet/icons";
import { getVisibleBoards, getWidgetsForBoard } from "@/lib/spidernet/router";
import type { BoardDefinition, DashboardSnapshot } from "@/lib/spidernet/types";

type OverviewBoardProps = {
  boards: BoardDefinition[];
  snapshot: DashboardSnapshot;
};

const starterSteps = [
  "Start in Dash 001 to capture the task as an intake packet.",
  "Use Dash 002 only to compare tools and choose a safe exposure path.",
  "Let Saarthi in Dash 003 decide routing, approvals, and readiness.",
  "Execute through Dash 004, verify in Dash 005, and preserve history in Dash 006.",
];

export function OverviewBoard({ boards, snapshot }: OverviewBoardProps) {
  const mainBoards = getVisibleBoards("main");

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_380px]">
      <section className="space-y-4">
        <div className="rounded-[30px] border border-white/90 bg-white/88 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Main Product Direction</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                White web SETU is the product. DRISHTI desktop is architecture reference only.
              </h2>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">
                This dashboard carries over the operating model, packet flow, registries, and readiness law from the desktop line without importing the dark Tk visual family.
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              {boards.length} locked board definitions
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {starterSteps.map((step, index) => (
              <div key={step} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Step {index + 1}</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-white/90 bg-white/88 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Locked Six-Board Purpose Model</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                One family, six fixed jobs
              </h2>
            </div>
            <div className="rounded-full bg-cyan-50 px-3 py-1.5 text-sm font-medium text-cyan-700">
              novice-first shell
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {mainBoards.map((board) => (
              <Link
                key={board.id}
                href={board.route}
                className="group rounded-[26px] border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-2xl bg-slate-950 p-3 text-white">
                    <AppIcon name={board.icon} />
                  </div>
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-500">
                    {board.purposeLock}
                  </span>
                </div>
                <p className="mt-4 text-xs uppercase tracking-[0.22em] text-slate-500">{board.code}</p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                  {board.shortTitle}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{board.shellSummary}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                  {getWidgetsForBoard(board.id).map((widget) => (
                    <span key={widget.id} className="rounded-full border border-slate-200 bg-white px-2.5 py-1">
                      {widget.title}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="rounded-[30px] border border-white/90 bg-white/88 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.08)]">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Four-Lane Model</p>
            <div className="mt-4 space-y-3">
              {snapshot.laneModel.map((lane) => (
                <div key={lane.name} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-950">{lane.name}</p>
                  <p className="mt-1 text-sm text-slate-600">{lane.mandate}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                    {lane.primaryOutputs}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-white/90 bg-white/88 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.08)]">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Vault Routing Model</p>
            <div className="mt-4 space-y-3">
              {snapshot.routeFamilies.map((route) => (
                <div key={route.route} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-950">{route.route}</p>
                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-500">
                      {route.owner}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{route.purpose}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{route.trigger}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4">
        <div className="rounded-[30px] border border-white/90 bg-white/88 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Software Exposure Decision Ladder</p>
          <div className="mt-4 space-y-3">
            {snapshot.exposureDecisionLadder.map((step, index) => (
              <div key={step.key} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950">
                    {index + 1}. {step.label}
                  </p>
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-500">
                    {step.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{step.description}</p>
                <p className="mt-2 text-xs text-slate-500">Best for: {step.idealFor}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-white/90 bg-white/88 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Registry-Driven Runtime</p>
          <div className="mt-4 space-y-3">
            {snapshot.registryCatalog.map((registry) => (
              <div key={registry.name} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-950">{registry.name}</p>
                <p className="mt-1 text-sm text-slate-600">{registry.purpose}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {registry.contents} • {registry.authority}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-white/90 bg-white/88 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Bridge Continuity</p>
          <div className="mt-4 space-y-3">
            {[
              ["Freeze", snapshot.continuityStatus.freeze.status, snapshot.continuityStatus.freeze.detail],
              ["Mirror", snapshot.continuityStatus.mirror.status, snapshot.continuityStatus.mirror.detail],
              ["Recovery", snapshot.continuityStatus.recovery.status, snapshot.continuityStatus.recovery.detail],
            ].map(([label, status, detail]) => (
              <div key={label} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950">{label}</p>
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-500">
                    {status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-cyan-200 bg-cyan-50/70 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.06)]">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-700">Live Runtime</p>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <div className="rounded-[22px] border border-cyan-100 bg-white/90 px-4 py-3">
              {snapshot.packets.length} packets persisted locally
            </div>
            <div className="rounded-[22px] border border-cyan-100 bg-white/90 px-4 py-3">
              {snapshot.wrapperRegistry.filter((entry) => entry.status === "live").length} live wrappers and{" "}
              {snapshot.wrapperRegistry.filter((entry) => entry.status === "prepared").length} prepared wrapper paths
            </div>
            <div className="rounded-[22px] border border-cyan-100 bg-white/90 px-4 py-3">
              {snapshot.ledgerEvents.length} append-only ledger events in local storage
            </div>
            <div className="rounded-[22px] border border-cyan-100 bg-white/90 px-4 py-3">
              Ollama state is {snapshot.ollamaConfig.handshakeStatus}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
