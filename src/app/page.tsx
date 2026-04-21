import { DashboardShell } from "@/components/spidernet/shell";
import { OverviewBoard } from "@/components/spidernet/overview-board";
import { getDashboardSnapshot, getBoardQuickStats } from "@/lib/spidernet/data";
import { boardRegistry } from "@/lib/spidernet/registry";

export default async function Home() {
  const snapshot = await getDashboardSnapshot();

  return (
    <DashboardShell
      activePath="/"
      eyebrow="Setu Mother Bridge"
      title="Setu Mother Bridge parent shell"
      description="Setu Mother Bridge is the parent shell for architecture, naming, module wiring, ownership boundaries, dashboard blueprint, and overall routing. The six boards remain the current internal implementation surfaces while child modules stay attached through their own lanes."
      quickStats={getBoardQuickStats(snapshot)}
    >
      <OverviewBoard boards={boardRegistry} snapshot={snapshot} />
    </DashboardShell>
  );
}
