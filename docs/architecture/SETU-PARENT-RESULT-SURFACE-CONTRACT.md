# Setu Parent Result Surface Contract

Verified on 2026-04-22 from the local filesystem.

## Purpose

This packet defines the parent-owned result surface contract for
`Setu Mother Bridge`.

Scope is doc-only and `Lane 1` only:

- define what the parent shell may show after processing
- define the minimum truthful result fields
- define status rules for success, failure, and review
- prevent false completeness in the parent result surface

This packet does NOT:

- change product code
- change `src/**`
- change `.handoff/*`
- define child-module internals
- absorb `OL-3` or `OL-4` into the parent result surface

## Lane In Scope

- `Lane 1`: parent shell result contract, naming, routing, and truth
  rules

Out of scope:

- `Lane 2` display implementation details
- `Lane 3` write-path internals
- child-specific result layouts

## 1. Parent Role

`Setu Mother Bridge` owns the parent result surface as a truthful summary
of what happened after processing. It is a contract surface, not a claim
that all downstream work is complete.

The parent result surface may answer only four novice-safe questions:

1. what happened
2. what output was produced
3. what can be copied now
4. what is the current status

The parent result surface must not imply:

- downstream completion that has not been verified
- success when the item is in review
- success when output exists but failed to persist
- success when only routing occurred

## 2. Result Surface Structure

The parent contract is intentionally small. Every processed item should
resolve to one result surface record with these sections:

### A. Outcome Summary

Short plain-language answer to: what happened.

Required fields:

- `headline`: one-line statement in novice-safe language
- `actionTaken`: what Setu actually did
- `scope`: what system or artifact this refers to

### B. Processed Output

What concrete output exists right now.

Required fields:

- `outputKind`: packet, document, manifest, route decision, summary, or
  none
- `outputLocation`: path, target, destination, or `null`
- `outputState`: created, updated, unchanged, blocked, or missing

### C. Copyable Result

The smallest copy-safe payload the operator can reuse without needing to
inspect internals.

Required fields:

- `copyLabel`: short label for the copy action
- `copyValue`: exact copyable result, or `null`
- `copyState`: ready or unavailable

### D. Status Signal

Truthful top-level state for the parent shell.

Required fields:

- `status`: success, failure, or review
- `statusReason`: why this status was assigned
- `completeness`: complete, partial, or unresolved

## 3. Status Rules

### `success`

Use `success` only when the requested parent-visible step completed and
the reported output exists in the state being claimed.

`success` is allowed when:

- the intended parent-owned action completed
- the surfaced output is real and reachable
- no known review gate or failure blocks the claimed result

`success` is not allowed when:

- only routing occurred and no promised output exists
- output text was generated but not saved where claimed
- downstream status is unknown but the surface implies completion

### `failure`

Use `failure` when the requested step did not complete or the claimed
output is missing, invalid, or unusable.

`failure` should show:

- what Setu tried to do
- what target it refers to
- why it failed

### `review`

Use `review` when the system has something real to show but cannot
truthfully claim success.

`review` applies when:

- ownership is ambiguous
- routing succeeded but execution is not yet confirmed
- output exists but needs human validation
- the result is partial and could mislead a novice if shown as success

`review` is the default safe state when certainty is missing.

## 4. False-Completeness Guardrails

The parent result surface must stay minimal because extra language
causes false confidence.

Required guardrails:

- do not show all-green when any known failure or review condition
  exists
- do not label routing as completion
- do not label saved metadata as finished output unless the final output
  is present
- do not merge multiple downstream states into one falsely clean status
- do not hide uncertainty behind generic success language

Preferred fallback:

If the parent cannot verify completion, show `review` with a direct
explanation instead of optimistic success wording.

## 5. Minimal Contract Shape

The smallest useful parent result record is:

```json
{
  "headline": "short novice-safe outcome",
  "actionTaken": "what Setu actually did",
  "scope": "the system, destination, or artifact in question",
  "outputKind": "packet | document | manifest | route-decision | summary | none",
  "outputLocation": "path | destination | null",
  "outputState": "created | updated | unchanged | blocked | missing",
  "copyLabel": "Result | Output | Route | null",
  "copyValue": "copyable text or null",
  "copyState": "ready | unavailable",
  "status": "success | failure | review",
  "statusReason": "why this state is truthful",
  "completeness": "complete | partial | unresolved"
}
```

## 6. Parent Interpretation Rules

How the parent should interpret this record:

- `headline` answers what happened in one line
- `processed output` is determined by `outputKind`, `outputLocation`,
  and `outputState`
- `copyable result` is available only when `copyState` is `ready`
- top status is the combination of `status` and `completeness`, not
  color alone

Truth priority:

1. `failure`
2. `review`
3. `success`

If multiple signals compete, the parent must show the least optimistic
truthful state.

## 7. Safest Next Implementation Packet

Smallest safe implementation packet after this contract:

1. add one parent-owned result type matching this contract
2. map current processing outcomes into `success`, `failure`, or
   `review`
3. expose the result read-only in the parent shell
4. keep child modules responsible only for their own internal detail

Do not do yet:

- no product code in this packet
- no child result-surface redesign
- no parent absorption of child internals
- no expansion into `OL-3` or `OL-4`

## Current Freeze For This Packet

Frozen by this packet:

- the parent surface shows only outcome, output, copyable result, and
  status
- top status must be truthful and novice-safe
- `review` is valid and preferred over optimistic success
- parent result reporting does not absorb child internals
