import type { DashboardSnapshot } from "@/lib/spidernet/types";

export function getRoutingSafetySummary(snapshot: DashboardSnapshot) {
  const holds = snapshot.policyDecisions.filter((decision) => !decision.executionAllowed);

  return {
    holds,
    total: snapshot.policyDecisions.length,
  };
}
