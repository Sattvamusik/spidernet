import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const BASE = path.join(process.cwd(), "artifacts/runtime/spidernet");

export const RUNTIME_PATHS = {
  packetsDir: path.join(BASE, "packets"),
  ledgerDir: path.join(BASE, "ledger"),
  registriesDir: path.join(BASE, "registries"),
  vaultsDir: path.join(BASE, "vaults"),
  configDir: path.join(BASE, "config"),

  intakePackets: path.join(BASE, "packets/intake.json"),
  researchPackets: path.join(BASE, "packets/research.json"),
  executionPackets: path.join(BASE, "packets/execution.json"),
  validationPackets: path.join(BASE, "packets/validation.json"),
  approvalPackets: path.join(BASE, "packets/approval.json"),
  passPackets: path.join(BASE, "packets/pass.json"),

  wrapperRegistry: path.join(BASE, "registries/wrappers.json"),
  skillRegistry: path.join(BASE, "registries/skills.json"),
  scoreRegistry: path.join(BASE, "registries/scores.json"),

  ledgerEvents: path.join(BASE, "ledger/events.json"),

  vaultIndex: path.join(BASE, "vaults/index.json"),
  ollamaConfig: path.join(BASE, "config/ollama.json"),
  legacyOllamaConfig: path.join(BASE, "registries/ollama.json"),
} as const;

type JsonValue = unknown;

function ensureDirFor(filePath: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, "utf8").trim();
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function ensureArray<T>(value: JsonValue): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function ensureRecord(value: JsonValue): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function hasOwnData(value: Record<string, unknown>) {
  return Object.keys(value).length > 0;
}

function writeJsonFile(filePath: string, value: JsonValue) {
  ensureDirFor(filePath);
  const tempFile = `${filePath}.tmp`;
  fs.writeFileSync(tempFile, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  fs.renameSync(tempFile, filePath);
}

function appendJsonArrayItem<T>(filePath: string, item: T) {
  const current = ensureArray<T>(readJsonFile<T[]>(filePath, []));
  current.push(item);
  writeJsonFile(filePath, current);
  return current;
}

function nowIso() {
  return new Date().toISOString();
}

export type IntakePacketRecord = {
  packetId: string;
  objective: string;
  classifications: string[];
  routes: string[];
  vaultTargets: string[];
  intakeModes: string[];
  attachments: string[];
  status: string;
  createdAt: string;
  source: string;
};

export type LedgerEventRecord = {
  eventId: string;
  type: string;
  packetId: string;
  detail: string;
  createdAt: string;
};

export type RuntimeIntakePacketRecord = IntakePacketRecord & {
  id: string;
  classification: string | null;
  ingestHash: string | null;
  rawRef: string | null;
  created_at: string;
};

export type RuntimeLedgerEventRecord = LedgerEventRecord & {
  id: string;
  action: string;
  actor: string;
  scope: string;
  timestamp: string;
  appendOnly: true;
  packetType?: string;
  created_at: string;
};

export type RuntimeStorage = {
  intakePackets: RuntimeIntakePacketRecord[];
  researchPackets: Record<string, unknown>[];
  executionPackets: Record<string, unknown>[];
  validationPackets: Record<string, unknown>[];
  approvalPackets: Record<string, unknown>[];
  passPackets: Record<string, unknown>[];

  wrapperRegistry: Record<string, unknown>[];
  skillRegistry: Record<string, unknown>[];
  scoreRegistry: Record<string, unknown>[];

  ledgerEvents: RuntimeLedgerEventRecord[];
  vaultEntries: Record<string, unknown>[];
  ollamaConfig: {
    handshakeStatus: string;
    endpoint: string;
    model: string;
    lastCheckedAt: string;
    note: string;
  };
};

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string" && entry.length > 0)
    : [];
}

function normalizeIntakePacketRecord(
  value: Record<string, unknown>,
  index: number,
): RuntimeIntakePacketRecord {
  const packetId =
    asString(value.packetId) ??
    asString(value.id) ??
    `intake-fallback-${index + 1}`;
  const classification = asString(value.classification);
  const classifications = asStringArray(value.classifications);
  const createdAt =
    asString(value.createdAt) ??
    asString(value.created_at) ??
    new Date(0).toISOString();

  return {
    packetId,
    objective:
      asString(value.objective) ??
      `Recovered intake packet ${packetId}${classification ? ` (${classification})` : ""}.`,
    classifications:
      classifications.length > 0
        ? classifications
        : classification
          ? [classification]
          : [],
    routes: asStringArray(value.routes),
    vaultTargets: asStringArray(value.vaultTargets),
    intakeModes: asStringArray(value.intakeModes),
    attachments: asStringArray(value.attachments),
    status: asString(value.status) ?? "captured",
    createdAt,
    source: asString(value.source) ?? "runtime-storage",
    id: packetId,
    classification,
    ingestHash: asString(value.ingestHash),
    rawRef: asString(value.rawRef),
    created_at: createdAt,
  };
}

