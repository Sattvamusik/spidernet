import { NextResponse } from "next/server";
import { runCodingFlow } from "@/lib/spidernet/coding-flow";
import { createDash001IntakePacket } from "@/lib/spidernet/storage";

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

  createDash001IntakePacket();
  return NextResponse.redirect(new URL("/boards/input-data", request.url), 303);
}
