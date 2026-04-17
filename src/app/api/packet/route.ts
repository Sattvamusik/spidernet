import { NextResponse } from "next/server";
import { ingest } from "@/lib/spidernet/ingest";
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

    const ingestResult = ingest({ body: input, source: "api/packet" });

    if (ingestResult.duplicate) {
      return NextResponse.json({
        success: true,
        duplicate: true,
        hitCount: ingestResult.hitCount,
        ingest: ingestResult.packet,
      });
    }

    const packet = {
      id: `pkt_${ingestResult.packet.hash.slice(0, 12)}`,
      type: "intake",
      classification: detectType(input),
      ingestHash: ingestResult.packet.hash,
      rawRef: ingestResult.rawRef,
      byteCount: ingestResult.packet.byteCount,
      tokenEstimate: ingestResult.packet.tokenEstimate,
      status: "created",
      created_at: ingestResult.packet.createdAt,
    };

    appendPacket("intake", packet);
    appendLedgerEvent({
      id: `led_${Date.now()}`,
      action: "packet.created",
      packetId: packet.id,
      packetType: packet.type,
      created_at: packet.created_at,
    });

    return NextResponse.json({ success: true, duplicate: false, packet });
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
