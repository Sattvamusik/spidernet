import "server-only";

import {
  boardRegistry,
  compatibilityRegistry,
  exposureDecisionLadder,
  laneRegistry,
  packetTemplateRegistry,
  registryCatalog,
  researchToolRegistry,
  routeFamilyRegistry,
  specialistRegistry,
} from "@/lib/spidernet/architecture";
import { evaluateRoutingDecision } from "@/lib/spidernet/policy";
import { loadRuntimeStorage } from "@/lib/spidernet/storage";
import type {
  DashboardSnapshot,
  IntakePacket,
  ManagerSynthesis,
  ObservatorySignal,
  QuickStat,
  ReadinessGate,
  RoutingDecision,
} from "@/lib/spidernet/types";

function buildManagerSynthesis(
  intakePackets: IntakePacket[],
  policyDecisions: RoutingDecision[],
): ManagerSynthesis {
  const recommendedDecision =
    policyDecisions.find((decision) => decision.executionAllowed) ?? policyDecisions[0];
  const buildPacket = intakePackets.find((packet) => packet.classifications.includes("build"));
  const researchPacket = intakePackets.find((packet) => packet.classifications.includes("research"));
  const activeHolds = policyDecisions
    .filter((decision) => !decision.executionAllowed && decision.holdReason)
    .map((decision) => `${decision.packetId}: ${decision.holdReason}`);

  return {
    manager: "Saarthi",
    consensus:
      "Keep the white web dashboard as the only product family, with six locked boards and registry-driven workflow rules.",
    conflict:
      "Browser automation and desktop automation stay in the model, but they remain prepared paths rather than live defaults.",
    safestPath:
      "Route all work through typed packets, enforce policy before routing, and fall back to manual hold whenever wrapper confidence is weak.",
    fastestViablePath:
      buildPacket
        ? `Move ${buildPacket.packetId} into Dash 004 through the CLI path, then prove the result in Dash 005.`
        : "No active build packet is waiting for execution.",
    lowestCostViablePath:
      "Use the local JSON persistence layer under artifacts/runtime/spidernet and avoid introducing new dependencies.",
    bestLongTermPath:
      researchPacket
        ? `Keep ${researchPacket.packetId} in Dash 002 so research informs routing without leaking into live execution.`
        : "Keep the web shell as the durable operating surface and evolve wrappers only when observability evidence is strong.",
    recommendedBoard: recommendedDecision?.boardId ?? "dash-003-hive-agents",
    recommendedLane: recommendedDecision?.lane ?? "Architect",
    recommendedExposure: recommendedDecision?.exposureDecision ?? "manual_hold",
    whyNow:
      "The current phase is about making the operating law visible and durable in the web repo, not broadening tool reach.",
    activeHolds,
  };
}

function buildReadinessGates(
  snapshot: Awaited<ReturnType<typeof loadRuntimeStorage>>,
  policyDecisions: RoutingDecision[],
): ReadinessGate[] {
  const liveExposureCount = snapshot.wrapperRegistry.filter((entry) => entry.status === "live").length;

  return [
    {
      id: "gate-board-model",
      name: "Locked six-board purpose model",
      owner: "Saarthi",
      status: boardRegistry.length === 6 ? "ready" : "hold",
      evidence: "Each board is registered once with a fixed purpose lock and route.",
    },
    {
      id: "gate-policy-routing",
      name: "Policy-before-routing",
      owner: "Chitragupt",
      status: policyDecisions.length > 0 ? "ready" : "hold",
      evidence: "Routing decisions are computed from intake packets before a board path is presented.",
    },
    {
      id: "gate-persistence",
      name: "Durable local persistence",
      owner: "Builder lane",
      status: snapshot.passPackets.length > 0 ? "ready" : "review",
      evidence: "Packets, vaults, ledger, wrappers, skills, and scores are stored under artifacts/runtime/spidernet.",
    },
    {
      id: "gate-wrappers",
      name: "Wrapper registry coverage",
      owner: "Operator lane",
      status: liveExposureCount >= 3 ? "ready" : "review",
      evidence: `${liveExposureCount} live exposure paths are available, with prepared paths held for later activation.`,
    },
    {
      id: "gate-score-memory",
      name: "Tool score memory",
      owner: "Dash 006",
      status: snapshot.scoreMemory.length > 0 ? "ready" : "review",
      evidence: `${snapshot.scoreMemory.length} score-memory records are persisted locally for routing decisions.`,
    },
    {
      id: "gate-ollama",
      name: "Ollama readiness",
      owner: "Operator lane",
      status: snapshot.ollamaConfig.handshakeStatus === "ready" ? "ready" : "prepared",
      evidence: snapshot.ollamaConfig.note,
    },
  ];
}

