# Setu Operator Bay — Design (Design Only)

Status: **Design only. No implementation.**
Scope: a dashboard operator bay inside Setu that hosts 1–6 terminal/agent panes (Claude, Codex, GPT, shell, monitor) with Saarthi as the mediator and single authorization source. This document specifies layout, placement, controls, lifecycle, locking, routing, and rollout. It does not specify code, React components, or process-spawning mechanics.

Governing model: **Saarthi orchestration** (mediator + single-mutator + scoped-window + handoff-backed). See `.handoff/01-decisions.md` and the adopted orchestration rules. The operator bay is the UI surface for that model — not a new governance layer.

Non-negotiables:
- Saarthi alone authorizes mutation.
- One mutator at a time across the entire bay (and across the whole project).
- Multiple read-only panes may be active simultaneously.
- Every pane visibly shows: repo, branch, task, state.
- Every active session carries: goal, allowed files, blocked files, verification steps, stop boundary.
- Repo filesystem, `.handoff/`, architecture docs, and git history are the nervous system. Pane state is display, not truth.
- No destructive action without explicit approval.

## 1. Layout and placement modes

The bay supports **two orthogonal placement models**: docked layouts and floating windows. They coexist. A session may have, e.g., 2 docked panes on the right edge, 1 docked at the bottom, and 2 floating.

### 1.1 Docked layouts

Docked panes snap to one of five anchor regions:

- **Left edge** — full-height strip on the left.
- **Right edge** — full-height strip on the right.
- **Top edge** — full-width strip across the top.
- **Bottom edge** — full-width strip across the bottom.
- **Center** — the main workspace region; panes tiled.

Within each anchor, 1–N panes tile automatically. The bay supports four canonical tile patterns per region:

| Mode | Panes | Tiling |
|---|---|---|
| **Solo (1)** | 1 | one pane fills the region |
| **Split (2)** | 2 | stacked along the region's minor axis |
| **Quad (4)** | 4 | 2×2 grid within the region |
| **Hex (6)** | 6 | 3×2 grid within the region |

Maximum is 6 on-screen panes total (docked + floating). Beyond that is a different product; do not design for it here. A "bench" drawer lists additional panes that exist but are not currently on screen.

### 1.2 Floating panes

A floating pane lives inside the workspace but is not anchored. It has:

- an absolute position (x, y) within the Setu workspace,
- an independent size (width, height),
- a z-order for stacking,
- no tiling relationship to other panes.

Floating panes are explicitly not OS-level windows. They are confined to the Setu workspace and serialize with the bay layout.

### 1.3 Move, dock, and float transitions

Any pane may transition between docked and floating at any time. Transitions are display-only and never change lifecycle, authorization, or mutator-token state.

- **Dock → dock** — user drags a pane from one anchor region to another. The destination region re-tiles.
- **Dock → float** — user "tears off" a pane. It becomes floating at its drop position with its current size.
- **Float → dock** — user drags a floating pane over an anchor region; a snap target highlights; releasing docks it into that region.
- **Float → float** — free move/resize within the workspace.

Layout rules:
- Layout mode is persisted per user in Setu's local dashboard state (not in `.handoff/`). It is display preference, not orchestration state.
- A pane's placement is not semantically meaningful. Role and authorization are carried by pane metadata, not coordinates or anchors.

### 1.4 Snap / dock behavior

Snap is the UX that makes drag-to-dock predictable.

- Drag hit-tests against anchor regions with a visible preview rectangle.
- Snap radius: ~24 px from an edge (tunable). Within radius, the pane highlights the target region and releasing drops it there.
- Center snap requires an explicit modifier (e.g., dropping onto the workspace interior, not the edge band) to prevent accidental center-dock when users only want to move.
- Corner drops onto an already-full region (6 panes) push the oldest bench candidate out — with a confirmation if that pane is active (readonly or mutator).
- Snap lines also appear when two floating panes pass near each other for alignment affordance, but this is alignment only; it does not dock them together.

