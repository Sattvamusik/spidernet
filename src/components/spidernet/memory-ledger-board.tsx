import type { DashboardSnapshot, RouteFamily } from "@/lib/spidernet/types";

type MemoryLedgerBoardProps = {
  snapshot: DashboardSnapshot;
};

const routeOrder: RouteFamily[] = ["DNA", "RUL", "LIB", "BLP", "FTD"];

const persistenceFiles = [
  "artifacts/runtime/spidernet/packets/intake.json",
  "artifacts/runtime/spidernet/packets/research.json",
  "artifacts/runtime/spidernet/packets/approval.json",
  "artifacts/runtime/spidernet/packets/execution.json",
  "artifacts/runtime/spidernet/packets/validation.json",
  "artifacts/runtime/spidernet/packets/pass.json",
  "artifacts/runtime/spidernet/config/ollama.json",
  "artifacts/runtime/spidernet/registries/wrappers.json",
  "artifacts/runtime/spidernet/registries/skills.json",
  "artifacts/runtime/spidernet/registries/scores.json",
  "artifacts/runtime/spidernet/vaults/index.json",
  "artifacts/runtime/spidernet/ledger/events.json",
];

export function MemoryLedgerBoard({ snapshot }: MemoryLedgerBoardProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_380px]">
      <section className="space-y-4">
        <div className="rounded-[30px] border border-white/90 bg-white/88 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Vault routing model</p>
          <div className="mt-4 grid gap-3">
            {routeOrder.map((route) => (
              <div key={route} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950">{route}</p>
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-500">
                    {snapshot.vaultEntries.filter((entry) => entry.route === route).length} entries
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {snapshot.vaultEntries
                    .filter((entry) => entry.route === route)
                    .map((entry) => (
                      <div key={entry.id} className="rounded-[18px] border border-slate-200 bg-white px-3 py-2">
                        <p className="text-sm font-semibold text-slate-900">{entry.title}</p>
                        <p className="mt-1 text-sm text-slate-600">{entry.summary}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          Source packet: {entry.sourcePacketId} • {entry.status} • {entry.updatedAt}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-white/90 bg-white/88 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Packet persistence</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[
              ["Intake", snapshot.intakePackets.length],
              ["Research", snapshot.researchPackets.length],
              ["Approval", snapshot.approvalPackets.length],
              ["Execution", snapshot.executionPackets.length],
              ["Validation", snapshot.validationPackets.length],
              ["Pass", snapshot.passPackets.length],
            ].map(([label, count]) => (
              <div key={label} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{count}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4">
        <div className="rounded-[30px] border border-white/90 bg-white/88 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Append-only ledger</p>
          <div className="mt-4 space-y-3">
            {snapshot.ledgerEvents.map((event) => (
              <div key={event.id} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950">{event.action}</p>
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-500">
                    {event.id}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {event.actor} • {event.scope} • {event.timestamp}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-white/90 bg-white/88 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Durable local persistence files</p>
          <div className="mt-4 space-y-2">
            {persistenceFiles.map((file) => (
              <div key={file} className="rounded-[18px] border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                {file}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-cyan-200 bg-cyan-50/70 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.06)]">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-700">Live versus prepared</p>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <div className="rounded-[22px] border border-cyan-100 bg-white/90 px-4 py-3">
              Live now: local packet files, vault routing, ledger history, wrapper registry, skill registry, and score memory.
            </div>
            <div className="rounded-[22px] border border-cyan-100 bg-white/90 px-4 py-3">
              Prepared only: Ollama live handshake, browser automation wrapper, desktop automation wrapper.
            </div>
            <div className="rounded-[22px] border border-cyan-100 bg-white/90 px-4 py-3">
              Ollama endpoint: {snapshot.ollamaConfig.endpoint} • model {snapshot.ollamaConfig.model} • {snapshot.ollamaConfig.handshakeStatus}
            </div>
            <div className="rounded-[22px] border border-cyan-100 bg-white/90 px-4 py-3">
              Ollama note: {snapshot.ollamaConfig.note}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
