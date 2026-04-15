"use client";

import { useMemo, useState } from "react";

import type { DashboardSnapshot, ResearchToolProfile } from "@/lib/spidernet/types";

type ToolsStoreBoardProps = {
  snapshot: DashboardSnapshot;
};

const fitLabels = [
  ["apiSuitability", "API"],
  ["cliSuitability", "CLI"],
  ["browserSuitability", "Browser"],
  ["desktopSuitability", "Desktop"],
] as const;

export function ToolsStoreBoard({ snapshot }: ToolsStoreBoardProps) {
  const [query, setQuery] = useState("");
  const [health, setHealth] = useState<"all" | ResearchToolProfile["health"]>("all");

  const filteredTools = useMemo(() => {
    return snapshot.researchTools
      .filter((tool) => (health === "all" ? true : tool.health === health))
      .filter((tool) => {
        const haystack = `${tool.name} ${tool.specialty} ${tool.bestUse} ${tool.taskFamily}`.toLowerCase();
        return haystack.includes(query.toLowerCase());
      })
      .sort((left, right) => right.worthDoingScore - left.worthDoingScore);
  }, [health, query, snapshot.researchTools]);

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_380px]">
      <section className="space-y-4">
        <div className="rounded-[30px] border border-white/90 bg-white/88 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.08)]">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <label className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="text-xs uppercase tracking-[0.22em] text-slate-500">Research search</span>
              <input
                className="mt-2 w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search tools, specialties, best use, or task family"
              />
            </label>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Tool health</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(["all", "healthy", "watch", "degraded"] as const).map((item) => (
                  <button
                    key={item}
                    onClick={() => setHealth(item)}
                    className={`rounded-full px-3 py-1.5 text-sm transition ${
                      health === item
                        ? "bg-slate-950 text-white"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[30px] border border-white/90 bg-white/88 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Research-Only Scope</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Compare first. Do not execute here.
              </h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Dash 002 is locked to evaluation, viability scoring, and exposure advice. It feeds Saarthi with evidence but does not perform live build work.
              </p>
            </div>
            <div className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-sm font-medium text-cyan-700">
              {filteredTools.length} visible tools
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {filteredTools.map((tool) => (
              <article key={tool.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-950">{tool.name}</p>
                    <p className="mt-1 text-sm text-slate-600">{tool.specialty}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-500">
                      worth {tool.worthDoingScore}/10
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-500">
                      bottleneck {tool.bottleneckRemovalScore}/10
                    </span>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700">
                      {tool.health}
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">{tool.bestUse}</p>
                <p className="mt-2 text-sm text-slate-500">Limitations: {tool.limitations}</p>
                <div className="mt-4 grid gap-2 md:grid-cols-2">
                  {fitLabels.map(([label, title]) => (
                    <div key={label} className="rounded-[18px] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                      <span className="font-medium text-slate-900">{title}:</span> {tool[label]}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4">
        <div className="rounded-[30px] border border-white/90 bg-white/88 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Saarthi inputs</p>
          <div className="mt-4 space-y-3">
            {snapshot.researchPackets.map((packet) => (
              <div key={packet.packetId} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950">{packet.packetId}</p>
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-500">
                    {packet.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{packet.question}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {packet.dispatchedTools.map((tool) => (
                    <span key={tool} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-500">
                      {tool}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Dimensions: {packet.evaluationDimensions.join(", ")}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-white/90 bg-white/88 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Exposure ladder</p>
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
                <p className="mt-2 text-xs text-slate-500">Ideal for: {step.idealFor}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
