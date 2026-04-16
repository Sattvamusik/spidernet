import { createHash } from "crypto";

import { emitPostureChangeEvent } from "./events";
import {
  BrainPostureWriteError,
  readPostureFile,
  writePostureFile,
} from "./storage";
import type {
  BrainPostureSnapshot,
  BrainPostureStatus,
  BrainTier,
  BrainTierPosture,
} from "./types";

export function loadPosture(): BrainPostureSnapshot {
  return readPostureFile();
}

export function getTierPosture(tier: BrainTier): BrainTierPosture | null {
  const snapshot = readPostureFile();
  return snapshot.tiers.find((entry) => entry.tier === tier) ?? null;
}

export function setTierPosture(
  tier: BrainTier,
  update: { status: BrainPostureStatus; note: string },
): BrainPostureSnapshot {
  const timestamp = new Date().toISOString();
  const current = readPostureFile();

  const tierIndex = current.tiers.findIndex((entry) => entry.tier === tier);
  if (tierIndex < 0) {
    throw new BrainPostureWriteError(
      `Cannot set posture: unknown brain tier '${tier}'.`,
    );
  }

  const nextTiers = current.tiers.map((entry, index) =>
    index === tierIndex
      ? {
          tier,
          status: update.status,
          note: update.note,
          lastProbedAt: timestamp,
        }
      : entry,
  );

  const next: BrainPostureSnapshot = {
    schemaVersion: current.schemaVersion,
    lastWrittenAt: timestamp,
    tiers: nextTiers,
  };

  writePostureFile(next);

  emitPostureChangeEvent({
    id: idempotencyKey(tier, update.status, update.note, timestamp),
    actor: "brain-posture",
    action: "brain.posture.tier.updated",
    scope: `brain:${tier}:${update.status}`,
    timestamp,
  });

  return next;
}

function idempotencyKey(
  tier: BrainTier,
  status: BrainPostureStatus,
  note: string,
  timestamp: string,
): string {
  return createHash("sha256")
    .update(`${tier}\x00${status}\x00${note}\x00${timestamp}`)
    .digest("hex");
}
