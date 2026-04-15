export type OllamaAvailabilityInput = {
  localAvailable?: boolean;
  endpoint?: string;
};

export type OllamaAvailabilityResult = {
  available: boolean;
  endpoint: string;
  mode: "ready" | "unavailable";
  reason: string;
};

export function getOllamaAvailability(
  input: OllamaAvailabilityInput = {},
): OllamaAvailabilityResult {
  const endpoint = typeof input.endpoint === "string" && input.endpoint.trim().length > 0
    ? input.endpoint
    : "http://127.0.0.1:11434";

  const localAvailable = input.localAvailable ?? false;

  if (localAvailable) {
    return {
      available: true,
      endpoint,
      mode: "ready",
      reason: "Local Ollama lane is marked available.",
    };
  }

  return {
    available: false,
    endpoint,
    mode: "unavailable",
    reason: "Local Ollama lane is not wired live yet.",
  };
}
