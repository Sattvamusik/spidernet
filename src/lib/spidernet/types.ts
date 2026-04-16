import type { BrainPostureSnapshot } from "./brain/types";

export type BoardId =
  | "dash-001-input-data"
  | "dash-002-tools-store"
  | "dash-003-hive-agents"
  | "dash-004-setu-bridge"
  | "dash-005-observatory"
  | "dash-006-memory-ledger";

export type BoardStatus = "live" | "prepared";
export type VisibilityMode = "main" | "future";
export type IconName =
  | "overview"
  | "input"
  | "tools"
  | "agents"
  | "bridge"
  | "observatory"
  | "ledger";

export type BoardDefinition = {
  id: BoardId;
  code: string;
  slug: string;
  title: string;
  shortTitle: string;
  route: string;
  icon: IconName;
  order: number;
  status: BoardStatus;
  visibility: VisibilityMode;
  description: string;
  shellSummary: string;
  command: string;
  purposeLock: string;
};

export type WidgetDefinition = {
  id: string;
  boardId: BoardId;
  title: string;
  description: string;
  zone: string;
};

export type LaneName = "Architect" | "Builder" | "Auditor" | "Operator";

export type LaneDefinition = {
  name: LaneName;
  mandate: string;
  primaryOutputs: string;
};

export type RouteFamily = "DNA" | "RUL" | "LIB" | "BLP" | "FTD";

export type RouteRule = {
  route: RouteFamily;
  purpose: string;
  trigger: string;
  owner: string;
};

export type PacketKind =
  | "intake"
  | "research"
  | "approval"
  | "execution"
  | "validation"
  | "pass";

export type PacketTemplate = {
  kind: PacketKind;
  name: string;
  purpose: string;
  requiredFields: string[];
  persistenceTarget: string;
  nextHandoff: string;
};

export type ExposureDecision =
  | "api"
  | "cli"
  | "browser_automation"
  | "desktop_automation"
  | "manual_hold";

export type ExposureDecisionStep = {
  key: ExposureDecision;
  label: string;
  description: string;
  idealFor: string;
  approvalWeight: "low" | "medium" | "high";
  status: "live" | "prepared" | "hold";
};

export type PolicyCheck = {
  id: string;
  name: string;
  decisionRule: string;
  actionIfTrue: string;
  gateOwner: string;
};

export type PolicyOutcome = "pass" | "review" | "hold";

export type PolicyDecision = {
  checkId: string;
  name: string;
  outcome: PolicyOutcome;
  detail: string;
};

export type RoutingDecision = {
  packetId: string;
  boardId: BoardId;
  boardTitle: string;
  lane: LaneName;
  routeFamilies: RouteFamily[];
  exposureDecision: ExposureDecision;
  policyDecisions: PolicyDecision[];
  executionAllowed: boolean;
  holdReason?: string;
};

export type RegistrySpec = {
  name: string;
  purpose: string;
  contents: string;
  authority: string;
};

export type ToolHealth = "healthy" | "watch" | "degraded";
export type ConnectorStatus = "connected" | "partial" | "offline";

export type ResearchToolProfile = {
  id: string;
  name: string;
  specialty: string;
  bestUse: string;
  limitations: string;
  footprint: string;
  cost: "low" | "medium" | "high";
  latency: "low" | "medium" | "high";
  confidence: "low" | "medium" | "high";
  taskFamily: string;
  advisoryRole: string;
  reviewRole: string;
  apiSuitability: "low" | "medium" | "high";
  cliSuitability: "low" | "medium" | "high";
  browserSuitability: "low" | "medium" | "high";
  desktopSuitability: "low" | "medium" | "high";
  worthDoingScore: number;
  bottleneckRemovalScore: number;
  longTermScore: number;
  confidenceScore: number;
  health: ToolHealth;
  connectorStatus: ConnectorStatus;
  researchOnly: boolean;
};

export type SpecialistProfile = {
  id: string;
  name: string;
  workProfile: string;
  specialty: string;
  inputContract: string;
  outputContract: string;
  advisoryCompatibility: string;
  helperCompatibility: string;
  handoffCompatibility: string;
  safeUseNotes: string;
};

export type CompatibilityRule = {
  id: string;
  pairing: string;
  worksTogether: string;
  asksHelpFrom: string;
  reviewPath: string;
  handoffPath: string;
  caution: string;
};

export type WrapperRegistryEntry = {
  id: string;
  software: string;
  exposurePath: ExposureDecision;
  status: "live" | "prepared" | "hold";
  why: string;
  guardrails: string;
  linkedBoards: BoardId[];
  linkedPacketKinds: PacketKind[];
};

export type SkillRegistryEntry = {
  id: string;
  skillName: string;
  discovery: string;
  purpose: string;
  currentState: "live" | "prepared";
  linkedBoard: BoardId;
};

export type ToolScoreMemory = {
  id: string;
  tool: string;
  successRate: string;
  cost: string;
  latency: string;
  reworkNeeded: string;
  failureType: string;
  bestTaskFamily: string;
};

