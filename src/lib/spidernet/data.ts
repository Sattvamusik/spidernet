import fs from "fs";
import path from "path";

import type { BrainStatus, ContinuityStatus, DashboardSnapshot, ManagerSynthesis } from "./types";
import { loadRuntimeStorage } from "./storage";
import { loadPosture } from "./brain/posture";

type QuickStat = {
  label: string;
  value: string;
};

const ARTIFACTS_ROOT = path.join(process.cwd(), "artifacts");
const FREEZE_ROOT = path.join(ARTIFACTS_ROOT, "freeze");
const MIRROR_ROOT = path.join(ARTIFACTS_ROOT, "mirror");
const RECOVERY_ROOT = path.join(ARTIFACTS_ROOT, "recovery");
const RUNTIME_INVENTORY_ROOT = path.join(ARTIFACTS_ROOT, "runtime/spidernet/inventory");

function safeReadDir(dirPath: string) {
  try {
    return fs.readdirSync(dirPath, { withFileTypes: true });
  } catch {
    return [];
  }
}

function safeReadFile(filePath: string) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

function countFilesRecursive(dirPath: string): number {
  return safeReadDir(dirPath).reduce((count, entry) => {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      return count + countFilesRecursive(entryPath);
    }
    return entry.isFile() ? count + 1 : count;
  }, 0);
}

function newestDirectoryName(dirPath: string): string | null {
  const directories = safeReadDir(dirPath)
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      name: entry.name,
      mtimeMs: fs.statSync(path.join(dirPath, entry.name)).mtimeMs,
    }))
    .sort((a, b) => b.mtimeMs - a.mtimeMs);

  return directories[0]?.name ?? null;
}

function buildContinuityStatus(): ContinuityStatus {
  const freezeDirectories = safeReadDir(FREEZE_ROOT).filter((entry) => entry.isDirectory());
  const verifiedFreezeDirectories = freezeDirectories
    .map((entry) => ({
      name: entry.name,
      markerPath: path.join(FREEZE_ROOT, entry.name, "verified-freeze.txt"),
    }))
    .filter((entry) => fs.existsSync(entry.markerPath))
    .map((entry) => ({
      name: entry.name,
      mtimeMs: fs.statSync(entry.markerPath).mtimeMs,
    }))
    .sort((a, b) => b.mtimeMs - a.mtimeMs);

  const latestFreeze = verifiedFreezeDirectories[0]?.name ?? newestDirectoryName(FREEZE_ROOT);
  const mirrorBuckets = safeReadDir(MIRROR_ROOT).filter((entry) => entry.isDirectory()).length;
  const mirrorFiles = countFilesRecursive(MIRROR_ROOT);
  const recoveryCheckpoints = countFilesRecursive(path.join(RECOVERY_ROOT, "checkpoints"));
  const recoveryRestorePlans = countFilesRecursive(path.join(RECOVERY_ROOT, "restore-plans"));

  return {
    freeze:
      verifiedFreezeDirectories.length > 0
        ? {
            status: "verified",
            detail: `${verifiedFreezeDirectories.length} verified freeze checkpoints. Latest: ${latestFreeze}.`,
          }
        : latestFreeze
          ? {
              status: "captured",
              detail: `${freezeDirectories.length} freeze directories exist. Latest checkpoint: ${latestFreeze}.`,
            }
          : {
              status: "missing",
              detail: "No freeze checkpoints are recorded yet.",
            },
    mirror:
      mirrorFiles > 0
        ? {
            status: "ready",
            detail: `${mirrorBuckets} mirror buckets with ${mirrorFiles} mirrored files are present.`,
          }
        : {
            status: "empty",
            detail: `${mirrorBuckets} mirror buckets exist, but no mirrored files are present yet.`,
          },
    recovery:
      recoveryCheckpoints + recoveryRestorePlans > 0
        ? {
            status: "ready",
            detail: `${recoveryCheckpoints} recovery checkpoints and ${recoveryRestorePlans} restore plans are available.`,
          }
        : {
            status: "empty",
            detail: "Recovery folders exist, but no checkpoints or restore plans are recorded yet.",
          },
  };
}

