import type { DashboardSnapshot } from "@/lib/spidernet/types";

type InputDataBoardProps = {
  snapshot: DashboardSnapshot;
};

export function InputDataBoard({ snapshot }: InputDataBoardProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_380px]">
      <section className="space-y-4">
        <div className="rounded-[30px] border border-white/90 bg-white/88 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.08)]">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div className="space-y-4">
              <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Locked Purpose</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  Capture first, route later
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Dash 001 is where a task becomes a packet. It captures objective, classifications, routes, vault targets, and attachments before any routing recommendation is trusted.
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <form action="/api/spidernet/intake" method="post">
                    <button
                      type="submit"
                      className="rounded-full border border-slate-950 bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                    >
                      Create Dash 001 intake packet
                    </button>
                  </form>
                  <div className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
                    Writes intake packet + ledger event to local runtime storage
                  </div>
                </div>
              </div>

              <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Intake Packets</p>
                <div className="mt-4 space-y-3">
                  {snapshot.intakePackets.map((packet) => (
                    <article key={packet.packetId} className="rounded-[22px] border border-slate-200 bg-white p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-950 px-2.5 py-1 text-xs font-medium text-white">
                          {packet.packetId}
                        </span>
                        {packet.classifications.map((item) => (
                          <span
                            key={item}
                            className="rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-700"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-700">{packet.objective}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                        {packet.routes.map((route) => (
                          <span key={route} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">
                            route:{route}
                          </span>
                        ))}
                        {packet.vaultTargets.map((route) => (
                          <span
                            key={`${packet.packetId}-${route}`}
                            className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-amber-700"
                          >
                            vault:{route}
                          </span>
                        ))}
                      </div>
                      <div className="mt-3 rounded-[18px] border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                        Intake modes: {packet.intakeModes.join(", ") || "none"}. Attachments: {packet.attachments.join(", ") || "none"}.
                      </div>
                    </article>
                  ))}

                  {snapshot.intakePackets.length === 0 ? (
                    <div className="rounded-[22px] border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
                      No intake packets exist yet. Use the button above to create the first live Dash 001 intake packet.
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Policy Route Preview</p>
              <div className="mt-4 space-y-3">
                {snapshot.policyDecisions.map((decision) => (
                  <div key={decision.packetId} className="rounded-[22px] border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-950">{decision.packetId}</p>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-500">
                        {decision.exposureDecision}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      Suggested destination: {decision.boardTitle} through the {decision.lane} lane.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {decision.routeFamilies.map((route) => (
                        <span
                          key={`${decision.packetId}-${route}`}
                          className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-500"
                        >
                          {route}
                        </span>
                      ))}
                    </div>
                    {decision.holdReason ? (
                      <div className="mt-3 rounded-[18px] border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                        Hold reason: {decision.holdReason}
                      </div>
                    ) : (
                      <div className="mt-3 rounded-[18px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                        Routing can proceed after manager review.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[30px] border border-white/90 bg-white/88 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Typed Packet Model</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Six packet types, one handoff chain
              </h2>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-600">
              durable local persistence
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {snapshot.packetTemplates.map((template) => (
              <div key={template.kind} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-950">{template.name}</p>
                <p className="mt-2 text-sm text-slate-600">{template.purpose}</p>
                <p className="mt-3 text-xs text-slate-500">Required: {template.requiredFields.join(", ")}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                  {template.persistenceTarget} {"->"} {template.nextHandoff}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4">
        <div className="rounded-[30px] border border-white/90 bg-white/88 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Policy Checks</p>
          <div className="mt-4 space-y-3">
            {snapshot.policyDecisions[0]?.policyDecisions.map((policy) => (
              <div key={policy.checkId} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950">{policy.name}</p>
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-500">
                    {policy.outcome}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{policy.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-cyan-200 bg-cyan-50/70 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.06)]">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-700">Local Persistence Targets</p>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <div className="rounded-[22px] border border-cyan-100 bg-white/90 px-4 py-3">
              Packets: `artifacts/runtime/spidernet/packets`
            </div>
            <div className="rounded-[22px] border border-cyan-100 bg-white/90 px-4 py-3">
              Vaults: `artifacts/runtime/spidernet/vaults`
            </div>
            <div className="rounded-[22px] border border-cyan-100 bg-white/90 px-4 py-3">
              Ledger: `artifacts/runtime/spidernet/ledger`
            </div>
            <div className="rounded-[22px] border border-cyan-100 bg-white/90 px-4 py-3">
              Registries: `artifacts/runtime/spidernet/registries`
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
