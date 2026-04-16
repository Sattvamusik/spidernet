import { NextResponse } from "next/server";

import {
  buildPostureEvent,
  setTierPosture,
} from "@/lib/spidernet/brain/posture";
import type {
  BrainPostureStatus,
  BrainTier,
} from "@/lib/spidernet/brain/types";

const AUTH_HEADER = {
  "x-brain-route-auth": "none-v1-trusted-only",
} as const;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      tier: BrainTier;
      status: BrainPostureStatus;
      note: string;
    };

    const snapshot = setTierPosture(body.tier, {
      status: body.status,
      note: body.note,
    });

    const event = buildPostureEvent(
      body.tier,
      body.status,
      body.note,
      snapshot.lastWrittenAt,
    );

    return NextResponse.json(
      { ok: true, partial: false, snapshot, event },
      { status: 200, headers: AUTH_HEADER },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "UNEXPECTED",
          message: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500, headers: AUTH_HEADER },
    );
  }
}
