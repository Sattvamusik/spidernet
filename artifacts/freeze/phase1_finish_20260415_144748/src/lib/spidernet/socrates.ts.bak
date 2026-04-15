export type SocratesValidationTarget = "event" | "decision";

export type SocratesValidationInput = {
  target: SocratesValidationTarget;
  actor: string;
  stage: string;
  objective?: string | null;
  routes?: string[];
  vaultTargets?: string[];
  proposedAction?: string | null;
};

export type SocratesValidationResult = {
  ok: boolean;
  target: SocratesValidationTarget;
  reasons: string[];
  holdReason: string | null;
};

function hasText(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function cleanArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
}

export function validateEvent(input: SocratesValidationInput): SocratesValidationResult {
  const reasons: string[] = [];
  const routes = cleanArray(input.routes);
  const vaultTargets = cleanArray(input.vaultTargets);

  if (!hasText(input.actor)) reasons.push("Missing actor.");
  if (!hasText(input.stage)) reasons.push("Missing stage.");
  if (!hasText(input.objective)) reasons.push("Missing objective.");
  if (routes.length === 0) reasons.push("Missing route assignment.");
  if (vaultTargets.length === 0) reasons.push("Missing vault target.");

  return {
    ok: reasons.length === 0,
    target: "event",
    reasons,
    holdReason: reasons.length > 0 ? reasons[0] : null,
  };
}

export function validateDecision(input: SocratesValidationInput): SocratesValidationResult {
  const reasons: string[] = [];
  const routes = cleanArray(input.routes);

  if (!hasText(input.actor)) reasons.push("Missing actor.");
  if (!hasText(input.stage)) reasons.push("Missing stage.");
  if (!hasText(input.proposedAction)) reasons.push("Missing proposed action.");
  if (routes.length === 0) reasons.push("Missing route family.");

  return {
    ok: reasons.length === 0,
    target: "decision",
    reasons,
    holdReason: reasons.length > 0 ? reasons[0] : null,
  };
}
