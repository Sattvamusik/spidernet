import {
  createHarnessRecord,
  finalizeHarnessVerification,
  appendHarnessLedgerEntry,
  type HarnessResult,
} from "./harness";
import { validateEvent, validateDecision, type SocratesValidationResult } from "./socrates";
import { checkPermissions, checkPolicyAuthority, type ChanakyaAuthorityResult } from "./chanakya";
import { selectBrain, type BrainSelectionResult } from "./brain-manager";
import { getOllamaAvailability } from "./ollama-manager";

export type CodingFlowInput = {
  actor: string;
  stage: string;
  objective: string;
  routes: string[];
  vaultTargets: string[];
  proposedAction: string;
  allowedActors?: string[];
  allowedRoutes?: string[];
  complexity: "low" | "medium" | "high";
  privacyMode?: "cloud_allowed" | "local_only";
  cloudAvailable?: boolean;
  miniAvailable?: boolean;
  localAvailable?: boolean;
  timeoutBudgetMs: number;
};

export type CodingFlowResult = {
  ok: boolean;
  harness: HarnessResult;
  eventValidation: SocratesValidationResult;
  permissionCheck: ChanakyaAuthorityResult;
  policyCheck: ChanakyaAuthorityResult;
  decisionValidation: SocratesValidationResult;
  brain: BrainSelectionResult;
  ollama: ReturnType<typeof getOllamaAvailability>;
  holdReason: string | null;
};

function firstHoldReason(reasons: Array<string | null | undefined>): string | null {
  for (const reason of reasons) {
    if (typeof reason === "string" && reason.trim().length > 0) {
      return reason;
    }
  }
  return null;
}

export function runCodingFlow(input: CodingFlowInput): CodingFlowResult {
  const harness = createHarnessRecord({
    actor: input.actor,
    stage: input.stage,
    timeoutBudgetMs: input.timeoutBudgetMs,
  });

  const eventValidation = validateEvent({
    target: "event",
    actor: input.actor,
    stage: input.stage,
    objective: input.objective,
    routes: input.routes,
    vaultTargets: input.vaultTargets,
  });

  const permissionCheck = checkPermissions({
    actor: input.actor,
    stage: input.stage,
    requestedAction: input.proposedAction,
    allowedActors: input.allowedActors,
  });

  const policyCheck = checkPolicyAuthority({
    actor: input.actor,
    stage: input.stage,
    route: input.routes[0] ?? null,
    requestedAction: input.proposedAction,
    allowedRoutes: input.allowedRoutes,
  });

  const decisionValidation = validateDecision({
    target: "decision",
    actor: input.actor,
    stage: input.stage,
    proposedAction: input.proposedAction,
    routes: input.routes,
  });

  const brain = selectBrain({
    complexity: input.complexity,
    privacyMode: input.privacyMode,
    cloudAvailable: input.cloudAvailable,
    miniAvailable: input.miniAvailable,
    localAvailable: input.localAvailable,
  });

  const ollama = getOllamaAvailability({
    localAvailable: input.localAvailable,
  });

  const holdReason = firstHoldReason([
    eventValidation.holdReason,
    permissionCheck.holdReason,
    policyCheck.holdReason,
    decisionValidation.holdReason,
  ]);

  const finalized = finalizeHarnessVerification(
    harness,
    holdReason ? "fail" : "pass",
    {
      verifiedBy: "phase1-coding-flow",
      note: holdReason ?? "Phase 1 coding flow checks passed.",
    },
  );

  appendHarnessLedgerEntry(finalized);

  return {
    ok: !holdReason,
    harness: finalized,
    eventValidation,
    permissionCheck,
    policyCheck,
    decisionValidation,
    brain,
    ollama,
    holdReason,
  };
}