## 2. Pane types and metadata

Pane types (v1):

- **Claude** — architecture / careful implementation specialist (mutator-capable).
- **Codex** — tight execution specialist (mutator-capable).
- **GPT** — general consultation / research specialist (read-only by default in v1; mutator gating deferred).
- **Shell** — raw terminal executor (mutator-capable; highest blast radius).
- **Monitor** — read-only process / log / file-watcher pane (never mutating).
- **Saarthi console** — mediator surface; not an executor. Shows active authorization, window state, routing decisions, and open windows. One per bay.

Pane metadata (displayed on the pane header and persisted across placements):

```
{
  "paneId":            "<uuid>",
  "type":              "claude" | "codex" | "gpt" | "shell" | "monitor" | "saarthi",
  "label":             "<human-readable, e.g. 'Claude — Phase 2d'>",
  "lifecycle":         "dormant" | "activating" | "active_readonly" | "active_mutator"
                       | "minimized" | "closing",
  "placement": {
    "mode":            "docked" | "floating" | "bench",
    "dockAnchor":      "left" | "right" | "top" | "bottom" | "center" | null,
    "dockIndex":       <int in region tile order> | null,
    "float":           { "x": <px>, "y": <px>, "w": <px>, "h": <px>, "z": <int> } | null
  },
  "cwd":               "<absolute repo path>",
  "branch":            "<git branch or '(detached)'>",
  "repoHead":          "<short sha>",
  "taskScope": {
    "goal":            "<one sentence>",
    "allowedFiles":    ["<path or glob>", ...],
    "blockedFiles":    ["<path or glob>", ...],
    "verification":    ["npm run lint", "npx tsc --noEmit", "npm run build"],
    "stopBoundary":    "<explicit condition>"
  } | null,
  "windowId":          "<uuid of the open Saarthi window, or null>",
  "mutatorTokenHeld":  true | false,
  "savedState":        {
    "lastPlacement":   { ... same shape as placement ... },
    "scrollback":      "<serialized terminal buffer or ref>",
    "taskScope":       { ... same shape as taskScope ... } | null,
    "minimizedAt":     "<iso>" | null
  } | null,
  "lastActivityAt":    "<iso>",
  "readonlyReason":    "<string, if active_readonly>"
}
```

Metadata is render-only. Authoritative state lives in:
- Saarthi's in-memory window registry (process-scoped).
- `.handoff/` snapshots (cross-session).
- Git (durable commits).

Panes do not own this metadata; they receive it. A pane crashing and respawning must not lose authorization — because it never held authorization in the first place; Saarthi did.

## 3. Active / sleeping lifecycle

States:

```
dormant ──(Saarthi activates)──▶ activating ──▶ active_readonly
                                                     │
                                                (grant mutator)
                                                     ▼
                                               active_mutator
                                                     │
                       ┌─────────────────────────────┤
                       ▼                             ▼
                   minimized                      closing ──▶ dormant
                       │                             │
                 (user restores)                     ▼
                       ▼                          dormant
                active_readonly
                or active_mutator
                (if still authorized)
```

- **dormant** — pane may be visible as a placeholder or stashed in the bench. No process/session attached. No subscriptions. No file watchers. No inbound messages accepted. Post-task state.
- **activating** — Saarthi has issued an activation with a task scope. The pane spawns or attaches its session but has not yet been granted any mutation rights. Transient.
- **active_readonly** — session is alive and can read, search, think, present. Cannot mutate repo state. Default active state. Multiple panes may be `active_readonly` simultaneously.
- **active_mutator** — session holds the mutator token. May write files under `taskScope.allowedFiles`. **At most one pane in the bay may be in this state at any time.**
- **minimized** — pane is hidden or collapsed but its session, scrollback, and placement are preserved. Distinct from `dormant`: the process is still attached; restoring is free. The mutator token is **released on minimize** — no pane may be both minimized and `active_mutator`. If a mutator pane is minimized, it first transitions to `active_readonly` (token returned to Saarthi), then minimizes.
- **closing** — pane is finalizing (writing handoff, committing if approved, flushing logs). Cannot accept new instructions. Transient.

