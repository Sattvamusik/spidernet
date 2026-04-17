import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { runCodingFlow } from "@/lib/spidernet/coding-flow";
import { filter, reuseRoute } from "@/lib/spidernet/filtration";
import { ingest } from "@/lib/spidernet/ingest";
import { appendLedgerEvent, createDash001IntakePacket, type LedgerEventRecord } from "@/lib/spidernet/storage";

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  const objectiveField = formData?.get("objective");
  const bodyField = formData?.get("body");
  const objective = typeof objectiveField === "string" ? objectiveField : undefined;
  const body = typeof bodyField === "string" ? bodyField : undefined;

  const ingestResult = ingest({
    objective,
    body,
    source: "api/spidernet/intake",
  });

  if (ingestResult.duplicate) {
    reuseRoute(ingestResult.packet.hash);
    const dupEvent: LedgerEventRecord = {
      eventId: `evt-${randomUUID().slice(0, 12)}`,
      type: "intake_duplicate_cache_hit",
      packetId: ingestResult.packet.hash,
      detail: `Dash 001 intake duplicate cache hit (hitCount=${ingestResult.hitCount}). No new intake packet was created.`,
      createdAt: new Date().toISOString(),
    };
    appendLedgerEvent(dupEvent);
    return NextResponse.redirect(new URL("/boards/input-data", request.url), 303);
  }

  filter(ingestResult.packet);

  const codingFlow = runCodingFlow({
    actor: "white-web-setu",
    stage: "dash-001-intake",
    objective: "Dash 001 intake packet created from the white SETU UI.",
    routes: ["/boards/input-data"],
    vaultTargets: ["/boards/memory-ledger"],
    proposedAction: "capture-dash-001-intake",
    allowedActors: ["white-web-setu"],
    allowedRoutes: ["/boards/input-data"],
    complexity: "low",
    privacyMode: "local_only",
    localAvailable: false,
    timeoutBudgetMs: 1000,
  });

  if (!codingFlow.ok) {
    console.warn("[spidernet]intake coding flow hold:", codingFlow.holdReason);
  }

  const intakeRecord = createDash001IntakePacket({ objective, body });
  const codingFlowLedgerEvent: LedgerEventRecord = {
    eventId: `evt-${randomUUID().slice(0, 12)}`,
    type: "coding_flow_preflight",
    packetId: intakeRecord.packet.packetId,
    detail: codingFlow.ok
      ? "Dash 001 intake preflight passed and intake packet was captured."
      : `Dash 001 intake preflight held: ${codingFlow.holdReason ?? "unknown reason"}.`,
    createdAt: intakeRecord.packet.createdAt,
  };

  appendLedgerEvent(codingFlowLedgerEvent);
  return NextResponse.redirect(new URL("/boards/input-data", request.url), 303);
}
