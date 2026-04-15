import { boardRegistry, widgetRegistry } from "@/lib/spidernet/registry";
import type { BoardDefinition, BoardId } from "@/lib/spidernet/types";

export function getBoardBySlug(slug: string): BoardDefinition | undefined {
  return boardRegistry.find((board) => board.slug === slug);
}

export function getBoardById(id: BoardId): BoardDefinition | undefined {
  return boardRegistry.find((board) => board.id === id);
}

export function getWidgetsForBoard(id: BoardId) {
  return widgetRegistry.filter((widget) => widget.boardId === id);
}

export function getVisibleBoards(mode: "main" | "future" | "all" = "all") {
  if (mode === "all") {
    return boardRegistry;
  }

  return boardRegistry.filter((board) => board.visibility === mode);
}
