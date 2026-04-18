/**
 * smoke:ai-handoff — offline smoke for the SETU Bridge AI handoff path.
 *
 * Runs three scenarios against attemptHandoff with no network access, covering
 * the full sent.json state machine:
 *
 *   1. Stub success   — AI_HANDOFF_PROVIDER=stub writes an attempt and a
 *                       sent.json entry.
 *   2. Failure path   — AI_HANDOFF_PROVIDER=anthropic without ANTHROPIC_API_KEY
 *                       triggers a "config" AiProviderError in sendAnthropic
 *                       (no fetch is issued), so the attempt is written with
 *                       status "error" and sent.json stays clean; a rerun
 *                       produces a fresh attempt rather than a cache hit.
 *   3. Cache hit      — A second dispatch after a stub success returns
 *                       { duplicate: true } referencing the original handoffId,
 *                       without rewriting the attempt file.
 *
 * Each scenario seeds its own synthetic compact packet and cleans up every
 * artifact it created so the smoke is hermetic.
 */
import fs from "node:fs";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";

process.env.AI_HANDOFF_PROVIDER = "stub";

import {
  attemptHandoff,
  HANDOFF_PATHS,
  type HandoffDispatchedPacket,
} from "../src/lib/spidernet/ai-handoff";
import {
  INGEST_PATHS,
  type CompactIngestPacket,
} from "../src/lib/spidernet/ingest";

type Check = { ok: boolean; label: string };

type Recorder = (ok: boolean, label: string) => void;

type ArtifactTracker = {
  compactPath: string;
  attemptPaths: string[];
  packetIds: string[];
  handoffsBaseExisted: boolean;
  attemptsDirExisted: boolean;
  sentIndexExisted: boolean;
};

function seedCompactPacket(runId: string): {
  hash: string;
  compactPath: string;
} {
  const hash = createHash("sha256")
    .update(`smoke-${runId}-${Date.now()}-${Math.random()}`, "utf8")
    .digest("hex");
  const compact: CompactIngestPacket = {
    hash,
    createdAt: new Date().toISOString(),
    source: "smoke:ai-handoff",
    objectivePreview: "smoke handoff objective",
    objectiveLen: 23,
    bodyLen: 64,
    byteCount: 64,
    tokenEstimate: 16,
    rawRef: null,
  };
  const compactPath = path.join(INGEST_PATHS.packetDir, `${hash}.json`);
  fs.mkdirSync(path.dirname(compactPath), { recursive: true });
  fs.writeFileSync(compactPath, `${JSON.stringify(compact, null, 2)}\n`, "utf8");
  return { hash, compactPath };
}

function snapshotHandoffDirs(): Pick<
  ArtifactTracker,
  "handoffsBaseExisted" | "attemptsDirExisted" | "sentIndexExisted"
> {
  return {
    handoffsBaseExisted: fs.existsSync(HANDOFF_PATHS.base),
    attemptsDirExisted: fs.existsSync(HANDOFF_PATHS.attemptsDir),
    sentIndexExisted: fs.existsSync(HANDOFF_PATHS.sentIndex),
  };
}

function makeDispatched(packetId: string): HandoffDispatchedPacket {
  return {
    packetId,
    kind: "execution",
    boardId: "dash-004-setu-bridge",
    lane: "bridge.smoke",
    classifications: ["smoke"],
    routeFamilies: ["bridge"],
    vaultTargets: ["artifacts/smoke"],
  };
}

function cleanup(tracker: ArtifactTracker): void {
  try {
    fs.rmSync(tracker.compactPath, { force: true });
  } catch {}
  for (const p of tracker.attemptPaths) {
    try {
      fs.rmSync(p, { force: true });
    } catch {}
  }

  if (fs.existsSync(HANDOFF_PATHS.sentIndex)) {
    try {
      const sent = JSON.parse(
        fs.readFileSync(HANDOFF_PATHS.sentIndex, "utf8"),
      ) as Record<string, unknown>;
      for (const id of tracker.packetIds) {
        if (id in sent) delete sent[id];
      }
      const remaining = Object.keys(sent).length;
      if (remaining === 0 && !tracker.sentIndexExisted) {
        fs.rmSync(HANDOFF_PATHS.sentIndex, { force: true });
      } else {
        fs.writeFileSync(
          HANDOFF_PATHS.sentIndex,
          `${JSON.stringify(sent, null, 2)}\n`,
          "utf8",
        );
      }
    } catch {}
  }

  if (!tracker.attemptsDirExisted) {
    try {
      fs.rmdirSync(HANDOFF_PATHS.attemptsDir);
    } catch {}
  }
  if (!tracker.handoffsBaseExisted) {
    try {
      fs.rmdirSync(HANDOFF_PATHS.base);
    } catch {}
  }
}

