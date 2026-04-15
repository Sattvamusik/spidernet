export type BrainTier = "cloud_primary" | "cloud_mini" | "local_ollama";

export type BrainSelectionInput = {
  complexity: "low" | "medium" | "high";
  privacyMode?: "cloud_allowed" | "local_only";
  cloudAvailable?: boolean;
  miniAvailable?: boolean;
  localAvailable?: boolean;
};

export type BrainSelectionResult = {
  tier: BrainTier;
  reason: string;
  fallbackChain: BrainTier[];
  holdReason: string | null;
};

export function selectBrain(input: BrainSelectionInput): BrainSelectionResult {
  const privacyMode = input.privacyMode ?? "cloud_allowed";
  const cloudAvailable = input.cloudAvailable ?? true;
  const miniAvailable = input.miniAvailable ?? true;
  const localAvailable = input.localAvailable ?? true;

  if (privacyMode === "local_only" && localAvailable) {
    return {
      tier: "local_ollama",
      reason: "Local-only privacy mode requested.",
      fallbackChain: [],
      holdReason: null,
    };
  }

  if (privacyMode === "local_only" && !localAvailable) {
    return {
      tier: "local_ollama",
      reason: "Local-only privacy mode requested, but no live local brain is available.",
      fallbackChain: [],
      holdReason: "Local-only privacy mode requires a live local brain, but the local lane is unavailable.",
    };
  }

  if (input.complexity === "high" && cloudAvailable) {
    return {
      tier: "cloud_primary",
      reason: "High-complexity task routed to primary cloud model.",
      fallbackChain: ["cloud_mini", "local_ollama"].filter((x) => (x === "cloud_mini" ? miniAvailable : localAvailable)) as BrainTier[],
      holdReason: null,
    };
  }

  if (miniAvailable) {
    return {
      tier: "cloud_mini",
      reason: "Mini selected for bounded implementation work.",
      fallbackChain: ["local_ollama"].filter(() => localAvailable) as BrainTier[],
      holdReason: null,
    };
  }

  if (localAvailable) {
    return {
      tier: "local_ollama",
      reason: "Cloud mini unavailable; falling back to local Ollama.",
      fallbackChain: [],
      holdReason: null,
    };
  }

  return {
    tier: "cloud_primary",
    reason: "Fallback default when no other execution tier is available.",
    fallbackChain: [],
    holdReason: null,
  };
}