export type ReadinessGate = {
  id: string;
  name: string;
  owner: string;
  status: "ready" | "review" | "hold" | "prepared";
  evidence: string;
};

export type PacketStatus = "captured" | "researching" | "awaiting_approval" | "executing" | "validating" | "closed";

export type PacketBase = {
  packetId: string;
  kind: PacketKind;
  status: PacketStatus;
  createdAt: string;
  manager: string;
};

export type IntakePacket = PacketBase & {
  kind: "intake";
  source: string;
  objective: string;
  classifications: string[];
  routes: RouteFamily[];
  vaultTargets: RouteFamily[];
  intakeModes: string[];
  attachments: string[];
};

export type ResearchPacket = PacketBase & {
  kind: "research";
  question: string;
  dispatchedTools: string[];
  reportTargets: RouteFamily[];
  evaluationDimensions: string[];
};

export type ApprovalPacket = PacketBase & {
  kind: "approval";
  summary: string;
  approvers: string[];
  readinessState: string;
  requiresUserPass: boolean;
  approvalScope: string[];
};

export type ExecutionPacket = PacketBase & {
  kind: "execution";
  stageOwner: string;
  specialists: string[];
  nextStage: string;
  blockers: string[];
  toolExposureDecision: ExposureDecision;
};

export type ValidationPacket = PacketBase & {
  kind: "validation";
  testStreams: string[];
  simulationStreams: string[];
  auditStreams: string[];
  gatekeeper: string;
  definitionOfDone: string[];
};

export type PassPacket = PacketBase & {
  kind: "pass";
  decision: string;
  ledgerRoutes: RouteFamily[];
  retrospectiveTargets: string[];
  signedBy: string[];
  closeoutArtifacts: string[];
};

export type WorkflowPacket =
  | IntakePacket
  | ResearchPacket
  | ApprovalPacket
  | ExecutionPacket
  | ValidationPacket
  | PassPacket;

export type VaultEntry = {
  id: string;
  route: RouteFamily;
  title: string;
  summary: string;
  sourcePacketId: string;
  status: "live" | "archived" | "prepared";
  updatedAt: string;
};

export type LedgerEvent = {
  id: string;
  actor: string;
  action: string;
  scope: string;
  timestamp: string;
  appendOnly: true;
};

export type ManagerSynthesis = {
  manager: string;
  consensus: string;
  conflict: string;
  safestPath: string;
  fastestViablePath: string;
  lowestCostViablePath: string;
  bestLongTermPath: string;
  recommendedBoard: BoardId;
  recommendedLane: LaneName;
  recommendedExposure: ExposureDecision;
  whyNow: string;
  activeHolds: string[];
};

export type BrainStatus = {
  posture: string;
  memorySignal: string;
  localLaneSignal: string;
  ollamaSignal: string;
  note: string;
};

export type ContinuityStatusItem = {
  status: "verified" | "captured" | "ready" | "empty" | "missing";
  detail: string;
};

export type ContinuityStatus = {
  freeze: ContinuityStatusItem;
  mirror: ContinuityStatusItem;
  recovery: ContinuityStatusItem;
};

export type ObservatorySignal = {
  id: string;
  title: string;
  status: "healthy" | "watch" | "degraded" | "prepared";
  note: string;
};

export type OllamaConfig = {
  endpoint: string;
  model: string;
  handshakeStatus: "prepared" | "ready" | "missing";
  lastCheckedAt: string;
  note: string;
};

export type QuickStat = {
  label: string;
  value: string;
};

export type DashboardSnapshot = {
  packets: WorkflowPacket[];
  intakePackets: IntakePacket[];
  researchPackets: ResearchPacket[];
  approvalPackets: ApprovalPacket[];
  executionPackets: ExecutionPacket[];
  validationPackets: ValidationPacket[];
  passPackets: PassPacket[];
  vaultEntries: VaultEntry[];
  ledgerEvents: LedgerEvent[];
  wrapperRegistry: WrapperRegistryEntry[];
  skillRegistry: SkillRegistryEntry[];
  scoreMemory: ToolScoreMemory[];
  policyDecisions: RoutingDecision[];
  managerSynthesis: ManagerSynthesis;
  brainStatus: BrainStatus;
  brainSignals: {
    memorySignal: string;
    localLaneSignal: string;
    ollamaSignal: string;
    note: string;
  };
  brainPosture?: BrainPostureSnapshot;
  continuityStatus: ContinuityStatus;
  readinessGates: ReadinessGate[];
  researchTools: ResearchToolProfile[];
  specialists: SpecialistProfile[];
  compatibilityRules: CompatibilityRule[];
  observatorySignals: ObservatorySignal[];
  ollamaConfig: OllamaConfig;
  exposureDecisionLadder: ExposureDecisionStep[];
  routeFamilies: RouteRule[];
  laneModel: LaneDefinition[];
  packetTemplates: PacketTemplate[];
  registryCatalog: RegistrySpec[];
  boardModel: BoardDefinition[];
};
