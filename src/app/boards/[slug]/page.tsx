import { notFound } from "next/navigation";

import { HiveAgentsBoard } from "@/components/spidernet/hive-agents-board";
import { InputDataBoard } from "@/components/spidernet/input-data-board";
import { MemoryLedgerBoard } from "@/components/spidernet/memory-ledger-board";
import { ObservatoryBoard } from "@/components/spidernet/observatory-board";
import { DashboardShell } from "@/components/spidernet/shell";
import { SpecialistTaskBoard } from "@/components/spidernet/specialist-task-board";
import { ToolsStoreBoard } from "@/components/spidernet/tools-store-board";
import { getBoardQuickStats, getDashboardSnapshot } from "@/lib/spidernet/data";
import { getBoardBySlug } from "@/lib/spidernet/router";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function renderBoard(slug: string, snapshot: Awaited<ReturnType<typeof getDashboardSnapshot>>) {
  switch (slug) {
    case "input-data":
      return <InputDataBoard snapshot={snapshot} />;
    case "tools-store":
      return <ToolsStoreBoard snapshot={snapshot} />;
    case "hive-agents":
      return <HiveAgentsBoard snapshot={snapshot} />;
    case "setu-bridge":
      return <SpecialistTaskBoard snapshot={snapshot} />;
    case "observatory":
      return <ObservatoryBoard snapshot={snapshot} />;
    case "memory-ledger":
      return <MemoryLedgerBoard snapshot={snapshot} />;
    default:
      return null;
  }
}

export default async function BoardPage({ params }: PageProps) {
  const { slug } = await params;
  const board = getBoardBySlug(slug);

  if (!board) {
    notFound();
  }

  const snapshot = await getDashboardSnapshot();
  const body = renderBoard(slug, snapshot);

  if (!body) {
    notFound();
  }

  return (
    <DashboardShell
      activePath={board.route}
      eyebrow="Locked board"
      title={board.title}
      description={board.description}
      quickStats={getBoardQuickStats(snapshot, board.id)}
    >
      {body}
    </DashboardShell>
  );
}