async function runStubSuccessScenario(record: Recorder): Promise<void> {
  const prevProvider = process.env.AI_HANDOFF_PROVIDER;
  process.env.AI_HANDOFF_PROVIDER = "stub";

  const runId = randomUUID().slice(0, 8);
  const packetId = `smoke-pkt-${runId}`;
  const { hash, compactPath } = seedCompactPacket(runId);
  const attemptPath = path.join(HANDOFF_PATHS.attemptsDir, `${packetId}.json`);

  const tracker: ArtifactTracker = {
    compactPath,
    attemptPaths: [attemptPath],
    packetIds: [packetId],
    ...snapshotHandoffDirs(),
  };

  const dispatched = makeDispatched(packetId);

  try {
    const result = await attemptHandoff(dispatched, hash);

    record(result.duplicate === false, "stub: first attempt is not a duplicate");
    if (!result.duplicate) {
      const a = result.attempt;
      record(a.target === "stub", "stub: attempt target is stub");
      record(a.status === "stub_sent", "stub: attempt status is stub_sent");
      record(a.packetId === packetId, "stub: attempt packetId matches input");
      record(a.sourceHash === hash, "stub: attempt sourceHash matches input");
      record(a.kind === "execution", "stub: attempt kind preserved");
      record(a.error === undefined, "stub: no error recorded");
      record(a.response?.text === null, "stub: response text is null");
      record(a.context.packetId === packetId, "stub: payload packetId matches");
      record(
        a.context.boardId === "dash-004-setu-bridge",
        "stub: payload boardId matches",
      );
      record(a.context.lane === "bridge.smoke", "stub: payload lane matches");
      record(
        a.context.objectivePreview === "smoke handoff objective",
        "stub: payload objectivePreview hydrated from compact packet",
      );
      record(
        a.context.tokenEstimate === 16,
        "stub: payload tokenEstimate hydrated from compact packet",
      );
      record(
        a.context.classifications.length === 1 &&
          a.context.classifications[0] === "smoke",
        "stub: payload classifications preserved",
      );
    }

    record(fs.existsSync(attemptPath), "stub: attempt file written on disk");
    record(fs.existsSync(HANDOFF_PATHS.sentIndex), "stub: sent.json exists");

    if (fs.existsSync(HANDOFF_PATHS.sentIndex)) {
      const sent = JSON.parse(
        fs.readFileSync(HANDOFF_PATHS.sentIndex, "utf8"),
      ) as Record<string, { handoffId: string; sentAt: string }>;
      const entry = sent[packetId];
      record(entry !== undefined, "stub: sent.json records smoke packetId");
      record(
        typeof entry?.handoffId === "string" &&
          entry.handoffId.startsWith("ho-"),
        "stub: sent.json entry has ho- handoffId",
      );
      record(
        typeof entry?.sentAt === "string" && entry.sentAt.length > 0,
        "stub: sent.json entry has sentAt timestamp",
      );
    }
  } finally {
    cleanup(tracker);
    if (prevProvider === undefined) delete process.env.AI_HANDOFF_PROVIDER;
    else process.env.AI_HANDOFF_PROVIDER = prevProvider;
  }
}

async function runFailurePathScenario(record: Recorder): Promise<void> {
  const prevProvider = process.env.AI_HANDOFF_PROVIDER;
  const prevKey = process.env.ANTHROPIC_API_KEY;
  process.env.AI_HANDOFF_PROVIDER = "anthropic";
  delete process.env.ANTHROPIC_API_KEY;

  const runId = randomUUID().slice(0, 8);
  const packetId = `smoke-fail-${runId}`;
  const { hash, compactPath } = seedCompactPacket(runId);
  const attemptPath = path.join(HANDOFF_PATHS.attemptsDir, `${packetId}.json`);

  const tracker: ArtifactTracker = {
    compactPath,
    attemptPaths: [attemptPath],
    packetIds: [packetId],
    ...snapshotHandoffDirs(),
  };

  const dispatched = makeDispatched(packetId);

  try {
    const first = await attemptHandoff(dispatched, hash);

    record(first.duplicate === false, "fail: first attempt is not a duplicate");
    let firstHandoffId: string | null = null;
    if (!first.duplicate) {
      const a = first.attempt;
      firstHandoffId = a.handoffId;
      record(a.status === "error", "fail: attempt status is error");
      record(a.target === "anthropic", "fail: attempt target is anthropic");
      record(a.response === null, "fail: attempt response is null");
      record(a.error?.kind === "config", "fail: error kind is config");
      record(
        typeof a.error?.message === "string" && a.error.message.length > 0,
        "fail: error message is populated",
      );
    }

    record(
      fs.existsSync(attemptPath),
      "fail: attempt file written on disk despite failure",
    );

    const sentAfterFailure = fs.existsSync(HANDOFF_PATHS.sentIndex)
      ? (JSON.parse(
          fs.readFileSync(HANDOFF_PATHS.sentIndex, "utf8"),
        ) as Record<string, unknown>)
      : {};
    record(
      !(packetId in sentAfterFailure),
      "fail: sent.json does not record failed packetId",
    );

    const second = await attemptHandoff(dispatched, hash);

    record(
      second.duplicate === false,
      "fail: rerun is not a cache hit (retry-on-next-dispatch holds)",
    );
    if (!second.duplicate && firstHandoffId !== null) {
      const a = second.attempt;
      record(
        a.handoffId !== firstHandoffId,
        "fail: rerun produces a fresh handoffId",
      );
      record(a.status === "error", "fail: rerun attempt status is error");
    }

    const sentAfterRerun = fs.existsSync(HANDOFF_PATHS.sentIndex)
      ? (JSON.parse(
          fs.readFileSync(HANDOFF_PATHS.sentIndex, "utf8"),
        ) as Record<string, unknown>)
      : {};
    record(
      !(packetId in sentAfterRerun),
      "fail: sent.json still clean after rerun",
    );
  } finally {
    cleanup(tracker);
    if (prevProvider === undefined) delete process.env.AI_HANDOFF_PROVIDER;
    else process.env.AI_HANDOFF_PROVIDER = prevProvider;
    if (prevKey === undefined) delete process.env.ANTHROPIC_API_KEY;
    else process.env.ANTHROPIC_API_KEY = prevKey;
  }
}

