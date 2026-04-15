import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { runCodingFlow } from "@/lib/spidernet/coding-flow";
import { appendLedgerEvent, createDash001IntakePacket, type LedgerEventRecord } from "@/lib/spidernet/storage";

export async function POST(request: Request) {
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

  const intakeRecord = createDash001IntakePacket();
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