function buildObservatorySignals(
  snapshot: Awaited<ReturnType<typeof loadRuntimeStorage>>,
  policyDecisions: RoutingDecision[],
): ObservatorySignal[] {
  const activeHoldCount = policyDecisions.filter((decision) => !decision.executionAllowed).length;
  const preparedWrappers = snapshot.wrapperRegistry.filter((entry) => entry.status === "prepared").length;

  return [
    {
      id: "obs-routing",
      title: "Policy-before-routing",
      status: policyDecisions.length > 0 ? "healthy" : "degraded",
      note: `${policyDecisions.length} routing decisions were generated from intake packets before execution routing.`,
    },
    {
      id: "obs-research-lock",
      title: "Dash 002 research lock",
      status: snapshot.researchPackets.length > 0 ? "healthy" : "watch",
      note: "Dash 002 remains limited to comparison, scoring, and manager evidence.",
    },
    {
      id: "obs-exposure",
      title: "Exposure ladder posture",
      status: preparedWrappers > 0 ? "watch" : "healthy",
      note: `${preparedWrappers} exposure paths remain prepared instead of live, which preserves the white web app as the main product surface.`,
    },
    {
      id: "obs-holds",
      title: "Manual hold fallback",
      status: activeHoldCount > 0 ? "watch" : "healthy",
      note: `${activeHoldCount} packets currently resolve to a hold or deferred route.`,
    },
    {
      id: "obs-memory",
      title: "Local memory durability",
      status: snapshot.ledgerEvents.length > 0 && snapshot.vaultEntries.length > 0 ? "healthy" : "degraded",
      note: `${snapshot.vaultEntries.length} vault entries and ${snapshot.ledgerEvents.length} ledger events are available locally.`,
    },
    {
      id: "obs-ollama",
      title: "Ollama preparation",
      status: snapshot.ollamaConfig.handshakeStatus === "ready" ? "healthy" : "prepared",
      note: snapshot.ollamaConfig.note,
    },
  ];
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const runtime = await loadRuntimeStorage();
  const packets = [
    ...runtime.intakePackets,
    ...runtime.researchPackets,
    ...runtime.approvalPackets,
    ...runtime.executionPackets,
    ...runtime.validationPackets,
    ...runtime.passPackets,
  ];

  const policyDecisions = runtime.intakePackets.map((packet) =>
    evaluateRoutingDecision(packet, runtime.wrapperRegistry),
  );

  return {
    packets,
    intakePackets: runtime.intakePackets,
    researchPackets: runtime.researchPackets,
    approvalPackets: runtime.approvalPackets,
    executionPackets: runtime.executionPackets,
    validationPackets: runtime.validationPackets,
    passPackets: runtime.passPackets,
    vaultEntries: runtime.vaultEntries,
    ledgerEvents: runtime.ledgerEvents,
    wrapperRegistry: runtime.wrapperRegistry,
    skillRegistry: runtime.skillRegistry,
    scoreMemory: runtime.scoreMemory,
    policyDecisions,
    managerSynthesis: buildManagerSynthesis(runtime.intakePackets, policyDecisions),
    readinessGates: buildReadinessGates(runtime, policyDecisions),
    researchTools: researchToolRegistry,
    specialists: specialistRegistry,
    compatibilityRules: compatibilityRegistry,
    observatorySignals: buildObservatorySignals(runtime, policyDecisions),
    ollamaConfig: runtime.ollamaConfig,
    exposureDecisionLadder,
    routeFamilies: routeFamilyRegistry,
    laneModel: laneRegistry,
    packetTemplates: packetTemplateRegistry,
    registryCatalog,
    boardModel: boardRegistry,
  };
}

export function getBoardQuickStats(snapshot: DashboardSnapshot, boardId?: string): QuickStat[] {
  if (!boardId) {
    return [
      { label: "Locked Boards", value: "6" },
      { label: "Packets", value: String(snapshot.packets.length) },
      { label: "Live Wrappers", value: String(snapshot.wrapperRegistry.filter((entry) => entry.status === "live").length) },
      { label: "Local Ledger", value: String(snapshot.ledgerEvents.length) },
    ];
  }

  switch (boardId) {
    case "dash-001-input-data":
      return [
        { label: "Intake Packets", value: String(snapshot.intakePackets.length) },
        { label: "Policy Checks", value: String(snapshot.policyDecisions[0]?.policyDecisions.length ?? 0) },
        { label: "Packet Types", value: String(snapshot.packetTemplates.length) },
        { label: "Vault Routes", value: String(snapshot.routeFamilies.length) },
      ];
    case "dash-002-tools-store":
      return [
        { label: "Research Tools", value: String(snapshot.researchTools.length) },
        { label: "Research Packets", value: String(snapshot.researchPackets.length) },
        { label: "Exposure Steps", value: String(snapshot.exposureDecisionLadder.length) },
        { label: "Research Lock", value: "Active" },
      ];
    case "dash-003-hive-agents":
      return [
        { label: "Routing Decisions", value: String(snapshot.policyDecisions.length) },
        { label: "Readiness Gates", value: String(snapshot.readinessGates.length) },
        { label: "Approval Packets", value: String(snapshot.approvalPackets.length) },
        { label: "Manager", value: snapshot.managerSynthesis.manager },
      ];
    case "dash-004-setu-bridge":
      return [
        { label: "Specialists", value: String(snapshot.specialists.length) },
        { label: "Wrappers", value: String(snapshot.wrapperRegistry.length) },
        { label: "Skills", value: String(snapshot.skillRegistry.length) },
        { label: "Registries", value: String(snapshot.registryCatalog.length) },
      ];
    case "dash-005-observatory":
      return [
        { label: "Signals", value: String(snapshot.observatorySignals.length) },
        { label: "Validation Packets", value: String(snapshot.validationPackets.length) },
        { label: "Prepared Paths", value: String(snapshot.wrapperRegistry.filter((entry) => entry.status === "prepared").length) },
        { label: "Ready Gates", value: String(snapshot.readinessGates.filter((gate) => gate.status === "ready").length) },
      ];
    case "dash-006-memory-ledger":
      return [
        { label: "Vault Entries", value: String(snapshot.vaultEntries.length) },
        { label: "Ledger Events", value: String(snapshot.ledgerEvents.length) },
        { label: "Score Memory", value: String(snapshot.scoreMemory.length) },
        { label: "Persistence Files", value: "11" },
      ];
    default:
      return [
        { label: "Locked Boards", value: "6" },
        { label: "Packets", value: String(snapshot.packets.length) },
        { label: "Live Wrappers", value: String(snapshot.wrapperRegistry.filter((entry) => entry.status === "live").length) },
        { label: "Local Ledger", value: String(snapshot.ledgerEvents.length) },
      ];
  }
}