Wake / sleep rules:
- Panes wake only on explicit Saarthi activation with a task scope, or on user-triggered restore from `minimized`.
- Panes sleep (→ `dormant`) when the task stop-boundary is hit, when Saarthi revokes, or when the user closes the pane from `minimized`.
- Dormant panes do not consume subscriptions, background timers, or file watchers. Minimized panes do (that is the point; it is not free).
- A pane idling past a threshold (suggested: 15 min no activity in `active_readonly`, 5 min in `active_mutator`) returns to Saarthi for re-authorization before continuing. Threshold is a guard against accidental long-lived windows, not a hard SLA.

Restore semantics (reopening):
- Restoring from `minimized` rehydrates placement, scrollback, label, and previous `taskScope`. Lifecycle returns to `active_readonly` by default. To regain mutator status, the pane must re-request the token from Saarthi — minimize always drops the token.
- Restoring from `dormant` (opening a previously-closed pane again) attempts to replay its `savedState` if present. If the saved state is too old (threshold: 24 h) or the branch/HEAD has diverged materially, the pane restores UI-only (placement, label) and starts fresh for session content, surfacing a notice to the user.
- If `savedState` is unavailable, the pane opens clean.

## 4. Pane controls, placement, and persistence

### 4.1 Open (+)

- The bay dashboard surfaces a **+** control. Clicking it offers a picker of pane types (Claude, Codex, GPT, shell, monitor, Saarthi console).
- Opening a pane creates it in `dormant` and places it according to the user's drop target (docked region or floating position). Opening does not wake the pane; activation is still a separate Saarthi-authorized step.
- The + control is visible in the dashboard chrome and also inside the Saarthi console pane for discoverability.
- Quick-reopen: the + menu lists recently-closed panes with their `savedState` summary so users can restore by name rather than reconstructing the task scope.

### 4.2 Close (X)

- Every pane header carries an **X** close control, visible whenever the pane is not in `closing` (where closing UI would race with the control).
- Close semantics depend on lifecycle:
  - From `dormant` → the pane is removed from the bay entirely. `savedState` is preserved in the recently-closed list (bounded; suggested 20 entries).
  - From `active_readonly` → pane transitions `closing → dormant → removed`. Any outstanding verification is cancelled cleanly; no state is written.
  - From `active_mutator` → close is confirmed explicitly. On confirm, the pane refreshes `.handoff/` with partial-work notes, releases the mutator token, transitions `closing → dormant → removed`. This is the only path where close does I/O.
  - From `minimized` → like `dormant`, but with a brief prompt: "Close this minimized session? Saved scrollback and task will be lost beyond the recently-closed list."
- Close is **not** a destructive repo action; it affects only the pane. Files already written to disk remain; commits already made remain.

### 4.3 Minimize / sleep

- Every pane header carries a **minimize** (sleep) control distinct from X.
- Minimize transitions the pane to `minimized` (see §3). Placement is preserved in `savedState.lastPlacement`. If the pane held the mutator token, it is released to Saarthi first (see §3).
- Minimize is the default "I'll come back to this" affordance. Close is for "I am done with this session."
- A minimized pane is visible in the bench drawer (compact row showing label, type, last activity, saved placement) and restorable from there.

### 4.4 Resize

- Docked panes resize along the region's minor axis by dragging the splitter between tiles. The region's outer edge (where it meets the workspace) is also draggable to widen/narrow the entire region.
- Floating panes resize from any edge or corner handle. Minimum size constraints ensure the header (with repo/branch/task/state) remains legible; below the minimum, resize snaps to minimum.
- Resize does not wake panes and does not change lifecycle.

