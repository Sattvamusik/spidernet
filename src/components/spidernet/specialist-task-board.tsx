import type { DashboardSnapshot } from "@/lib/spidernet/types";

type SpecialistTaskBoardProps = {
  snapshot: DashboardSnapshot;
};

export function SpecialistTaskBoard({ snapshot }: SpecialistTaskBoardProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_380px]">
      <section className="space-y-4">
        <div className="rounded-[30px] border border-white/90 bg-white/88 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Specialist task execution</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Registry-driven execution, not ad hoc work
              </h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Dash 004 turns approved work into explicit specialist handoffs, wrapper choices, and skill usage while keeping the current white shell clean and readable.
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              {snapshot.executionPackets.length} execution packets
            </div>
          </div>
        </div>

        <div className="rounded-[30px] border border-white/90 bg-white/88 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Specialist contracts</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {snapshot.specialists.map((specialist) => (
              <div key={specialist.id} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-950">{specialist.name}</p>
                <p className="mt-1 text-sm text-slate-600">{specialist.workProfile}</p>
                <p className="mt-3 text-sm text-slate-700">Specialty: {specialist.specialty}</p>
                <p className="mt-3 text-xs text-slate-500">Input contract: {specialist.inputContract}</p>
                <p className="mt-2 text-xs text-slate-500">Output contract: {specialist.outputContract}</p>
                <p className="mt-2 text-xs text-slate-500">Safe-use notes: {specialist.safeUseNotes}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-white/90 bg-white/88 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Wrapper registry</p>
          <div className="mt-4 space-y-3">
            {snapshot.wrapperRegistry.map((wrapper) => (
              <article key={wrapper.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{wrapper.software}</p>
                    <p className="mt-1 text-sm text-slate-600">{wrapper.why}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-500">
                      {wrapper.exposurePath}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-500">
                      {wrapper.status}
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-600">Guardrails: {wrapper.guardrails}</p>
                <p className="mt-2 text-xs text-slate-500">
                  Boards: {wrapper.linkedBoards.join(", ")} • Packets: {wrapper.linkedPacketKinds.join(", ")}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4">
        <div className="rounded-[30px] border border-white/90 bg-white/88 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Skill registry</p>
          <div className="mt-4 space-y-3">
            {snapshot.skillRegistry.map((skill) => (
              <div key={skill.id} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950">{skill.skillName}</p>
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-500">
                    {skill.currentState}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{skill.purpose}</p>
                <p className="mt-2 text-xs text-slate-500">Discovery: {skill.discovery}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-white/90 bg-white/88 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Compatibility registry</p>
          <div className="mt-4 space-y-3">
            {snapshot.compatibilityRules.map((rule) => (
              <div key={rule.id} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-950">{rule.pairing}</p>
                <p className="mt-2 text-sm text-slate-600">{rule.worksTogether}</p>
                <p className="mt-2 text-xs text-slate-500">
                  Review: {rule.reviewPath} • Handoff: {rule.handoffPath}
                </p>
                <p className="mt-2 text-xs text-slate-500">Caution: {rule.caution}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-cyan-200 bg-cyan-50/70 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.06)]">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-700">Execution posture</p>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            {snapshot.executionPackets.map((packet) => (
              <div key={packet.packetId} className="rounded-[22px] border border-cyan-100 bg-white/90 px-4 py-3">
                {packet.packetId}: {packet.stageOwner} using {packet.toolExposureDecision} {"->"} next stage{" "}
                {packet.nextStage}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
