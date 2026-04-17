import type { DashboardSnapshot } from "@/lib/spidernet/types";

type ObservatoryBoardProps = {
  snapshot: DashboardSnapshot;
};

export function ObservatoryBoard({ snapshot }: ObservatoryBoardProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_380px]">
      <section className="space-y-4">
        <div className="rounded-[30px] border border-white/90 bg-white/88 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Observatory signals</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {snapshot.observatorySignals.map((signal) => (
              <div key={signal.id} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950">{signal.title}</p>
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-500">
                    {signal.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{signal.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-white/90 bg-white/88 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Validation streams</p>
          <div className="mt-4 space-y-3">
            {snapshot.validationPackets.map((packet) => (
              <article key={packet.packetId} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950">{packet.packetId}</p>
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-500">
                    {packet.gatekeeper}
                  </span>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-3 text-sm text-slate-600">
                  <div className="rounded-[18px] border border-slate-200 bg-white px-3 py-2">
                    Tests: {packet.testStreams.join(", ")}
                  </div>
                  <div className="rounded-[18px] border border-slate-200 bg-white px-3 py-2">
                    Simulation: {packet.simulationStreams.join(", ")}
                  </div>
                  <div className="rounded-[18px] border border-slate-200 bg-white px-3 py-2">
                    Audit: {packet.auditStreams.join(", ")}
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Definition of done: {packet.definitionOfDone.join(", ")}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4">
        <div className="rounded-[30px] border border-white/90 bg-white/88 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Tool score memory</p>
          <div className="mt-4 space-y-3">
            {snapshot.scoreMemory.map((score) => (
              <div key={score.id} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950">{score.tool}</p>
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-500">
                    {score.successRate}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Cost {score.cost} • Latency {score.latency} • Rework {score.reworkNeeded}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Best task family: {score.bestTaskFamily}. Failure type: {score.failureType}.
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-cyan-200 bg-cyan-50/70 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.06)]">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-700">Brain and recovery posture</p>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <div className="rounded-[22px] border border-cyan-100 bg-white/90 px-4 py-3">
              Ollama: Ollama handshake is {snapshot.ollamaConfig.handshakeStatus} at {snapshot.ollamaConfig.endpoint}. {snapshot.ollamaConfig.note}
            </div>
            <div className="rounded-[22px] border border-cyan-100 bg-white/90 px-4 py-3">
              Freeze: {snapshot.continuityStatus.freeze.detail}
            </div>
            <div className="rounded-[22px] border border-cyan-100 bg-white/90 px-4 py-3">
              Mirror: {snapshot.continuityStatus.mirror.detail}
            </div>
            <div className="rounded-[22px] border border-cyan-100 bg-white/90 px-4 py-3">
              Recovery: {snapshot.continuityStatus.recovery.detail}
            </div>
            <div className="rounded-[22px] border border-cyan-100 bg-white/90 px-4 py-3">
              Guardrail: {snapshot.continuityStatus.guardrailNote}
            </div>
            {snapshot.brainPosture ? (
              <div className="rounded-[22px] border border-cyan-100 bg-white/90 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-700">
                  Tier posture (file-backed)
                </p>
                <div className="mt-2 space-y-1 text-xs text-slate-600">
                  {snapshot.brainPosture.tiers.map((tier) => (
                    <div key={tier.tier} className="flex items-center justify-between gap-3">
                      <span className="font-mono text-slate-700">{tier.tier}</span>
                      <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2 py-0.5">
                        {tier.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
