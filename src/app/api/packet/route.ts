import { NextResponse } from "next/server";
import { appendLedgerEvent, appendPacket } from "@/lib/spidernet/storage";

function detectType(input: string): string {
  const text = input.toLowerCase();

  if (text.includes("research")) return "research";
  if (text.includes("build") || text.includes("implement")) return "execution";
  if (text.includes("rule")) return "rule";
  if (text.includes("idea")) return "idea";
  if (text.includes("plan") || text.includes("phase")) return "blueprint";

  return "general";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = typeof body?.input === "string" ? body.input.trim() : "";

    if (!input) {
      return NextResponse.json(
        { success: false, error: "Missing input" },
        { status: 400 },
      );
    }

    const packet = {
      id: `pkt_${Date.now()}`,
      type: "intake",
      classification: detectType(input),
      input,
      status: "created",
      created_at: new Date().toISOString(),
    };

    appendPacket("intake", packet);
    appendLedgerEvent({
      id: `led_${Date.now()}`,
      action: "packet.created",
      packetId: packet.id,
      packetType: packet.type,
      created_at: packet.created_at,
    });

    return NextResponse.json({ success: true, packet });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 },
    );
  }
}
