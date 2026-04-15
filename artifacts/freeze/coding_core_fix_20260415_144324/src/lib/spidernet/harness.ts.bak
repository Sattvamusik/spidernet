export type HarnessStatus = "pending" | "passed" | "failed";

export type HarnessVerificationOutcome = "pending" | "pass" | "fail";

export type HarnessRetryMetadata = {
  attempt: number;
  maxAttempts: number;
  retryable: boolean;
  lastAttemptAt: string | null;
  lastError: string | null;
};

export type HarnessVerificationResult = {
  outcome: HarnessVerificationOutcome;
  verifiedBy: string | null;
  verifiedAt: string | null;
  note: string | null;
};

export type HarnessTimestamps = {
  createdAt: string;
  updatedAt: string;
  finalizedAt: string | null;
};

export type HarnessInput = {
  actor: string;
  stage: string;
  timeoutBudgetMs: number;
  status?: HarnessStatus;
  retry?: Partial<HarnessRetryMetadata>;
  rollback?: boolean;
  verification?: Partial<HarnessVerificationResult>;
  timestamps?: Partial<HarnessTimestamps>;
};

export type HarnessResult = {
  actor: string;
  stage: string;
  status: HarnessStatus;
  timeoutBudgetMs: number;
  retry: HarnessRetryMetadata;
  verification: HarnessVerificationResult;
  rollback: boolean;
  timestamps: HarnessTimestamps;
};

function nowIso(): string {
  return new Date().toISOString();
}

function buildRetryMetadata(retry?: Partial<HarnessRetryMetadata>): HarnessRetryMetadata {
  return {
    attempt: typeof retry?.attempt === "number" ? retry.attempt : 0,
    maxAttempts: typeof retry?.maxAttempts === "number" ? retry.maxAttempts : 1,
    retryable: typeof retry?.retryable === "boolean" ? retry.retryable : false,
    lastAttemptAt: typeof retry?.lastAttemptAt === "string" ? retry.lastAttemptAt : null,
    lastError: typeof retry?.lastError === "string" ? retry.lastError : null,
  };
}

function buildVerificationResult(
  verification?: Partial<HarnessVerificationResult>,
): HarnessVerificationResult {
  return {
    outcome: verification?.outcome === "pass" || verification?.outcome === "fail" ? verification.outcome : "pending",
    verifiedBy: typeof verification?.verifiedBy === "string" ? verification.verifiedBy : null,
    verifiedAt: typeof verification?.verifiedAt === "string" ? verification.verifiedAt : null,
    note: typeof verification?.note === "string" ? verification.note : null,
  };
}

function buildTimestamps(timestamps?: Partial<HarnessTimestamps>): HarnessTimestamps {
  const createdAt = typeof timestamps?.createdAt === "string" ? timestamps.createdAt : nowIso();
  return {
    createdAt,
    updatedAt: typeof timestamps?.updatedAt === "string" ? timestamps.updatedAt : createdAt,
    finalizedAt: typeof timestamps?.finalizedAt === "string" ? timestamps.finalizedAt : null,
  };
}

export function createHarnessRecord(input: HarnessInput): HarnessResult {
  const timestamps = buildTimestamps(input.timestamps);

  return {
    actor: input.actor,
    stage: input.stage,
    status: input.status ?? "pending",
    timeoutBudgetMs: input.timeoutBudgetMs,
    retry: buildRetryMetadata(input.retry),
    verification: buildVerificationResult(input.verification),
    rollback: input.rollback ?? false,
    timestamps,
  };
}

export function finalizeHarnessVerification(
  record: HarnessResult,
  outcome: "pass" | "fail",
  details?: {
    verifiedBy?: string;
    verifiedAt?: string;
    note?: string;
  },
): HarnessResult {
  const verifiedAt = details?.verifiedAt ?? nowIso();
  const nextStatus: HarnessStatus = outcome === "pass" ? "passed" : "failed";

  return {
    ...record,
    status: nextStatus,
    verification: {
      outcome,
      verifiedBy: typeof details?.verifiedBy === "string" ? details.verifiedBy : record.verification.verifiedBy,
      verifiedAt,
      note: typeof details?.note === "string" ? details.note : record.verification.note,
    },
    timestamps: {
      ...record.timestamps,
      updatedAt: verifiedAt,
      finalizedAt: verifiedAt,
    },
  };
}

export function appendHarnessLedgerEntry(_record: HarnessResult): void {
  void _record;
  // Inventory-only placeholder for future ledger append wiring.
}