async function runCacheHitScenario(record: Recorder): Promise<void> {
  const prevProvider = process.env.AI_HANDOFF_PROVIDER;
  process.env.AI_HANDOFF_PROVIDER = "stub";

  const runId = randomUUID().slice(0, 8);
  const packetId = `smoke-cache-${runId}`;
  const { hash, compactPath } = seedCompactPacket(runId);
  const attemptPath = path.join(HANDOFF_PATHS.attemptsDir, `${packetId}.json`);

  const tracker: ArtifactTracker = {
    compactPath,
    attemptPaths: [attemptPath],
    packetIds: [packetId],
    ...snapshotHandoffDirs(),
  };

  const dispatched = makeDispatched(packetId);

  try {
    const first = await attemptHandoff(dispatched, hash);

    record(first.duplicate === false, "cache: first dispatch is not a duplicate");
    if (first.duplicate) return;

    const originalHandoffId = first.attempt.handoffId;
    const originalSentAt = first.attempt.sentAt;
    const firstAttemptStat = fs.statSync(attemptPath);

    // Small delay so mtime would differ if the file were rewritten.
    await new Promise((resolve) => setTimeout(resolve, 10));

    const second = await attemptHandoff(dispatched, hash);

    record(second.duplicate === true, "cache: rerun returns duplicate=true");
    if (second.duplicate) {
      record(
        second.entry.handoffId === originalHandoffId,
        "cache: duplicate entry handoffId matches original",
      );
      record(
        second.entry.sentAt === originalSentAt,
        "cache: duplicate entry sentAt matches original",
      );
    }

    const secondAttemptStat = fs.statSync(attemptPath);
    record(
      secondAttemptStat.mtimeMs === firstAttemptStat.mtimeMs &&
        secondAttemptStat.size === firstAttemptStat.size,
      "cache: attempt file was not rewritten on cache hit",
    );

    if (fs.existsSync(HANDOFF_PATHS.sentIndex)) {
      const sent = JSON.parse(
        fs.readFileSync(HANDOFF_PATHS.sentIndex, "utf8"),
      ) as Record<string, { handoffId: string; sentAt: string }>;
      const entry = sent[packetId];
      record(
        entry?.handoffId === originalHandoffId,
        "cache: sent.json entry handoffId unchanged after rerun",
      );
      record(
        entry?.sentAt === originalSentAt,
        "cache: sent.json entry sentAt unchanged after rerun",
      );
    }
  } finally {
    cleanup(tracker);
    if (prevProvider === undefined) delete process.env.AI_HANDOFF_PROVIDER;
    else process.env.AI_HANDOFF_PROVIDER = prevProvider;
  }
}

async function main(): Promise<void> {
  const checks: Check[] = [];
  const record: Recorder = (ok, label) => checks.push({ ok, label });

  await runStubSuccessScenario(record);
  await runFailurePathScenario(record);
  await runCacheHitScenario(record);

  const failed = checks.filter((c) => !c.ok);
  for (const c of checks) {
    console.log(`${c.ok ? "PASS" : "FAIL"} ${c.label}`);
  }
  if (failed.length > 0) {
    console.error(`smoke:ai-handoff FAIL (${failed.length}/${checks.length})`);
    process.exit(1);
  }
  console.log(`smoke:ai-handoff PASS (${checks.length}/${checks.length})`);
}

main().catch((err) => {
  console.error("smoke:ai-handoff ERROR", err);
  process.exit(1);
});
