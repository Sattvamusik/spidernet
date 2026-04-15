import type { BrainTier } from "../brain-manager";

export type { BrainTier };

export const BRAIN_POSTURE_SCHEMA_VERSION = 1 as const;

export type BrainPostureStatus =
  | "prepared"
  | "probing"
  | "live"
  | "unavailable"
  | "unknown";

export type BrainTierPosture = {
  tier: BrainTier;
  status: BrainPostureStatus;
  lastProbedAt: string;
  note: string;
};

export type BrainPostureSnapshot = {
  schemaVersion: number;
  lastWrittenAt: string;
  tiers: BrainTierPosture[];
};