function normalizeLedgerEventRecord(
  value: Record<string, unknown>,
  index: number,
): RuntimeLedgerEventRecord {
  const id =
    asString(value.id) ??
    asString(value.eventId) ??
    `ledger-fallback-${index + 1}`;
  const action =
    asString(value.action) ??
    asString(value.type) ??
    "runtime.event";
  const packetId = asString(value.packetId) ?? "unknown-packet";
  const packetType = asString(value.packetType) ?? undefined;
  const timestamp =
    asString(value.timestamp) ??
    asString(value.createdAt) ??
    asString(value.created_at) ??
    new Date(0).toISOString();
  const detail =
    asString(value.detail) ??
    [
      packetType ? `packetType=${packetType}` : null,
      packetId ? `packetId=${packetId}` : null,
    ]
      .filter((entry): entry is string => Boolean(entry))
      .join(" ");
  const scope = asString(value.scope) ?? detail ?? "lane-3-support";

  return {
    eventId: id,
    type: action,
    packetId,
    detail: detail ?? scope,
    createdAt: timestamp,
    id,
    action,
    actor: asString(value.actor) ?? "runtime-storage",
    scope,
    timestamp,
    appendOnly: true,
    packetType,
    created_at: timestamp,
  };
}

function normalizeOllamaConfig(
  config: Record<string, unknown>,
  options?: {
    source: "config" | "legacy";
    fallbackUsed?: boolean;
  },
) {
  const source = options?.source ?? "config";
  const fallbackUsed = options?.fallbackUsed ?? false;
  const handshakeStatus =
    config.handshakeStatus === "prepared" ||
    config.handshakeStatus === "ready" ||
    config.handshakeStatus === "missing"
      ? config.handshakeStatus
      : "missing";
  const endpoint =
    typeof config.endpoint === "string" && config.endpoint.trim().length > 0
      ? config.endpoint
      : typeof config.baseUrl === "string" && config.baseUrl.trim().length > 0
        ? config.baseUrl
        : "http://127.0.0.1:11434";
  const model = typeof config.model === "string" ? config.model : "";
  const lastCheckedAt = typeof config.lastCheckedAt === "string" ? config.lastCheckedAt : "";
  const legacyNote =
    source === "legacy"
      ? "Loaded from legacy registry fallback because the documented config file is missing."
      : "Stored at the documented config path for white Setu runtime posture.";
  const scaffoldNote =
    "Scaffold only. Live Ollama handshake is not verified in this repo run.";

  return {
    handshakeStatus,
    endpoint,
    model,
    lastCheckedAt,
    note:
      typeof config.note === "string" && config.note.trim().length > 0
        ? config.note
        : fallbackUsed
          ? `${legacyNote} ${scaffoldNote}`
          : legacyNote,
  };
}

function loadOllamaConfigRecord() {
  const configRecord = ensureRecord(readJsonFile<Record<string, unknown>>(RUNTIME_PATHS.ollamaConfig, {}));
  if (hasOwnData(configRecord)) {
    return normalizeOllamaConfig(configRecord, { source: "config" });
  }

  const legacyRecord = ensureRecord(readJsonFile<Record<string, unknown>>(RUNTIME_PATHS.legacyOllamaConfig, {}));
  if (hasOwnData(legacyRecord)) {
    return normalizeOllamaConfig(legacyRecord, { source: "legacy", fallbackUsed: true });
  }

  return normalizeOllamaConfig(
    {
      endpoint: "http://127.0.0.1:11434",
      model: "",
      handshakeStatus: "missing",
      lastCheckedAt: "",
      note: "No Ollama runtime config file is recorded yet. Scaffold only until the documented config file exists.",
    },
    { source: "config" },
  );
}