### 4.5 Move (left / right / top / bottom / center / free)

- Drag the pane header to move.
- Releasing over an anchor region snaps it into that docked layout (§1.4).
- Releasing over the workspace interior (outside snap radius) leaves it floating at the drop position.
- Keyboard shortcuts provide deterministic placement without drag: suggested `Mod+Shift+{Left,Right,Up,Down,.}` to send the focused pane to the left/right/top/bottom/center anchor, and `Mod+Shift+F` to unpin (float).
- Move preserves size when transitioning between floating positions. When docking, size adapts to the region's tile rules.

### 4.6 State persistence across restart

- Setu persists the bay layout (per-pane `placement` and `savedState`) locally. Not in `.handoff/` — layout is display preference.
- On Setu restart, panes are rehydrated in `dormant` with their placements restored. Scrollback is restored where serializable; live process attachments are not — Saarthi must re-activate any session that needs to resume.
- Layout persistence is user-local; it is not shared or source-of-truth.

## 5. One-mutator-at-a-time locking model

The single mutator invariant is the core safety property. The bay enforces it through a **mutator token**.

Rules:
- There is exactly one mutator token per repo. Not per pane, not per agent — per repo. (A future multi-repo bay introduces one token per repo; out of scope here.)
- The token is held by at most one pane at any time.
- The token is owned by Saarthi, loaned to a pane, and returned to Saarthi. Panes cannot transfer the token directly to another pane.
- Holding the token is necessary but not sufficient: the pane must also operate within its `taskScope.allowedFiles` and respect `blockedFiles`.
- Attempting a mutation without the token fails closed — the pane's tool calls are gated by Saarthi; the pane itself cannot bypass this. (Enforcement vector described in §6.)
- Revocation is unilateral. Saarthi may revoke mid-task (e.g., user switches focus to a different task). On revoke, the pane finishes its in-flight tool call if safe, refreshes `.handoff/` with partial-work notes, and returns to `active_readonly`.
- Minimize, close, and floating/docking never grant the token. Only Saarthi grants. Only via an explicit request with a scope.

Token-request protocol (pane ⇄ Saarthi):

```
Pane:     request_mutator(paneId, proposedScope)
Saarthi:  evaluate(proposedScope vs. current windows, blockedFiles, branch, handoff state)
          ├── deny (reason) ──▶ pane stays active_readonly
          └── grant (windowId, scope) ──▶ pane transitions to active_mutator
```

Evaluation inputs:
- Is another pane already `active_mutator`? If yes, deny unless preempt is explicitly approved by the user.
- Does `proposedScope.allowedFiles` intersect any other pane's last committed blockedFiles? Flag.
- Is the branch clean enough (no conflicting uncommitted changes)? If not, require user confirmation.
- Is the work in-scope for the current `.handoff/manifest.json` `scope_lock`? If not, require explicit user override.

Denial is the safe default. Saarthi denying is cheap; Saarthi granting wrongly corrupts state.

## 6. Saarthi routing and pane activation rules

Saarthi is the only component that:
- Activates panes.
- Grants / revokes mutator tokens.
- Opens and closes inter-pane communication windows.
- Mediates requests from FTD packets into executor sessions.

Routing model:

```
FTD packet ──▶ Saarthi ──(select executor)──▶ pane (activation + scope)
                  │
                  ├── monitor pane gets read subscription (side-channel)
                  └── saarthi console pane shows routing decision
```

Activation rules:
- A pane activates only when Saarthi issues `activate(paneId, taskScope)`. No self-activation. No cross-pane activation. User pressing **+** creates a pane but does not activate it.
- Activation carries the full `taskScope`. Missing fields → activation denied. (Goal, allowedFiles, blockedFiles, verification, stopBoundary are all required.)
- When activating pane A, any currently-`active_mutator` pane B is either asked to finish (clean handover) or remains holding the token until it reaches its stop boundary. A and B are never both mutators.
- Activation writes a routing-decision row to the Saarthi console pane (and, on approval, to `.handoff/`).