function buildBrainStatus(runtime: ReturnType<typeof loadRuntimeStorage>): BrainStatus {
  const localLaneInventory = safeReadFile(path.join(RUNTIME_INVENTORY_ROOT, "local_coding_lane_inventory.md"));
  const phaseInventory = safeReadFile(path.join(RUNTIME_INVENTORY_ROOT, "spidernet_phase1_inventory.md"));

  const policyOnlyBrain = phaseInventory.includes("Brain manager is policy logic only");
  const localLaneInventoried = localLaneInventory.includes("scripts/spidernet-local-code-start.sh");
  const ollamaReachabilityInventoried = localLaneInventory.includes("Ollama endpoint reachable");
  const noAutoFailover = phaseInventory.includes("does not switch live providers automatically");

  return {
    posture: policyOnlyBrain
      ? "Brain selection is wired as policy logic, not as a live provider runtime."
      : "Brain posture is not fully described in the current inventory.",
    memorySignal: `${runtime.ledgerEvents.length} ledger events and ${runtime.vaultEntries.length} vault entries are available for bridge-deck context.`,
    localLaneSignal: localLaneInventoried
      ? ollamaReachabilityInventoried
        ? "Local coding lane inventory lists repo-local helpers and Ollama reachability."
        : "Local coding lane helpers are inventoried, but Ollama reachability is not confirmed in runtime data."
      : "Local coding lane inventory is not present.",
    ollamaSignal: `Ollama handshake is ${runtime.ollamaConfig.handshakeStatus} at ${runtime.ollamaConfig.endpoint}. ${runtime.ollamaConfig.note}`,
    note: noAutoFailover
      ? "Inventory still marks automatic failover as bridge logic, not final truth."
      : "Treat this as runtime posture only, not proof of live multi-provider execution.",
  };
}

function safePacket(packet: Record<string, unknown> | null | undefined, index: number) {
  const createdAt = typeof packet?.createdAt === "string" ? packet.createdAt : new Date(0).toISOString();
  return {
    packetId: typeof packet?.packetId === "string" ? packet.packetId : `intake-fallback-${index + 1}`,
    objective: typeof packet?.objective === "string" ? packet.objective : "No objective recorded.",
    classifications: Array.isArray(packet?.classifications) ? packet.classifications : [],
    routes: Array.isArray(packet?.routes) ? packet.routes : [],
    vaultTargets: Array.isArray(packet?.vaultTargets) ? packet.vaultTargets : [],
    intakeModes: Array.isArray(packet?.intakeModes) ? packet.intakeModes : [],
    attachments: Array.isArray(packet?.attachments) ? packet.attachments : [],
    status: typeof packet?.status === "string" ? packet.status : "captured",
    createdAt,
    source: typeof packet?.source === "string" ? packet.source : "runtime-storage",
  };
}

function buildPolicyDecision(packet: ReturnType<typeof safePacket>) {
  const holdReason = packet.objective.trim() ? null : "Objective is empty and must be captured before routing.";
  return {
    packetId: packet.packetId,
    exposureDecision: "local-first",
    boardTitle: "Dash 001 · Input Data",
    lane: "governance",
    routeFamilies: packet.routes,
    holdReason,
    policyDecisions: [
      {
        checkId: `${packet.packetId}-objective`,
        name: "Objective captured",
        outcome: packet.objective.trim() ? "pass" : "hold",
        detail: packet.objective.trim()
          ? "Packet objective is present and routing may continue after review."
          : "Packet objective is missing.",
      },
      {
        checkId: `${packet.packetId}-route`,
        name: "Route family assigned",
        outcome: packet.routes.length > 0 ? "pass" : "hold",
        detail:
          packet.routes.length > 0
            ? `Packet is assigned to ${packet.routes.join(", ")}.`
            : "No route family is assigned.",
      },
      {
        checkId: `${packet.packetId}-vault`,
        name: "Vault target assigned",
        outcome: packet.vaultTargets.length > 0 ? "pass" : "hold",
        detail:
          packet.vaultTargets.length > 0
            ? `Vault targets: ${packet.vaultTargets.join(", ")}.`
            : "No vault target is assigned.",
      },
    ],
  };
}

