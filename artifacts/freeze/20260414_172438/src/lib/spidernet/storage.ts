import fs from "fs";
import path from "path";

const BASE_DIR = path.join(process.cwd(), "artifacts/runtime/spidernet");

function ensureParentDir(filePath: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function safeWriteJson(filePath: string, data: unknown) {
  ensureParentDir(filePath);
  const tempPath = `${filePath}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tempPath, filePath);
}

export function readJson<T>(relativePath: string, fallback: T): T {
  try {
    const filePath = path.join(BASE_DIR, relativePath);
    if (!fs.existsSync(filePath)) return fallback;

    const raw = fs.readFileSync(filePath, "utf8").trim();
    if (!raw) return fallback;

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function readArrayJson<T>(relativePath: string): T[] {
  const data = readJson<unknown>(relativePath, []);
  return Array.isArray(data) ? (data as T[]) : [];
}

export function writeJson(relativePath: string, data: unknown) {
  const filePath = path.join(BASE_DIR, relativePath);
  safeWriteJson(filePath, data);
}

export function appendPacket(packetType: string, packet: unknown) {
  const relativePath = `packets/${packetType}.json`;
  const existing = readArrayJson<unknown>(relativePath);
  existing.push(packet);
  writeJson(relativePath, existing);
}

export function appendLedgerEvent(event: unknown) {
  const existing = readArrayJson<unknown>("ledger/events.json");
  existing.push(event);
  writeJson("ledger/events.json", existing);
}

export async function loadRuntimeStorage() {
  return {
    intakePackets: readArrayJson("packets/intake.json"),
    researchPackets: readArrayJson("packets/research.json"),
    executionPackets: readArrayJson("packets/execution.json"),
    validationPackets: readArrayJson("packets/validation.json"),
    approvalPackets: readArrayJson("packets/approval.json"),
    passPackets: readArrayJson("packets/pass.json"),

    vaultIndex: readJson("vaults/index.json", {}),

    scoreRegistry: readArrayJson("registries/scores.json"),
    wrapperRegistry: readArrayJson("registries/wrappers.json"),
    skillRegistry: readArrayJson("registries/skills.json"),

    ledgerEvents: readArrayJson("ledger/events.json"),

    ollamaConfig: readJson("config/ollama.json", {
      enabled: false,
      baseUrl: "http://127.0.0.1:11434",
      model: "",
      handshakeStatus: "not_configured",
    }),
  };
}