Inter-pane consultation ("window open"):
- If pane A needs input from pane B, A requests a scoped-consult through Saarthi: `consult(from: A, to: B, purpose, bounded_io_shape)`.
- Saarthi either denies or opens a window: `window_open(windowId, A↔B, purpose, ttl)`.
- The window is strictly input/output for the stated purpose. B does not gain the mutator token by participating in a consult. B remains `active_readonly` throughout.
- Saarthi closes the window as soon as A has what it needs, or when the TTL expires.
- No window is ever opened pane-to-pane directly. No persistent pane-to-pane channels.

Enforcement vector: the pane's tool-call layer is gated by a Saarthi client wrapper. A pane without the mutator token sees write-class tools rejected at call time with a denial reason that surfaces in the pane UI. This is enforcement, not a convention — convention alone fails under agentic pressure.

Saarthi console surface (read-only display):
- Current mutator pane, if any, with its `taskScope.goal`.
- Open windows: `{ windowId, fromPaneId, toPaneId, purpose, openedAt }`.
- Last 10 routing decisions.
- `.handoff/manifest.json` `latest_commit` and `scope_lock`.
- Divergence indicator if pane metadata disagrees with git HEAD.

## 7. Read-only vs mutating sessions

A session's capability set is determined by its lifecycle state, not its pane type.

| Capability | `dormant` | `minimized` | `active_readonly` | `active_mutator` |
|---|---|---|---|---|
| Read files | — | — | ✅ | ✅ |
| Grep / glob / search | — | — | ✅ | ✅ |
| Run read-only shell (`git status`, `ls`, tests) | — | — | ✅ | ✅ |
| Edit / write files in `allowedFiles` | — | — | ❌ | ✅ |
| Edit / write files in `blockedFiles` | — | — | ❌ | ❌ (hard block) |
| Edit files outside allowed+blocked | — | — | ❌ | ❌ |
| Run mutating shell (`git commit`, `rm`, `npm install`) | — | — | ❌ | ✅ (allowed only; else ask Saarthi) |
| Push / force-push / reset | — | — | ❌ | ❌ (requires explicit approval per push) |
| Refresh `.handoff/` | — | — | ❌ | ✅ |
| Open consult windows | — | — | ✅ (request only) | ✅ (request only) |

Minimized panes hold no capabilities — they are paused. Restoring promotes to `active_readonly`; mutator status must be re-requested.

Monitor panes are permanently `active_readonly` by type; they cannot be promoted to mutator. Shell panes are the most dangerous and require the explicit destructive-ops approval flow even while holding the token.

## 8. Pane header: repo, branch, task, state visibility

Every pane's header displays, at minimum, the four required fields:

```
[type] [label]
  repo:   <short repo name>            (full path on hover)
  branch: <branch>                     (dirty/clean indicator)
  task:   <taskScope.goal or '—'>      (expandable: allowed/blocked/verification/stopBoundary)
  state:  <lifecycle> [mutator?]       (color-coded)
```

Plus supplementary fields:

- **HEAD sha** — live `git rev-parse --short HEAD`. Drift from `.handoff/manifest.json.latest_commit` is a "handoff stale" warning (not blocking).
- **Window badge** — if the pane is inside an open Saarthi consult window, the window id and counterparty are shown.
- **Close (X), minimize, and drag handle** — chrome controls, always present.

Gating checks (not just display):
- If cwd differs from the Saarthi-mandated `code_repo` (per `.handoff/manifest.json`), the pane is flagged red and denied mutator-token grants until the mismatch is resolved.
- If `.handoff/manifest.json.branch` differs from the pane's current branch, mutator grants on that pane are denied until resolved.
- Header fields are derived from authoritative sources (git, filesystem, `.handoff/`) on every render tick. Never cache on activation.

