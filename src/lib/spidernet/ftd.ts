import path from "path";
import { randomUUID } from "crypto";

import {
  ensureDir,
  logStage,
  writeJsonAtomic,
  type CompactIngestPacket,
} from "@/lib/spidernet/ingest";
import type { BoardId } from "@/lib/spidernet/types";
import type { RouteDecisionRecord } from "@/lib/spidernet/filtration";

const BASE = path.join(process.cwd(), "artifacts/runtime/spidernet/ftd");

export const FTD_PATHS = {
  base: BASE,
  seedsDir: path.join(BASE, "seeds"),
} as const;

export type WorkflowSeedStage = "research" | "execution" | "approval" | "archive";

export type WorkflowSeed = {
  seedId: string;
  sourceHash: string;
  nextStage: WorkflowSeedStage;
  boardId: BoardId;
  boardTitle: string;
  lane: RouteDecisionRecord["lane"];
  exposureDecision: RouteDecisionRecord["exposureDecision"];
  classifications: string[];
  routeFamilies: RouteDecisionRecord["routeFamilies"];
  vaultTargets: string[];
  status: "seeded";
  createdAt: string;
};

export type SeedWorkflowResult = {
  seed: WorkflowSeed;
  seedRef: string;
};

function pickNextStage(boardId: BoardId): WorkflowSeedStage {
  switch (boardId) {
    case "dash-002-tools-store":
      return "research";
    case "dash-004-setu-bridge":
      return "execution";
    case "dash-006-memory-ledger":
      return "archive";
    default:
      return "approval";
  }
}

function seedRefPath(hash: string): string {
  return path.join(FTD_PATHS.seedsDir, `${hash}.json`);
}

export function seedWorkflow(
  packet: CompactIngestPacket,
  decision: RouteDecisionRecord,
): SeedWorkflowResult {
  const seedRef = seedRefPath(packet.hash);
  const nextStage = pickNextStage(decision.boardId);
  const seed: WorkflowSeed = {
    seedId: `seed-${randomUUID().slice(0, 12)}`,
    sourceHash: packet.hash,
    nextStage,
    boardId: decision.boardId,
    boardTitle: decision.boardTitle,
    lane: decision.lane,
    exposureDecision: decision.exposureDecision,
    classifications: decision.classifications,
    routeFamilies: decision.routeFamilies,
    vaultTargets: decision.vaultTargets,
    status: "seeded",
    createdAt: new Date().toISOString(),
  };

  ensureDir(FTD_PATHS.seedsDir);
  writeJsonAtomic(seedRef, seed);
  logStage("ftd_seeded", {
    hash: packet.hash,
    nextStage,
    seedRef,
  });

  return { seed, seedRef };
}