function buildManagerSynthesis(
  policyDecisions: ReturnType<typeof buildPolicyDecision>[],
): ManagerSynthesis {
  const activeHolds = policyDecisions
    .map((decision) => decision.holdReason)
    .filter((reason): reason is string => typeof reason === "string" && reason.length > 0);
  const placeholder = "Manager synthesis is not yet computed in this milestone.";
  console.info(
    "[spidernet]data manager synthesis built:",
    `decisions=${policyDecisions.length}`,
    `holds=${activeHolds.length}`,
  );
  return {
    manager: "saarthi",
    consensus: placeholder,
    conflict: placeholder,
    safestPath: placeholder,
    fastestViablePath: placeholder,
    lowestCostViablePath: placeholder,
    bestLongTermPath: placeholder,
    recommendedBoard: "dash-001-input-data",
    recommendedLane: "Operator",
    recommendedExposure: "manual_hold",
    whyNow: placeholder,
    activeHolds,
  };
}

export function getDashboardSnapshot(): DashboardSnapshot {
  const runtime = loadRuntimeStorage();
  const continuityStatus = buildContinuityStatus();
  const brainStatus = buildBrainStatus(runtime);
  const brainSignals = {
    memorySignal: brainStatus.memorySignal,
    localLaneSignal: brainStatus.localLaneSignal,
    ollamaSignal: brainStatus.ollamaSignal,
    note: brainStatus.note,
  };
  const brainPosture = loadPosture();

  const intakePackets = runtime.intakePackets.map(safePacket);
  const researchPackets = Array.isArray(runtime.researchPackets) ? runtime.researchPackets : [];
  const executionPackets = Array.isArray(runtime.executionPackets) ? runtime.executionPackets : [];
  const validationPackets = Array.isArray(runtime.validationPackets) ? runtime.validationPackets : [];
  const approvalPackets = Array.isArray(runtime.approvalPackets) ? runtime.approvalPackets : [];
  const passPackets = Array.isArray(runtime.passPackets) ? runtime.passPackets : [];

  const wrapperRegistry = Array.isArray(runtime.wrapperRegistry) ? runtime.wrapperRegistry : [];
  const skillRegistry = Array.isArray(runtime.skillRegistry) ? runtime.skillRegistry : [];
  const scoreRegistry = Array.isArray(runtime.scoreRegistry) ? runtime.scoreRegistry : [];
  const ledgerEvents = Array.isArray(runtime.ledgerEvents) ? runtime.ledgerEvents : [];
  const vaultEntries = Array.isArray(runtime.vaultEntries) ? runtime.vaultEntries : [];

  const packets = [
    ...intakePackets.map((packet) => ({
      ...packet,
      kind: "intake",
      manager: "saarthi",
    })),
    ...researchPackets,
    ...executionPackets,
    ...validationPackets,
    ...approvalPackets,
    ...passPackets,
  ];

  const policyDecisions =
    intakePackets.length > 0
      ? intakePackets.map(buildPolicyDecision)
      : [
          buildPolicyDecision(
            safePacket(
              {
                packetId: "intake-empty-state",
                objective: "No live intake packet exists yet. Use the create button in Dash 001.",
                classifications: ["empty-state"],
                routes: ["/boards/input-data"],
                vaultTargets: ["/boards/memory-ledger"],
                intakeModes: ["system-default"],
                attachments: [],
                status: "idle",
                createdAt: new Date().toISOString(),
                source: "system",
              },
              0,
            ),
          ),
        ];

  const packetTemplates = [
    {
      kind: "intake",
      name: "Intake Packet",
      purpose: "Capture the task and normalize routes before routing.",
      requiredFields: ["packetId", "objective", "classifications", "routes", "vaultTargets"],
      persistenceTarget: "artifacts/runtime/spidernet/packets/intake.json",
      nextHandoff: "research",
    },
    {
      kind: "research",
      name: "Research Packet",
      purpose: "Hold evidence gathering and context building.",
      requiredFields: ["packetId", "sources", "findings"],
      persistenceTarget: "artifacts/runtime/spidernet/packets/research.json",
      nextHandoff: "execution",
    },
    {
      kind: "execution",
      name: "Execution Packet",
      purpose: "Track implementation and active build work.",
      requiredFields: ["packetId", "plan", "changes"],
      persistenceTarget: "artifacts/runtime/spidernet/packets/execution.json",
      nextHandoff: "validation",
    },
    {
      kind: "validation",
      name: "Validation Packet",
      purpose: "Capture checks, tests, and route verification.",
      requiredFields: ["packetId", "checks", "results"],
      persistenceTarget: "artifacts/runtime/spidernet/packets/validation.json",
      nextHandoff: "approval",
    },
    {
      kind: "approval",
      name: "Approval Packet",
      purpose: "Track review decisions and release readiness.",
      requiredFields: ["packetId", "reviewer", "decision"],
      persistenceTarget: "artifacts/runtime/spidernet/packets/approval.json",
      nextHandoff: "pass",
    },
    {
      kind: "pass",
      name: "Pass Packet",
      purpose: "Persist accepted outcomes and freeze-ready completion.",
      requiredFields: ["packetId", "acceptedAt", "notes"],
      persistenceTarget: "artifacts/runtime/spidernet/packets/pass.json",
      nextHandoff: "ledger",
    },
  ];

  const laneModel = [
    {
      name: "Governance",
      description: "Capture, classify, and hold safe routing decisions.",
      mandate: "Capture, classify, and decide packet readiness.",
      primaryOutputs: "Intake packets, policy decisions",
      count: intakePackets.length + approvalPackets.length,
    },
    {
      name: "Research",
      description: "Collect evidence and compare options before action.",
      mandate: "Gather evidence, tools, and comparison signals.",
      primaryOutputs: "Research packets, tool registry context",
      count: researchPackets.length + scoreRegistry.length,
    },
    {
      name: "Execution",
      description: "Perform implementation and operational changes.",
      mandate: "Ship execution changes and specialist work.",
      primaryOutputs: "Execution packets, validation packets",
      count: executionPackets.length + validationPackets.length,
    },
    {
      name: "Memory",
      description: "Persist accepted history into ledger and vaults.",
      mandate: "Preserve append-only events and stored records.",
      primaryOutputs: "Ledger events, vault entries, pass packets",
      count: ledgerEvents.length + vaultEntries.length + passPackets.length,
    },
  ];

  const routeFamilies = [
    {
      route: "/boards/input-data",
      title: "Input Data",
      description: "Capture first and route later.",
      count: intakePackets.length,
      owner: "Dash 001",
      purpose: "Normalize intake packets before routing.",
      trigger: "New task capture, attachments, route tagging, and vault assignment.",
    },
    {
      route: "/boards/tools-store",
      title: "Tools Store",
      description: "Research-only tool comparison and wrapper visibility.",
      count: wrapperRegistry.length,
      owner: "Dash 002",
      purpose: "Compare tools safely before exposure decisions.",
      trigger: "Tool evaluation, wrappers, scores, and capability lookup.",
    },
    {
      route: "/boards/hive-agents",
      title: "Hive Agents",
      description: "Routing, oversight, and execution coordination.",
      count: executionPackets.length + approvalPackets.length,
      owner: "Dash 003",
      purpose: "Let manager logic decide where work goes next.",
      trigger: "Packet routing, lane movement, and review readiness.",
    },
    {
      route: "/boards/observatory",
      title: "Observatory",
      description: "Validation and runtime visibility.",
      count: validationPackets.length + ledgerEvents.length,
      owner: "Dash 005",
      purpose: "Inspect outputs, checks, and live runtime state.",
      trigger: "Verification, response checks, and runtime monitoring.",
    },
    {
      route: "/boards/memory-ledger",
      title: "Memory & Ledger",
      description: "Append-only records and vault preservation.",
      count: vaultEntries.length + ledgerEvents.length,
      owner: "Dash 006",
      purpose: "Persist accepted state and ledger history.",
      trigger: "Accepted work, ledger writes, and long-term memory routing.",
    },
  ];

  const exposureDecisionLadder = [
    {
      key: "local",
      title: "Local only",
      label: "Local only",
      detail: "Keep work inside the web SETU runtime and local files.",
      description: "Use local storage and internal boards first.",
      idealFor: "Packet capture, runtime writes, internal state changes",
      status: "live",
    },
    {
      key: "prepared",
      title: "Prepared path",
      label: "Prepared path",
      detail: "Document the path, but do not expose it live yet.",
      description: "Prepared integrations stay visible without becoming active.",
      idealFor: "Ollama, browser automation, desktop automation",
      status: "prepared",
    },
    {
      key: "review",
      title: "Manager review",
      label: "Manager review",
      detail: "Require explicit review before route escalation.",
      description: "Review routing after packet capture and policy checks.",
      idealFor: "Execution routing, approval movement, external reach",
      status: "active",
    },
    {
      key: "ledger",
      title: "Ledger persist",
      label: "Ledger persist",
      detail: "Append accepted outcomes into durable local records.",
      description: "Ledger writes happen after packet creation and validation.",
      idealFor: "Append-only events and memory history",
      status: "live",
    },
  ];

  const registryCatalog = [
    {
      name: "Wrappers",
      purpose: "Tool and wrapper inventory.",
      count: wrapperRegistry.length,
      contents: `${wrapperRegistry.length} wrapper records`,
      authority: "Dash 002 registry",
    },
    {
      name: "Skills",
      purpose: "Registered skills and capability memory.",
      count: skillRegistry.length,
      contents: `${skillRegistry.length} skill records`,
      authority: "Dash 003 registry",
    },
    {
      name: "Scores",
      purpose: "Tool score memory and comparison results.",
      count: scoreRegistry.length,
      contents: `${scoreRegistry.length} score records`,
      authority: "Dash 002 scoring",
    },
    {
      name: "Ledger",
      purpose: "Append-only runtime event history.",
      count: ledgerEvents.length,
      contents: `${ledgerEvents.length} ledger events`,
      authority: "Dash 006 ledger",
    },
    {
      name: "Vault",
      purpose: "Persisted vault entries and memory records.",
      count: vaultEntries.length,
      contents: `${vaultEntries.length} vault entries`,
      authority: "Dash 006 memory",
    },
  ];

  const snapshot = {
    intakePackets,
    researchPackets,
    executionPackets,
    validationPackets,
    approvalPackets,
    passPackets,

    wrapperRegistry,
    skillRegistry,
    scoreRegistry,
    ledgerEvents,
    vaultEntries,
    ollamaConfig: runtime.ollamaConfig,

    packets,
    policyDecisions,
    brainStatus,
    brainSignals,
    brainPosture,
    continuityStatus,
    packetTemplates,
    laneModel,
    routeFamilies,
    exposureDecisionLadder,
    registryCatalog,

    scoreMemory: scoreRegistry,
    managerSynthesis: buildManagerSynthesis(policyDecisions),
    readinessGates: [],
    researchTools: [],
    liveTools: [],
    preparedTools: [],
    activePolicies: [],
    authorityChecks: [],
    specialists: [],
    compatibilityRules: [],
    observatorySignals: [],
    boardModel: [],
  };

  return snapshot as unknown as DashboardSnapshot;
}

export function getBoardQuickStats(
  snapshot: DashboardSnapshot = getDashboardSnapshot(),
  boardId?: string,
): QuickStat[] {
  void boardId;
  return [
    { label: "Intake", value: String(snapshot.intakePackets.length) },
    { label: "Research", value: String(snapshot.researchPackets.length) },
    { label: "Execution", value: String(snapshot.executionPackets.length) },
    { label: "Validation", value: String(snapshot.validationPackets.length) },
    { label: "Approval", value: String(snapshot.approvalPackets.length) },
    { label: "Pass", value: String(snapshot.passPackets.length) },
    { label: "Wrappers", value: String(snapshot.wrapperRegistry.length) },
    { label: "Ledger", value: String(snapshot.ledgerEvents.length) },
  ];
}
