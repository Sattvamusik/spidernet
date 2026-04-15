import { boardRegistry, policyRegistry } from "@/lib/spidernet/architecture";
import type {
  ExposureDecision,
  IntakePacket,
  LaneName,
  PolicyDecision,
  RoutingDecision,
  RouteFamily,
  WrapperRegistryEntry,
} from "@/lib/spidernet/types";

function includesAny(value: string, terms: string[]) {
  const lowered = value.toLowerCase();
  return terms.some((term) => lowered.includes(term));
}

function chooseExposureDecision(
  packet: IntakePacket,
  wrappers: WrapperRegistryEntry[],
): ExposureDecision {
  const objective = `${packet.objective} ${packet.classifications.join(" ")}`.toLowerCase();

  if (includesAny(objective, ["api", "endpoint", "server", "storage"])) {
    return wrappers.some((entry) => entry.exposurePath === "api" && entry.status === "live")
      ? "api"
      : "manual_hold";
  }

  if (includesAny(objective, ["build", "lint", "typecheck", "cli", "script"])) {
    return wrappers.some((entry) => entry.exposurePath === "cli" && entry.status === "live")
      ? "cli"
      : "manual_hold";
  }

  if (includesAny(objective, ["browser", "playwright", "ui check"])) {
    return wrappers.some((entry) => entry.exposurePath === "browser_automation" && entry.status === "live")
      ? "browser_automation"
      : "manual_hold";
  }

  if (includesAny(objective, ["desktop", "launcher", "window automation"])) {
    return wrappers.some((entry) => entry.exposurePath === "desktop_automation" && entry.status === "live")
      ? "desktop_automation"
      : "manual_hold";
  }

  return "manual_hold";
}

function chooseLane(packet: IntakePacket, executionAllowed: boolean): LaneName {
  if (packet.classifications.includes("research")) {
    return "Architect";
  }

  if (!executionAllowed) {
    return "Auditor";
  }

  if (packet.routes.includes("BLP")) {
    return "Builder";
  }

  return "Operator";
}

export function evaluateRoutingDecision(
  packet: IntakePacket,
  wrappers: WrapperRegistryEntry[],
): RoutingDecision {
  const objective = `${packet.objective} ${packet.classifications.join(" ")}`.toLowerCase();
  const isResearch = packet.classifications.includes("research") || includesAny(objective, ["research", "compare", "evaluate", "viability", "plan"]);
  const isBuild = packet.classifications.includes("build") || includesAny(objective, ["implement", "wire", "persist", "docs", "build", "registry"]);
  const isDangerous =
    includesAny(objective, ["delete", "privileged", "desktop automation", "browser automation", "mutate"]) ||
    packet.routes.includes("RUL") ||
    packet.routes.includes("DNA");
  const goesToFtd = packet.routes.includes("FTD") || packet.classifications.includes("future");
  const exposureDecision = chooseExposureDecision(packet, wrappers);
  const needsApproval = isBuild || isDangerous || exposureDecision !== "manual_hold" || packet.routes.includes("RUL");

  const policyDecisions: PolicyDecision[] = policyRegistry.map((policy) => {
    switch (policy.id) {
      case "policy-research":
        return {
          checkId: policy.id,
          name: policy.name,
          outcome: isResearch ? "pass" : "review",
          detail: isResearch ? "Dash 002 remains the only research routing destination." : "This packet is not research-only.",
        };
      case "policy-build":
        return {
          checkId: policy.id,
          name: policy.name,
          outcome: isBuild ? "pass" : "review",
          detail: isBuild ? "Execution and validation packets are required." : "No direct build behavior requested.",
        };
      case "policy-danger":
        return {
          checkId: policy.id,
          name: policy.name,
          outcome: isDangerous ? "hold" : "pass",
          detail: isDangerous ? "Dangerous reach detected. Chitragupt review is required." : "No dangerous reach detected.",
        };
      case "policy-approval":
        return {
          checkId: policy.id,
          name: policy.name,
          outcome: needsApproval ? "review" : "pass",
          detail: needsApproval ? "Approval gate stays active before execution." : "Approval gate can remain open.",
        };
      case "policy-ftd":
        return {
          checkId: policy.id,
          name: policy.name,
          outcome: goesToFtd ? "pass" : "review",
          detail: goesToFtd ? "Packet is valid but not on the active path and belongs in FTD." : "Packet remains on the active path.",
        };
      case "policy-exposure":
        return {
          checkId: policy.id,
          name: policy.name,
          outcome: exposureDecision === "manual_hold" ? "review" : "pass",
          detail: `Exposure decision resolved to ${exposureDecision}.`,
        };
      default:
        return {
          checkId: policy.id,
          name: policy.name,
          outcome: "review",
          detail: policy.actionIfTrue,
        };
    }
  });

  let boardId: RoutingDecision["boardId"] = "dash-003-hive-agents";
  let routeFamilies: RouteFamily[] = packet.routes;

  if (goesToFtd) {
    boardId = "dash-006-memory-ledger";
  } else if (isResearch) {
    boardId = "dash-002-tools-store";
    routeFamilies = Array.from(new Set([...routeFamilies, "LIB"]));
  } else if (isBuild) {
    boardId = "dash-004-setu-bridge";
    routeFamilies = Array.from(new Set([...routeFamilies, "BLP"]));
  }

  const executionAllowed = !isDangerous && !goesToFtd && exposureDecision !== "manual_hold";
  const board = boardRegistry.find((entry) => entry.id === boardId);
  const holdReason = !executionAllowed
    ? goesToFtd
      ? "Packet is preserved in FTD and is not execution-eligible."
      : isDangerous
        ? "Dangerous reach requires Chitragupt review before routing."
        : "No live wrapper path is approved for this request."
    : undefined;

  return {
    packetId: packet.packetId,
    boardId,
    boardTitle: board?.title ?? "Unknown board",
    lane: chooseLane(packet, executionAllowed),
    routeFamilies,
    exposureDecision,
    policyDecisions,
    executionAllowed,
    holdReason,
  };
}
