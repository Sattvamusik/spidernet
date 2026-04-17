import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

import {
  ensureDir,
  logStage,
  writeJsonAtomic,
  type CompactIngestPacket,
} from "@/lib/spidernet/ingest";
import { appendPacket } from "@/lib/spidernet/storage";
import type { BoardId } from "@/lib/spidernet/types";
import type { RouteDecisionRecord } from "@/lib/spidernet/filtration";

const BASE = path.join(process.cwd(), "artifacts/runtime/spidernet/ftd");

export const FTD_PATHS = {
  base: BASE,
  seedsDir: path.join(BASE, "seeds"),
  dispatchedIndex: path.join(BASE, "dispatched.json"),
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

  dispatchSeed(seed);

  return { seed, seedRef };
}

type DispatchPacketKind = "research" | "execution" | "approval";

type DispatchIndexEntry = {
  seedId: string;
  packetKind: DispatchPacketKind;
  packetId: string;
  dispatchedAt: string;
};

type DispatchIndex = Record<string, DispatchIndexEntry>;

export type DispatchResult =
  | { duplicate: true; entry: DispatchIndexEntry }
  | { duplicate: false; skipped: true; reason: "archive" }
  | { duplicate: false; skipped: false; entry: DispatchIndexEntry };

function readDispatchedIndex(): DispatchIndex {
  try {
    if (!fs.existsSync(FTD_PATHS.dispatchedIndex)) return {};
    const raw = fs.readFileSync(FTD_PATHS.dispatchedIndex, "utf8").trim();
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as DispatchIndex) : {};
  } catch {
    return {};
  }
}

function pickPacketKind(nextStage: WorkflowSeedStage): DispatchPacketKind | null {
  switch (nextStage) {
    case "research":
      return "research";
    case "execution":
      return "execution";
    case "approval":
      return "approval";
    case "archive":
      return null;
    default:
      return null;
  }
}

function composeDispatchRecord(
  seed: WorkflowSeed,
  packetKind: DispatchPacketKind,
  packetId: string,
  dispatchedAt: string,
): Record<string, unknown> {
  return {
    packetId,
    kind: packetKind,
    status: "captured",
    createdAt: dispatchedAt,
    manager: "saarthi",
    sourceSeedId: seed.seedId,
    sourcePacketId: seed.sourceHash,
    boardId: seed.boardId,
    boardTitle: seed.boardTitle,
    lane: seed.lane,
    classifications: seed.classifications,
    routeFamilies: seed.routeFamilies,
    vaultTargets: seed.vaultTargets,
  };
}

export function dispatchSeed(seed: WorkflowSeed): DispatchResult {
  const index = readDispatchedIndex();
  const existing = index[seed.sourceHash];
  if (existing) {
    logStage("ftd_dispatch_cache_hit", {
      hash: seed.sourceHash,
      seedId: existing.seedId,
      packetKind: existing.packetKind,
      packetId: existing.packetId,
    });
    return { duplicate: true, entry: existing };
  }

  const packetKind = pickPacketKind(seed.nextStage);
  if (!packetKind) {
    logStage("ftd_dispatch_skipped", {
      hash: seed.sourceHash,
      seedId: seed.seedId,
      reason: "archive",
    });
    return { duplicate: false, skipped: true, reason: "archive" };
  }

  const dispatchedAt = new Date().toISOString();
  const packetId = `${packetKind}-${seed.seedId}`;
  const record = composeDispatchRecord(seed, packetKind, packetId, dispatchedAt);
  appendPacket(packetKind, record);

  const entry: DispatchIndexEntry = {
    seedId: seed.seedId,
    packetKind,
    packetId,
    dispatchedAt,
  };
  index[seed.sourceHash] = entry;
  ensureDir(FTD_PATHS.base);
  writeJsonAtomic(FTD_PATHS.dispatchedIndex, index);

  logStage("ftd_dispatched", {
    hash: seed.sourceHash,
    seedId: seed.seedId,
    packetKind,
    packetId,
  });
  return { duplicate: false, skipped: false, entry };
}