## 9. Handoff / status integration

The operator bay is a consumer of `.handoff/`, not a replacement.

Reads:
- Saarthi console reads `.handoff/manifest.json` on every activation and on every mutator grant, and at a low-frequency poll (suggested 30s) to detect external edits.
- Panes read `.handoff/00-current-state.md`, `01-decisions.md`, `02-open-loops.md` on activation so the executor starts with context.
- Monitor panes may tail `.handoff/` files as a file watcher.

Writes:
- Only `active_mutator` panes write `.handoff/`. Writes happen at task close (stop boundary) and on any mutator-revoke event.
- Handoff refresh is a required step of `closing`, not optional. A pane cannot transition `closing → dormant` without either (a) a handoff refresh that reflects current HEAD, or (b) an explicit "no state change worth recording" confirmation from Saarthi.
- The Phase 2c/2d pattern (code commit + separate handoff refresh commit) remains the default. Bundled commits are allowed only when the code change is trivial and the user explicitly approves.

Divergence handling:
- If `.handoff/manifest.json.latest_commit` does not match `git rev-parse HEAD`, the bay shows a "handoff stale" banner on the Saarthi console. No mutator grants are blocked by this alone — refreshing `.handoff/` is itself a valid mutator task.
- If `.handoff/manifest.json.branch` does not match current branch on any pane, mutator grants on that pane are denied until resolved.
- If `.handoff/manifest.json.scope_lock` forbids a region of the tree and the `taskScope.allowedFiles` intersects it, activation is denied with an explicit reason surfaced to the user.

Cross-session continuity:
- Pane lifecycle is not persisted. On Setu restart, all panes boot `dormant`. Placement is restored (§4.6). Saarthi re-activates from the user's next request, using `.handoff/` as the source of truth for what was in flight.

## 10. Risks and phased rollout

### Risks

- **Token invariant breach.** The whole design rests on "one mutator at a time." A bug in the grant/revoke path silently allowing two simultaneous mutators corrupts repo state. Mitigation: single authoritative token store (Saarthi), grant/revoke logged with monotonic counter, test harness that explicitly tries to acquire the token twice, explicit minimize-releases-token invariant.
- **Enforcement-by-convention trap.** If mutation gating lives only in UI, a pane with direct shell access bypasses it. Mitigation: enforcement must be in the tool-call wrapper that every pane routes through, not in the header chips. Shell panes specifically must route through a Saarthi-wrapped command layer, not a raw PTY.
- **Pane metadata drifting from reality.** Header says branch `main`, actual cwd is `feature/x`. Mitigation: derive displayed fields from `git` and filesystem on every render tick; never cache on activation.
- **Consult windows turning into back-channels.** A window opened for a narrow purpose becoming a persistent chat. Mitigation: TTL + purpose field + Saarthi close-on-idle; log every message in the console.
- **Handoff skew across panes.** Two panes reading `.handoff/` at different moments and reaching different conclusions. Mitigation: the mutator pane is the only writer; readers treat `.handoff/` as eventually-consistent and re-read before acting on it.
- **User fatigue from gating prompts.** Every grant requires confirmation → user clicks-through blindly. Mitigation: gating prompts surface scope diff, not yes/no. Only prompt on genuinely ambiguous grants (clean in-scope tasks may grant silently with a log row).
- **Shell pane blast radius.** Shell pane with mutator token is effectively unconstrained. Mitigation: shell panes must ship with an explicit, narrower allowed-commands list (e.g., `git`, `npm`, `node`) and always require explicit approval for `rm`, `git push`, `git reset --hard`, etc. (aligned with the existing destructive-ops rule).
- **Float + minimize + restore confusion.** A floating pane minimized into the bench, then restored, must land in the right place with the right state. Mitigation: `savedState.lastPlacement` is authoritative for restore; test matrix covers {docked, floating} × {minimize, close} × {restore, reopen}.
- **Accidental close of mutator pane.** User clicks X on an active mutator pane mid-write. Mitigation: explicit confirmation from `active_mutator`, `.handoff/` refresh on close, never silent teardown.
- **Stale `savedState` on reopen.** Reopening a pane whose saved task scope references a long-gone branch. Mitigation: TTL on `savedState`, branch/HEAD compatibility check at restore, UI-only restore fallback.
- **Feature creep into orchestration.** The bay is a UI; it is tempting to let it grow policy logic. Mitigation: policy stays in Saarthi; the bay only displays and routes user intent.

