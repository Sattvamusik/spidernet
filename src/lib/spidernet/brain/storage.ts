import fs from "fs";
import path from "path";

import {
  BRAIN_POSTURE_SCHEMA_VERSION,
  type BrainPostureSnapshot,
  type BrainPostureStatus,
  type BrainTier,
  type BrainTierPosture,
} from "./types";

const BASE = path.join(process.cwd(), "artifacts/runtime/spidernet");

export const BRAIN_POSTURE_FILE = path.join(BASE, "brain/posture.json");

export class BrainPostureReadError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "BrainPostureReadError";
  }
}

export class BrainPostureWriteError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "BrainPostureWriteError";
  }
}

const SCAFFOLD_NOTE = "Scaffold only. No live handshake verified.";

const VALID_TIERS: readonly BrainTier[] = [
  "cloud_primary",
  "cloud_mini",
  "local_ollama",
];

const VALID_STATUSES: readonly BrainPostureStatus[] = [
  "prepared",
  "probing",
  "live",
  "unavailable",
  "unknown",
];

export function defaultPosture(): BrainPostureSnapshot {
  return {
    schemaVersion: BRAIN_POSTURE_SCHEMA_VERSION,
    lastWrittenAt: "",
    tiers: VALID_TIERS.map((tier) => ({
      tier,
      status: "prepared",
      lastProbedAt: "",
      note: SCAFFOLD_NOTE,
    })),
  };
}

export function readPostureFile(): BrainPostureSnapshot {
  if (!fs.existsSync(BRAIN_POSTURE_FILE)) {
    return defaultPosture();
  }

  let raw: string;
  try {
    raw = fs.readFileSync(BRAIN_POSTURE_FILE, "utf8");
  } catch (cause) {
    throw new BrainPostureReadError(
      `Failed to read brain posture file at ${BRAIN_POSTURE_FILE}.`,
      { cause },
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (cause) {
    throw new BrainPostureReadError(
      `Brain posture file is not valid JSON: ${BRAIN_POSTURE_FILE}.`,
      { cause },
    );
  }

  return validateSnapshot(parsed);
}

export function writePostureFile(snapshot: BrainPostureSnapshot): void {
  let validated: BrainPostureSnapshot;
  try {
    validated = validateSnapshot(snapshot);
  } catch (cause) {
    throw new BrainPostureWriteError(
      "Refusing to write invalid brain posture snapshot.",
      { cause },
    );
  }

  const dir = path.dirname(BRAIN_POSTURE_FILE);
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (cause) {
    throw new BrainPostureWriteError(
      `Failed to ensure brain posture directory exists: ${dir}.`,
      { cause },
    );
  }

  const tempFile = `${BRAIN_POSTURE_FILE}.${process.pid}.${Date.now()}.tmp`;
  const serialized = `${JSON.stringify(validated, null, 2)}\n`;

  try {
    fs.writeFileSync(tempFile, serialized, { encoding: "utf8" });
  } catch (cause) {
    removeTempFileQuietly(tempFile);
    throw new BrainPostureWriteError(
      `Failed to write temporary brain posture file at ${tempFile}.`,
      { cause },
    );
  }

  try {
    fs.renameSync(tempFile, BRAIN_POSTURE_FILE);
  } catch (cause) {
    removeTempFileQuietly(tempFile);
    throw new BrainPostureWriteError(
      `Failed to atomically rename brain posture file onto ${BRAIN_POSTURE_FILE}.`,
      { cause },
    );
  }
}

function removeTempFileQuietly(tempFile: string): void {
  try {
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  } catch {
    // Best-effort cleanup; the primary write failure is what the caller needs.
  }
}

function validateSnapshot(value: unknown): BrainPostureSnapshot {
  if (!isObject(value)) {
    throw new BrainPostureReadError("Brain posture snapshot must be an object.");
  }

  const record = value;

  if (record.schemaVersion !== BRAIN_POSTURE_SCHEMA_VERSION) {
    throw new BrainPostureReadError(
      `Brain posture schemaVersion mismatch: expected ${BRAIN_POSTURE_SCHEMA_VERSION}, got ${String(record.schemaVersion)}.`,
    );
  }

  if (typeof record.lastWrittenAt !== "string") {
    throw new BrainPostureReadError("Brain posture lastWrittenAt must be a string.");
  }

  if (!Array.isArray(record.tiers)) {
    throw new BrainPostureReadError("Brain posture tiers must be an array.");
  }

  return {
    schemaVersion: BRAIN_POSTURE_SCHEMA_VERSION,
    lastWrittenAt: record.lastWrittenAt,
    tiers: record.tiers.map(validateTierPosture),
  };
}

function validateTierPosture(value: unknown): BrainTierPosture {
  if (!isObject(value)) {
    throw new BrainPostureReadError("Brain tier posture entry must be an object.");
  }
  const record = value;

  if (typeof record.tier !== "string" || !VALID_TIERS.includes(record.tier as BrainTier)) {
    throw new BrainPostureReadError(`Unknown brain tier: ${String(record.tier)}.`);
  }
  if (typeof record.status !== "string" || !VALID_STATUSES.includes(record.status as BrainPostureStatus)) {
    throw new BrainPostureReadError(`Unknown brain posture status: ${String(record.status)}.`);
  }
  if (typeof record.lastProbedAt !== "string") {
    throw new BrainPostureReadError("Brain tier posture lastProbedAt must be a string.");
  }
  if (typeof record.note !== "string") {
    throw new BrainPostureReadError("Brain tier posture note must be a string.");
  }

  return {
    tier: record.tier as BrainTier,
    status: record.status as BrainPostureStatus,
    lastProbedAt: record.lastProbedAt,
    note: record.note,
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
