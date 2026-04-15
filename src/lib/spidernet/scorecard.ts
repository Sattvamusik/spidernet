import type { DashboardSnapshot } from "@/lib/spidernet/types";

export function getSpecialistScorecards(snapshot: DashboardSnapshot) {
  return snapshot.specialists;
}