### Phased rollout

Each phase is independently verifiable (`lint`, `tsc --noEmit`, `build`) and independently revertable. No phase introduces real process spawning or multi-pane mutation until the one before it is shipped and observed.

- **Phase Bay-1 — static bay shell with docked layouts.** Bay renders in Setu. Anchor regions (left/right/top/bottom/center) with placeholder panes only. Tile modes 1/2/4/6 per region. No floating, no lifecycle, no activation, no sessions. Header chips are hard-coded. Saarthi console pane present but static. One commit + handoff refresh.
- **Phase Bay-2 — controls: open (+), close (X), minimize, resize, drag/move.** Users can add, remove, minimize, and move placeholder panes across anchors. Still no real sessions. Exercise snap/dock UX. One commit + handoff refresh.
- **Phase Bay-3 — floating panes.** Introduce float placement, drag tear-off, float → dock re-snap. Integrate with Phase Bay-2 controls. One commit + handoff refresh.
- **Phase Bay-4 — pane metadata wiring.** Panes render live repo/branch/task/state from git and (once available) Saarthi. Lifecycle displayed (all panes stuck in `dormant`). No activation yet. One commit + handoff refresh.
- **Phase Bay-5 — monitor pane (read-only, no mutation risk).** First real pane type. Tails a repo file or `git log`. Validates that a pane can hold a session without touching the mutator token. One commit + handoff refresh.
- **Phase Bay-6 — Saarthi token store + single activation.** Introduce the mutator token in Saarthi. Wire one pane type (Claude) to request/receive/release it. Still single-pane mutation; multi-pane is deferred. Minimize-releases-token invariant validated here. One commit + handoff refresh.
- **Phase Bay-7 — multi-pane with strict one-mutator invariant.** Allow multiple panes `active_readonly` simultaneously, enforce at most one `active_mutator`. Add grant/revoke tests that attempt to violate the invariant. One commit + handoff refresh.
- **Phase Bay-8 — minimize/restore persistence.** `savedState` serialization across restart, recently-closed list, quick-reopen from +. One commit + handoff refresh.
- **Phase Bay-9 — consult windows.** Scoped inter-pane consults through Saarthi. Window open/close with TTL. No persistent channels. One commit + handoff refresh.
- **Phase Bay-10 — shell pane.** Highest-risk pane type added last, only after all gating and the destructive-ops approval flow are exercised under Claude/Codex. Ships with an explicit allowed-commands list. One commit + handoff refresh.

Explicit non-goals for the bay:
- Not a terminal multiplexer replacement (tmux, zellij).
- Not an agent chat client.
- Not a CI dashboard.
- Not a git GUI. Panes display git state; they do not become a git UI.
- Not an OS-level window manager. Floating panes live inside the Setu workspace only.
- Not responsible for Saarthi's internals, FTD packet formats, or ledger semantics — those are separate docs.

## Out of scope for this document

- Any code.
- Any framework choice (React component structure, IPC transport, PTY vs. WebSocket, drag library).
- Saarthi's internal policy engine details.
- FTD packet schema.
- Specific keyboard shortcuts' final bindings, theming, or visual polish.
- Auth between Setu and the specialists (inherits the Phase 2d "no auth, local/trusted only" posture for v1).
- Multi-monitor handling. Floating panes are confined to the Setu workspace for v1.
