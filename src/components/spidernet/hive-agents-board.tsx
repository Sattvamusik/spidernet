import { getBoardById } from "@/lib/spidernet/router";
import type { DashboardSnapshot } from "@/lib/spidernet/types";

type HiveAgentsBoardProps = {
  snapshot: DashboardSnapshot;
};

export function HiveAgentsBoard({ snapshot }: HiveAgentsBoardProps) {
  const recommendedBoard = getBoardById(snapshot.managerSynthesis.recommendedBoard);

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_380px]">
      <section className="space-y-4">
        <div className="rounded-[30px] border border-white/90 bg-white/88 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Saarthi manager synthesis</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Explicit manager logic stays visible
              </h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Saarthi turns research, policy, routes, and wrapper posture into one clear operating recommendation before build work proceeds.
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              {snapshot.policyDecisions.length} routing decisions
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {[
              ["Consensus", snapshot.managerSynthesis.consensus],
              ["Conflict", snapshot.managerSynthesis.conflict],
              ["Safest path", snapshot.managerSynthesis.safestPath],
              ["Fastest viable path", snapshot.managerSynthesis.fastestViablePath],
              ["Lowest-cost path", snapshot.managerSynthesis.lowestCostViablePath],
              ["Best long-term path", snapshot.managerSynthesis.bestLongTermPath],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-white/90 bg-white/88 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Routing outcomes</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Policy decisions before execution
              </h2>
            </div>
            <div className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-sm font-medium text-cyan-700">
              recommended board: {recommendedBoard?.shortTitle ?? "Unavailable"}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {snapshot.policyDecisions.map((decision) => (
              <article key={decision.packetId} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{decision.packetId}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {decision.boardTitle} through {decision.lane}
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-500">
                    {decision.executionAllowed ? "execution open" : "hold"}
                  </span>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {decision.policyDecisions.map((policy) => (
                    <div
                      key={`${decision.packetId}-${policy.checkId}`}
                      className="rounded-[18px] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
                    >
                      <span className="font-medium text-slate-900">{policy.name}:</span> {policy.outcome}
                    </div>
                  ))}
                </div>
                {decision.holdReason ? (
                  <div className="mt-3 rounded-[18px] border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {decision.holdReason}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4">
        <div className="rounded-[30px] border border-white/90 bg-white/88 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Chitragupt readiness gates</p>
          <div className="mt-4 space-y-3">
            {snapshot.readinessGates.map((gate) => (
              <div key={gate.id} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950">{gate.name}</p>
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-500">
                    {gate.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{gate.evidence}</p>
                <p className="mt-2 text-xs text-slate-500">Owner: {gate.owner}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-cyan-200 bg-cyan-50/70 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.06)]">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-700">Manager decision summary</p>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <div className="rounded-[22px] border border-cyan-100 bg-white/90 px-4 py-3">
              Recommended lane: {snapshot.managerSynthesis.recommendedLane}
            </div>
            <div className="rounded-[22px] border border-cyan-100 bg-white/90 px-4 py-3">
              Recommended exposure: {snapshot.managerSynthesis.recommendedExposure}
            </div>
            <div className="rounded-[22px] border border-cyan-100 bg-white/90 px-4 py-3">
              Why now: {snapshot.managerSynthesis.whyNow}
            </div>
            <div className="rounded-[22px] border border-cyan-100 bg-white/90 px-4 py-3">
              Active holds:{" "}
              {snapshot.managerSynthesis.activeHolds.length > 0
                ? snapshot.managerSynthesis.activeHolds.join(" | ")
                : "No active holds"}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
