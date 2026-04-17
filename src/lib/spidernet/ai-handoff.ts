import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

import {
  ensureDir,
  logStage,
  readCompactPacket,
  writeJsonAtomic,
} from "@/lib/spidernet/ingest";

const BASE = path.join(process.cwd(), "artifacts/runtime/spidernet/handoffs");

export const HANDOFF_PATHS = {
  base: BASE,
  attemptsDir: path.join(BASE, "attempts"),
  sentIndex: path.join(BASE, "sent.json"),
} as const;

export type HandoffDispatchedPacket = {
  packetId: string;
  kind: "research" | "execution" | "approval";
  boardId: string;
  lane: string;
  classifications: string[];
  routeFamilies: string[];
  vaultTargets: string[];
};

export type HandoffCompactContext = {
  packetId: string;
  sourceHash: string;
  kind: HandoffDispatchedPacket["kind"];
  boardId: string;
  lane: string;
  classifications: string[];
  routeFamilies: string[];
  vaultTargets: string[];
  objectivePreview: string;
  byteCount: number;
  tokenEstimate: number;
};

export type HandoffAttempt = {
  handoffId: string;
  packetId: string;
  sourceHash: string;
  kind: HandoffDispatchedPacket["kind"];
  context: HandoffCompactContext;
  target: "stub";
  status: "stub_sent";
  response: null;
  sentAt: string;
};

export type HandoffIndexEntry = {
  handoffId: string;
  sentAt: string;
};

type HandoffIndex = Record<string, HandoffIndexEntry>;

export type HandoffResult =
  | { duplicate: true; entry: HandoffIndexEntry }
  | { duplicate: false; attempt: HandoffAttempt };

function readHandoffIndex(): HandoffIndex {
  try {
    if (!fs.existsSync(HANDOFF_PATHS.sentIndex)) return {};
    const raw = fs.readFileSync(HANDOFF_PATHS.sentIndex, "utf8").trim();
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as HandoffIndex) : {};
  } catch {
    return {};
  }
}

function buildCompactContext(
  packet: HandoffDispatchedPacket,
  sourceHash: string,
): HandoffCompactContext {
  const compact = readCompactPacket(sourceHash);
  return {
    packetId: packet.packetId,
    sourceHash,
    kind: packet.kind,
    boardId: packet.boardId,
    lane: packet.lane,
    classifications: packet.classifications,
    routeFamilies: packet.routeFamilies,
    vaultTargets: packet.vaultTargets,
    objectivePreview: compact?.objectivePreview ?? "",
    byteCount: compact?.byteCount ?? 0,
    tokenEstimate: compact?.tokenEstimate ?? 0,
  };
}

export function attemptHandoff(
  packet: HandoffDispatchedPacket,
  sourceHash: string,
): HandoffResult {
  const index = readHandoffIndex();
  const existing = index[packet.packetId];
  if (existing) {
    logStage("ai_handoff_cache_hit", {
      handoffId: existing.handoffId,
      packetId: packet.packetId,
    });
    return { duplicate: true, entry: existing };
  }

  const handoffId = `ho-${randomUUID().slice(0, 12)}`;
  const sentAt = new Date().toISOString();
  const context = buildCompactContext(packet, sourceHash);

  const attempt: HandoffAttempt = {
    handoffId,
    packetId: packet.packetId,
    sourceHash,
    kind: packet.kind,
    context,
    target: "stub",
    status: "stub_sent",
    response: null,
    sentAt,
  };

  ensureDir(HANDOFF_PATHS.attemptsDir);
  writeJsonAtomic(path.join(HANDOFF_PATHS.attemptsDir, `${packet.packetId}.json`), attempt);

  index[packet.packetId] = { handoffId, sentAt };
  ensureDir(HANDOFF_PATHS.base);
  writeJsonAtomic(HANDOFF_PATHS.sentIndex, index);

  logStage("ai_handoff_attempted", {
    handoffId,
    packetId: packet.packetId,
    kind: packet.kind,
    hash: sourceHash,
    status: "stub_sent",
  });

  return { duplicate: false, attempt };
}
