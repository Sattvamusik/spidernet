/**
 * smoke:ai-handoff — offline smoke for the SETU Bridge AI handoff path.
 *
 * Exercises attemptHandoff against the stub provider with no network access.
 * Seeds a synthetic compact packet, calls attemptHandoff, asserts payload
 * shape + attempt file + sent.json write, then cleans up its own entries.
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

async function main(): Promise<void> {
  const runId = randomUUID().slice(0, 8);
  const hash = createHash("sha256")
    .update(`smoke-${runId}-${Date.now()}`, "utf8")
    .digest("hex");
  const packetId = `smoke-pkt-${runId}`;

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
  const attemptPath = path.join(HANDOFF_PATHS.attemptsDir, `${packetId}.json`);

  const handoffsBaseExisted = fs.existsSync(HANDOFF_PATHS.base);
  const attemptsDirExisted = fs.existsSync(HANDOFF_PATHS.attemptsDir);
  const sentIndexExisted = fs.existsSync(HANDOFF_PATHS.sentIndex);

  fs.mkdirSync(path.dirname(compactPath), { recursive: true });
  fs.writeFileSync(compactPath, `${JSON.stringify(compact, null, 2)}\n`, "utf8");

  const dispatched: HandoffDispatchedPacket = {
    packetId,
    kind: "execution",
    boardId: "dash-004-setu-bridge",
    lane: "bridge.smoke",
    classifications: ["smoke"],
    routeFamilies: ["bridge"],
    vaultTargets: ["artifacts/smoke"],
  };

  const checks: Check[] = [];
  const record = (ok: boolean, label: string) => checks.push({ ok, label });

  try {
    const result = await attemptHandoff(dispatched, hash);

    record(result.duplicate === false, "first attempt is not a duplicate");
    if (!result.duplicate) {
      const a = result.attempt;
      record(a.target === "stub", "attempt target is stub");
      record(a.status === "stub_sent", "attempt status is stub_sent");
      record(a.packetId === packetId, "attempt packetId matches input");
      record(a.sourceHash === hash, "attempt sourceHash matches input");
      record(a.kind === "execution", "attempt kind preserved");
      record(a.error === undefined, "no error recorded on stub path");
      record(a.response?.text === null, "stub response text is null");
      record(a.context.packetId === packetId, "payload packetId matches");
      record(
        a.context.boardId === "dash-004-setu-bridge",
        "payload boardId matches",
      );
      record(a.context.lane === "bridge.smoke", "payload lane matches");
      record(
        a.context.objectivePreview === "smoke handoff objective",
        "payload objectivePreview hydrated from compact packet",
      );
      record(
        a.context.tokenEstimate === 16,
        "payload tokenEstimate hydrated from compact packet",
      );
      record(
        a.context.classifications.length === 1 &&
          a.context.classifications[0] === "smoke",
        "payload classifications preserved",
      );
    }

    record(fs.existsSync(attemptPath), "attempt file written on disk");
    record(fs.existsSync(HANDOFF_PATHS.sentIndex), "sent.json exists");

    if (fs.existsSync(HANDOFF_PATHS.sentIndex)) {
      const sent = JSON.parse(
        fs.readFileSync(HANDOFF_PATHS.sentIndex, "utf8"),
      ) as Record<string, { handoffId: string; sentAt: string }>;
      const entry = sent[packetId];
      record(entry !== undefined, "sent.json records smoke packetId");
      record(
        typeof entry?.handoffId === "string" && entry.handoffId.startsWith("ho-"),
        "sent.json entry has ho- handoffId",
      );
      record(
        typeof entry?.sentAt === "string" && entry.sentAt.length > 0,
        "sent.json entry has sentAt timestamp",
      );
    }
  } finally {
    try {
      fs.rmSync(compactPath, { force: true });
    } catch {}
    try {
      fs.rmSync(attemptPath, { force: true });
    } catch {}

    if (fs.existsSync(HANDOFF_PATHS.sentIndex)) {
      try {
        const sent = JSON.parse(
          fs.readFileSync(HANDOFF_PATHS.sentIndex, "utf8"),
        ) as Record<string, unknown>;
        if (packetId in sent) delete sent[packetId];
        const remaining = Object.keys(sent).length;
        if (remaining === 0 && !sentIndexExisted) {
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

    if (!attemptsDirExisted) {
      try {
        fs.rmdirSync(HANDOFF_PATHS.attemptsDir);
      } catch {}
    }
    if (!handoffsBaseExisted) {
      try {
        fs.rmdirSync(HANDOFF_PATHS.base);
      } catch {}
    }
  }

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
