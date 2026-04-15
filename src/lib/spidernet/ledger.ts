import type { DashboardSnapshot, LedgerEvent } from "@/lib/spidernet/types";

export function getAppendOnlyLedger(snapshot: DashboardSnapshot): LedgerEvent[] {
  return snapshot.ledgerEvents;
}
