import { readPostureFile } from "./storage";
import type {
  BrainPostureSnapshot,
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
