import { DashboardShell } from "@/components/spidernet/shell";
import { OverviewBoard } from "@/components/spidernet/overview-board";
import { getDashboardSnapshot, getBoardQuickStats } from "@/lib/spidernet/data";
import { boardRegistry } from "@/lib/spidernet/registry";

export default async function Home() {
  const snapshot = await getDashboardSnapshot();

  return (
    <DashboardShell
      activePath="/"
      eyebrow="SpiderNet Control Deck"
      title="White web SETU operating surface"
      description="The current white dashboard remains the main product direction. It now carries the DRISHTI Phase 5 operating model: six locked boards, four lanes, typed packets, policy-before-routing, vault routing, registry-driven execution, durable local storage, and explicit live-versus-prepared tool exposure."
      quickStats={getBoardQuickStats(snapshot)}
    >
      <OverviewBoard boards={boardRegistry} snapshot={snapshot} />
    </DashboardShell>
  );
}
