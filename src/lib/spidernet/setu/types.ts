export type SetuPaneType =
  | "claude"
  | "codex"
  | "gpt"
  | "shell"
  | "monitor"
  | "saarthi";

export type SetuPaneLifecycle =
  | "dormant"
  | "activating"
  | "active_readonly"
  | "active_mutator"
  | "minimized"
  | "closing";

export type SetuPlacementMode = "docked" | "floating" | "bench";

export type SetuDockAnchor = "left" | "right" | "top" | "bottom" | "center";

export type SetuFloatPlacement = {
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
};

export type SetuPanePlacement = {
  mode: SetuPlacementMode;
  dockAnchor: SetuDockAnchor | null;
  dockIndex: number | null;
  float: SetuFloatPlacement | null;
};

export type SetuTaskScope = {
  goal: string;
  allowedFiles: string[];
  blockedFiles: string[];
  verification: string[];
  stopBoundary: string;
};

export type SetuSavedState = {
  lastPlacement: SetuPanePlacement;
  scrollback: string;
  taskScope: SetuTaskScope | null;
  minimizedAt: string | null;
};

export type SetuPaneMetadata = {
  paneId: string;
  type: SetuPaneType;
  label: string;
  lifecycle: SetuPaneLifecycle;
  placement: SetuPanePlacement;
  cwd: string;
  branch: string;
  repoHead: string;
  taskScope: SetuTaskScope | null;
  windowId: string | null;
  mutatorTokenHeld: boolean;
  savedState: SetuSavedState | null;
  lastActivityAt: string;
  readonlyReason: string;
};
