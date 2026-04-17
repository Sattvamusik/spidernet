import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

import { evaluateRoutingDecision } from "@/lib/spidernet/policy";
import {
  INGEST_PATHS,
  ensureDir,
  logStage,
  readCompactPacket,
  readSeenEntry,
  updateSeenRouteRef,
  writeJsonAtomic,
  type CompactIngestPacket,
} from "@/lib/spidernet/ingest";
import { appendLedgerEvent, upsertVaultEntry, type LedgerEventRecord } from "@/lib/spidernet/storage";
import { seedWorkflow } from "@/lib/spidernet/ftd";
import type { BoardId, IntakePacket, RoutingDecision } from "@/lib/spidernet/types";

export type RouteDecisionRecord = RoutingDecision & {
  hash: string;
  classifications: string[];
  vaultTargets: string[];
  decidedAt: string;
};

export type FilterResult = {
  decision: RouteDecisionRecord;
  routeRef: string;
  cacheHit: boolean;
};

export function classify(packet: CompactIngestPacket): string[] {
  const text = `${packet.objectivePreview}`.toLowerCase();
  const classifications: string[] = [];
  if (text.includes("research") || text.includes("compare") || text.includes("evaluate")) {
    classifications.push("research");
  }
  if (text.includes("build") || text.includes("implement")) {
    classifications.push("build");
  }
  if (text.includes("rule")) {
    classifications.push("rule");
  }
  if (text.includes("idea")) {
    classifications.push("idea");
  }
  if (text.includes("plan") || text.includes("phase")) {
    classifications.push("blueprint");
  }
  if (classifications.length === 0) {
    classifications.push("general");
  }
  return classifications;
}

function deriveVaultTargets(boardId: BoardId): string[] {
  switch (boardId) {
    case "dash-002-tools-store":
      return ["/boards/memory-ledger"];
    case "dash-004-setu-bridge":
      return ["/boards/memory-ledger", "/boards/observatory"];
    case "dash-006-memory-ledger":
      return ["/boards/memory-ledger"];
    default:
      return ["/boards/memory-ledger"];
  }
}

function toIntakePacket(packet: CompactIngestPacket, classifications: string[]): IntakePacket {
  return {
    packetId: packet.hash,
    kind: "intake",
    status: "captured",
    createdAt: packet.createdAt,
    manager: "saarthi",
    source: packet.source,
    objective: packet.objectivePreview,
    classifications,
    routes: [],
    vaultTargets: [],
    intakeModes: ["ingest-v1"],
    attachments: [],
  };
}

function routeRefPath(hash: string): string {
  return path.join(INGEST_PATHS.routeDir, `${hash}.json`);
}

export async function filter(packet: CompactIngestPacket): Promise<FilterResult> {
  const routeRef = routeRefPath(packet.hash);
  const classifications = classify(packet);
  logStage("classified", {
    hash: packet.hash,
    classifications,
    objectiveLen: packet.objectiveLen,
    bodyLen: packet.bodyLen,
  });

  const intakeShape = toIntakePacket(packet, classifications);
  const routingDecision = evaluateRoutingDecision(intakeShape, []);
  const vaultTargets = deriveVaultTargets(routingDecision.boardId);

  const decision: RouteDecisionRecord = {
    ...routingDecision,
    hash: packet.hash,
    classifications,
    vaultTargets,
    decidedAt: new Date().toISOString(),
  };

  ensureDir(INGEST_PATHS.routeDir);
  writeJsonAtomic(routeRef, decision);
  updateSeenRouteRef(packet.hash, routeRef);

  logStage("routed", {
    hash: packet.hash,
    boardId: decision.boardId,
    lane: decision.lane,
    exposureDecision: decision.exposureDecision,
    executionAllowed: decision.executionAllowed,
    holdReason: decision.holdReason ?? null,
    routeFamilies: decision.routeFamilies,
    vaultTargets: decision.vaultTargets,
  });

  if (decision.executionAllowed) {
    await persistAcceptedRoute(packet, decision);
  }

  return { decision, routeRef, cacheHit: false };
}

async function persistAcceptedRoute(
  packet: CompactIngestPacket,
  decision: RouteDecisionRecord,
) {
  const ledgerEventId = `evt-${randomUUID().slice(0, 12)}`;
  const ledgerEvent: LedgerEventRecord = {
    eventId: ledgerEventId,
    type: "packet.routed.accepted",
    packetId: packet.hash,
    detail: `Routed to ${decision.boardId} via ${decision.lane} lane (${decision.exposureDecision}).`,
    createdAt: decision.decidedAt,
  };
  appendLedgerEvent(ledgerEvent);

  const primaryRoute = decision.routeFamilies[0];
  let vaultWritten = false;
  if (primaryRoute) {
    upsertVaultEntry(packet.hash, {
      id: packet.hash,
      route: primaryRoute,
      title: packet.objectivePreview || `Ingest ${packet.hash.slice(0, 8)}`,
      summary: `${decision.boardId} · ${decision.lane} · ${decision.exposureDecision}`,
      sourcePacketId: packet.hash,
      status: "live",
      updatedAt: decision.decidedAt,
    });
    vaultWritten = true;
  }

  logStage("memory_feed_written", {
    hash: packet.hash,
    ledgerEventId,
    vaultWritten,
  });

  await seedWorkflow(packet, decision);
}

export function reuseRoute(hash: string): FilterResult | null {
  const entry = readSeenEntry(hash);
  if (!entry?.routeRef) return null;
  let decision: RouteDecisionRecord;
  try {
    decision = JSON.parse(fs.readFileSync(entry.routeRef, "utf8")) as RouteDecisionRecord;
  } catch {
    return null;
  }
  logStage("route_cache_hit", {
    hash,
    boardId: decision.boardId,
    hitCount: entry.hitCount,
  });
  return { decision, routeRef: entry.routeRef, cacheHit: true };
}

export async function filterFromHash(hash: string): Promise<FilterResult | null> {
  const packet = readCompactPacket(hash);
  if (!packet) return null;
  return filter(packet);
}