export function loadRuntimeStorage(): RuntimeStorage {
  const vaultIndex = ensureRecord(readJsonFile<Record<string, unknown>>(RUNTIME_PATHS.vaultIndex, {}));
  const ollamaConfig = loadOllamaConfigRecord();
  const rawIntakePackets = ensureArray<Record<string, unknown>>(
    readJsonFile<Record<string, unknown>[]>(RUNTIME_PATHS.intakePackets, []),
  );
  const rawLedgerEvents = ensureArray<Record<string, unknown>>(
    readJsonFile<Record<string, unknown>[]>(RUNTIME_PATHS.ledgerEvents, []),
  );

  return {
    intakePackets: rawIntakePackets.map(normalizeIntakePacketRecord),
    researchPackets: ensureArray<Record<string, unknown>>(readJsonFile<Record<string, unknown>[]>(RUNTIME_PATHS.researchPackets, [])),
    executionPackets: ensureArray<Record<string, unknown>>(readJsonFile<Record<string, unknown>[]>(RUNTIME_PATHS.executionPackets, [])),
    validationPackets: ensureArray<Record<string, unknown>>(readJsonFile<Record<string, unknown>[]>(RUNTIME_PATHS.validationPackets, [])),
    approvalPackets: ensureArray<Record<string, unknown>>(readJsonFile<Record<string, unknown>[]>(RUNTIME_PATHS.approvalPackets, [])),
    passPackets: ensureArray<Record<string, unknown>>(readJsonFile<Record<string, unknown>[]>(RUNTIME_PATHS.passPackets, [])),

    wrapperRegistry: ensureArray<Record<string, unknown>>(readJsonFile<Record<string, unknown>[]>(RUNTIME_PATHS.wrapperRegistry, [])),
    skillRegistry: ensureArray<Record<string, unknown>>(readJsonFile<Record<string, unknown>[]>(RUNTIME_PATHS.skillRegistry, [])),
    scoreRegistry: ensureArray<Record<string, unknown>>(readJsonFile<Record<string, unknown>[]>(RUNTIME_PATHS.scoreRegistry, [])),

    ledgerEvents: rawLedgerEvents.map(normalizeLedgerEventRecord),
    vaultEntries: Object.values(vaultIndex) as Record<string, unknown>[],
    ollamaConfig,
  };
}


type PacketKind = "intake" | "research" | "execution" | "validation" | "approval" | "pass";

const PACKET_FILE_MAP: Record<PacketKind, string> = {
  intake: RUNTIME_PATHS.intakePackets,
  research: RUNTIME_PATHS.researchPackets,
  execution: RUNTIME_PATHS.executionPackets,
  validation: RUNTIME_PATHS.validationPackets,
  approval: RUNTIME_PATHS.approvalPackets,
  pass: RUNTIME_PATHS.passPackets,
};

export function appendPacket(kind: PacketKind, packet: Record<string, unknown>) {
  const filePath = PACKET_FILE_MAP[kind];
  if (!filePath) {
    throw new Error(`Unsupported packet kind: ${kind}`);
  }
  return appendJsonArrayItem<Record<string, unknown>>(filePath, packet);
}

export function appendLedgerEvent(event: LedgerEventRecord | Record<string, unknown>) {
  return appendJsonArrayItem<Record<string, unknown>>(RUNTIME_PATHS.ledgerEvents, event);
}

export function upsertVaultEntry(key: string, value: Record<string, unknown>) {
  const current = ensureRecord(readJsonFile<Record<string, unknown>>(RUNTIME_PATHS.vaultIndex, {}));
  current[key] = value;
  writeJsonFile(RUNTIME_PATHS.vaultIndex, current);
  return current;
}

export function createDash001IntakePacket(input?: {
  objective?: string;
  body?: string;
}): {
  packet: IntakePacketRecord;
  ledgerEvent: LedgerEventRecord;
} {
  const createdAt = nowIso();
  const trimmedObjective = input?.objective?.trim() ?? "";
  const trimmedBody = input?.body?.trim() ?? "";
  const attachments: string[] = [];
  if (trimmedBody.length > 0) {
    attachments.push(trimmedBody);
  }
  const packet: IntakePacketRecord = {
    packetId: `intake-${createdAt.replace(/[:.]/g, "-")}-${randomUUID().slice(0, 8)}`,
    objective:
      trimmedObjective.length > 0
        ? trimmedObjective
        : "Dash 001 intake packet created from the white SETU UI.",
    classifications: ["dash-001", "manual-trigger", "safe-default"],
    routes: ["/boards/input-data"],
    vaultTargets: ["/boards/memory-ledger"],
    intakeModes: ["ui-trigger"],
    attachments,
    status: "captured",
    createdAt,
    source: "white-web-setu",
  };

  const ledgerEvent: LedgerEventRecord = {
    eventId: `evt-${randomUUID().slice(0, 12)}`,
    type: "intake_packet_created",
    packetId: packet.packetId,
    detail: "Dash 001 wrote a new intake packet and appended a ledger event.",
    createdAt,
  };

  appendJsonArrayItem<IntakePacketRecord>(RUNTIME_PATHS.intakePackets, packet);
  appendJsonArrayItem<LedgerEventRecord>(RUNTIME_PATHS.ledgerEvents, ledgerEvent);

  return { packet, ledgerEvent };
}
