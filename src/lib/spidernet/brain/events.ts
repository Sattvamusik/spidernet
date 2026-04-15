import { appendLedgerEvent } from "../storage";

import type { BrainPostureStatus, BrainTier } from "./types";

export type BrainPostureLedgerEvent = {
  id: string;
  actor: "brain-posture";
  action: "brain.posture.tier.updated";
  scope: `brain:${BrainTier}:${BrainPostureStatus}`;
  timestamp: string;
};

export class BrainPostureLedgerEmitError extends Error {
  public readonly event: BrainPostureLedgerEvent;

  constructor(
    message: string,
    options: { event: BrainPostureLedgerEvent; cause?: unknown },
  ) {
    super(message, { cause: options.cause });
    this.name = "BrainPostureLedgerEmitError";
    this.event = options.event;
  }
}

export function emitPostureChangeEvent(event: BrainPostureLedgerEvent): void {
  try {
    appendLedgerEvent(event);
  } catch (cause) {
    throw new BrainPostureLedgerEmitError(
      "Failed to append brain posture change event to ledger.",
      { event, cause },
    );
  }
}
