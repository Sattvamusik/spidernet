import type { AIHandoffPayloadV1 } from "@/lib/spidernet/ai-handoff";

export type AiProviderTarget = "stub" | "anthropic";

export type AiProviderResponse = {
  target: AiProviderTarget;
  status: "sent" | "stub_sent";
  text: string | null;
  model: string | null;
  usage: unknown;
  stopReason: string | null;
};

export type AiProviderErrorKind =
  | "config"
  | "auth"
  | "network"
  | "response_schema"
  | "rate_limit"
  | "permanent";

export class AiProviderError extends Error {
  readonly kind: AiProviderErrorKind;
  readonly target: AiProviderTarget;
  constructor(kind: AiProviderErrorKind, target: AiProviderTarget, message: string) {
    super(message);
    this.kind = kind;
    this.target = target;
    this.name = "AiProviderError";
  }
}

const DEFAULT_MODEL = "claude-sonnet-4-6";
const DEFAULT_MAX_TOKENS = 1024;
const ANTHROPIC_ENDPOINT = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

export function getCurrentTarget(): AiProviderTarget {
  const raw = (process.env.AI_HANDOFF_PROVIDER ?? "stub").trim().toLowerCase();
  return raw === "anthropic" ? "anthropic" : "stub";
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function renderPrompt(payload: AIHandoffPayloadV1): string {
  return [
    `Downstream handoff packet: ${payload.packetId} (${payload.kind})`,
    `Board: ${payload.boardId}  Lane: ${payload.lane}`,
    `Classifications: ${payload.classifications.join(", ")}`,
    `Route families: ${payload.routeFamilies.join(", ")}`,
    `Vault targets: ${payload.vaultTargets.join(", ")}`,
    `Objective: ${payload.objectivePreview}`,
  ].join("\n");
}

type AnthropicParsed = {
  text: string | null;
  model: string | null;
  usage: unknown;
  stopReason: string | null;
};

function parseAnthropicMessagesResponse(body: unknown): AnthropicParsed | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const content = b.content;
  let text: string | null = null;
  if (Array.isArray(content)) {
    const textBlocks = content
      .filter(
        (c): c is { type: "text"; text: string } =>
          !!c &&
          typeof c === "object" &&
          (c as Record<string, unknown>).type === "text" &&
          typeof (c as Record<string, unknown>).text === "string",
      )
      .map((c) => c.text);
    text = textBlocks.join("") || null;
  }
  return {
    text,
    model: typeof b.model === "string" ? b.model : null,
    usage: b.usage ?? null,
    stopReason: typeof b.stop_reason === "string" ? b.stop_reason : null,
  };
}

async function sendAnthropic(payload: AIHandoffPayloadV1): Promise<AiProviderResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new AiProviderError("config", "anthropic", "ANTHROPIC_API_KEY is not set");
  }

  const modelRaw = (process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL).trim();
  const model = modelRaw.length > 0 ? modelRaw : DEFAULT_MODEL;
  const maxTokens = parsePositiveInt(process.env.AI_HANDOFF_MAX_TOKENS, DEFAULT_MAX_TOKENS);

  const prompt = renderPrompt(payload);

  let res: Response;
  try {
    res = await fetch(ANTHROPIC_ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      }),
    });
  } catch (err) {
    throw new AiProviderError(
      "network",
      "anthropic",
      err instanceof Error ? err.message : String(err),
    );
  }

  if (res.status === 401 || res.status === 403) {
    throw new AiProviderError("auth", "anthropic", `authentication failed (${res.status})`);
  }
  if (res.status === 429) {
    throw new AiProviderError("rate_limit", "anthropic", "rate limited");
  }
  if (res.status >= 500) {
    throw new AiProviderError("network", "anthropic", `upstream ${res.status}`);
  }
  if (!res.ok) {
    throw new AiProviderError("permanent", "anthropic", `http ${res.status}`);
  }

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new AiProviderError("response_schema", "anthropic", "response body not JSON");
  }

  const parsed = parseAnthropicMessagesResponse(body);
  if (!parsed) {
    throw new AiProviderError("response_schema", "anthropic", "unexpected response shape");
  }

  return {
    target: "anthropic",
    status: "sent",
    text: parsed.text,
    model: parsed.model,
    usage: parsed.usage,
    stopReason: parsed.stopReason,
  };
}

export async function sendToProvider(payload: AIHandoffPayloadV1): Promise<AiProviderResponse> {
  const target = getCurrentTarget();
  if (target === "stub") {
    return {
      target,
      status: "stub_sent",
      text: null,
      model: null,
      usage: null,
      stopReason: null,
    };
  }
  return sendAnthropic(payload);
}
