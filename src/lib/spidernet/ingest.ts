import fs from "fs";
import path from "path";
import { createHash } from "crypto";

const BASE = path.join(process.cwd(), "artifacts/runtime/spidernet/ingest");

export const INGEST_PATHS = {
  base: BASE,
  rawDir: path.join(BASE, "raw"),
  packetDir: path.join(BASE, "packets"),
  routeDir: path.join(BASE, "routes"),
  seenIndex: path.join(BASE, "seen.json"),
  stageLog: path.join(BASE, "stages.log"),
} as const;

export type IngestInput = {
  objective?: string | null;
  body?: string | null;
  source: string;
};

export type CompactIngestPacket = {
  hash: string;
  createdAt: string;
  source: string;
  objectivePreview: string;
  objectiveLen: number;
  bodyLen: number;
  byteCount: number;
  tokenEstimate: number;
  rawRef: string | null;
  routeRef?: string | null;
};

export type SeenEntry = {
  hash: string;
  firstSeenAt: string;
  lastSeenAt: string;
  hitCount: number;
  packetRef: string;
  rawRef: string | null;
  routeRef?: string | null;
};

export type IngestResult = {
  duplicate: boolean;
  hitCount: number;
  packet: CompactIngestPacket;
  packetRef: string;
  rawRef: string | null;
};

type SeenIndex = Record<string, SeenEntry>;

function ensureDir(dirPath: string) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readSeenIndex(): SeenIndex {
  try {
    if (!fs.existsSync(INGEST_PATHS.seenIndex)) return {};
    const raw = fs.readFileSync(INGEST_PATHS.seenIndex, "utf8").trim();
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as SeenIndex) : {};
  } catch {
    return {};
  }
}

function writeJsonAtomic(filePath: string, value: unknown) {
  ensureDir(path.dirname(filePath));
  const tempFile = `${filePath}.tmp`;
  fs.writeFileSync(tempFile, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  fs.renameSync(tempFile, filePath);
}

function normalize(value: string | null | undefined): string {
  return (value ?? "").trim();
}

function hashInput(objective: string, body: string): string {
  return createHash("sha256").update(`${objective}\n${body}`, "utf8").digest("hex");
}

export function logStage(
  stage: string,
  fields: Record<string, string | number | boolean | string[] | null | undefined>,
) {
  const entry = { ts: new Date().toISOString(), stage, ...fields };
  const line = JSON.stringify(entry);
  try {
    ensureDir(INGEST_PATHS.base);
    fs.appendFileSync(INGEST_PATHS.stageLog, `${line}\n`, "utf8");
  } catch {
    // swallow: stage log must not break ingest
  }
  console.info("[spidernet]ingest", line);
}

export function readCompactPacket(hash: string): CompactIngestPacket | null {
  const packetRef = path.join(INGEST_PATHS.packetDir, `${hash}.json`);
  try {
    return JSON.parse(fs.readFileSync(packetRef, "utf8")) as CompactIngestPacket;
  } catch {
    return null;
  }
}

export function readSeenEntry(hash: string): SeenEntry | null {
  const seen = readSeenIndex();
  return seen[hash] ?? null;
}

export function updateSeenRouteRef(hash: string, routeRef: string | null) {
  const seen = readSeenIndex();
  const entry = seen[hash];
  if (!entry) return;
  entry.routeRef = routeRef;
  seen[hash] = entry;
  writeJsonAtomic(INGEST_PATHS.seenIndex, seen);
}

export { writeJsonAtomic, ensureDir };

export function ingest(input: IngestInput): IngestResult {
  const objective = normalize(input.objective);
  const body = normalize(input.body);
  const byteCount = Buffer.byteLength(body, "utf8");
  const tokenEstimate = Math.ceil(byteCount / 4);

  logStage("received", {
    source: input.source,
    objectiveLen: objective.length,
    bodyLen: body.length,
  });

  const hash = hashInput(objective, body);
  logStage("hashed", { source: input.source, hash, byteCount, tokenEstimate });

  const packetRef = path.join(INGEST_PATHS.packetDir, `${hash}.json`);
  const rawRef = body.length > 0 ? path.join(INGEST_PATHS.rawDir, `${hash}.txt`) : null;

  const seen = readSeenIndex();
  const existing = seen[hash];
  const nowIso = new Date().toISOString();

  if (existing) {
    existing.lastSeenAt = nowIso;
    existing.hitCount += 1;
    writeJsonAtomic(INGEST_PATHS.seenIndex, seen);
    logStage("dedupe_hit", {
      source: input.source,
      hash,
      hitCount: existing.hitCount,
      firstSeenAt: existing.firstSeenAt,
    });

    let packet: CompactIngestPacket;
    try {
      packet = JSON.parse(fs.readFileSync(packetRef, "utf8")) as CompactIngestPacket;
    } catch {
      packet = {
        hash,
        createdAt: existing.firstSeenAt,
        source: input.source,
        objectivePreview: objective.slice(0, 120),
        objectiveLen: objective.length,
        bodyLen: body.length,
        byteCount,
        tokenEstimate,
        rawRef: existing.rawRef,
      };
    }
    return {
      duplicate: true,
      hitCount: existing.hitCount,
      packet,
      packetRef,
      rawRef: existing.rawRef,
    };
  }

  logStage("dedupe_miss", { source: input.source, hash });

  if (rawRef) {
    ensureDir(INGEST_PATHS.rawDir);
    fs.writeFileSync(rawRef, body, "utf8");
    logStage("raw_written", { source: input.source, hash, byteCount });
  }

  const packet: CompactIngestPacket = {
    hash,
    createdAt: nowIso,
    source: input.source,
    objectivePreview: objective.slice(0, 120),
    objectiveLen: objective.length,
    bodyLen: body.length,
    byteCount,
    tokenEstimate,
    rawRef,
  };
  writeJsonAtomic(packetRef, packet);
  logStage("packet_written", {
    source: input.source,
    hash,
    bodyLen: body.length,
    tokenEstimate,
  });

  const entry: SeenEntry = {
    hash,
    firstSeenAt: nowIso,
    lastSeenAt: nowIso,
    hitCount: 1,
    packetRef,
    rawRef,
  };
  seen[hash] = entry;
  writeJsonAtomic(INGEST_PATHS.seenIndex, seen);
  logStage("indexed", { source: input.source, hash, hitCount: 1 });

  return { duplicate: false, hitCount: 1, packet, packetRef, rawRef };
}
