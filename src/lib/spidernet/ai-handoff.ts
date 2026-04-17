import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

import {
  ensureDir,
  logStage,
  readCompactPacket,
  writeJsonAtomic,
} from "@/lib/spidernet/ingest";
import {
  AiProviderError,
  getCurrentTarget,
  sendToProvider,
  type AiProviderErrorKind,
  type AiProviderTarget,
} from "@/lib/spidernet/ai-providers";

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

export type AIHandoffPayloadV1 = {
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

export type HandoffAttemptResponse = {
  text: string | null;
  model: string | null;
  usage: unknown;
  stopReason: string | null;
};

export type HandoffAttemptError = {
  kind: AiProviderErrorKind;
  name: string;
  message: string;
};

export type HandoffAttempt = {
  handoffId: string;
  packetId: string;
  sourceHash: string;
  kind: HandoffDispatchedPacket["kind"];
  context: AIHandoffPayloadV1;
  target: AiProviderTarget;
  status: "sent" | "stub_sent" | "error";
  response: HandoffAttemptResponse | null;
  error?: HandoffAttemptError;
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
): AIHandoffPayloadV1 {
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

function attemptFilePath(packetId: string): string {
  return path.join(HANDOFF_PATHS.attemptsDir, `${packetId}.json`);
}

function writeAttempt(attempt: HandoffAttempt): void {
  ensureDir(HANDOFF_PATHS.attemptsDir);
  writeJsonAtomic(attemptFilePath(attempt.packetId), attempt);
}

function updateSentIndex(
  index: HandoffIndex,
  packetId: string,
  handoffId: string,
  sentAt: string,
): void {
  index[packetId] = { handoffId, sentAt };
  ensureDir(HANDOFF_PATHS.base);
  writeJsonAtomic(HANDOFF_PATHS.sentIndex, index);
}

export async function attemptHandoff(
  packet: HandoffDispatchedPacket,
  sourceHash: string,
): Promise<HandoffResult> {
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

  try {
    const providerResponse = await sendToProvider(context);
    const attempt: HandoffAttempt = {
      handoffId,
      packetId: packet.packetId,
      sourceHash,
      kind: packet.kind,
      context,
      target: providerResponse.target,
      status: providerResponse.status,
      response: {
        text: providerResponse.text,
        model: providerResponse.model,
        usage: providerResponse.usage,
        stopReason: providerResponse.stopReason,
      },
      sentAt,
    };
    writeAttempt(attempt);
    updateSentIndex(index, packet.packetId, handoffId, sentAt);
    logStage("ai_handoff_attempted", {
      handoffId,
      packetId: packet.packetId,
      kind: packet.kind,
      hash: sourceHash,
      target: providerResponse.target,
      status: providerResponse.status,
    });
    return { duplicate: false, attempt };
  } catch (err) {
    const target: AiProviderTarget =
      err instanceof AiProviderError ? err.target : getCurrentTarget();
    const kind: AiProviderErrorKind =
      err instanceof AiProviderError ? err.kind : "permanent";
    const errorRecord: HandoffAttemptError = {
      kind,
      name: err instanceof Error ? err.name : "Error",
      message: err instanceof Error ? err.message : String(err),
    };
    const attempt: HandoffAttempt = {
      handoffId,
      packetId: packet.packetId,
      sourceHash,
      kind: packet.kind,
      context,
      target,
      status: "error",
      response: null,
      error: errorRecord,
      sentAt,
    };
    writeAttempt(attempt);
    logStage("ai_handoff_failed", {
      handoffId,
      packetId: packet.packetId,
      kind: packet.kind,
      hash: sourceHash,
      target,
      errorKind: kind,
      errorMessage: errorRecord.message,
    });
    return { duplicate: false, attempt };
  }
}
