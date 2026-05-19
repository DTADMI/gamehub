import { NextResponse } from "next/server";

import { flattenFlags } from "@/lib/feature-flags";
import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";
import { readPersistedFlags } from "@/lib/server/feature-flags-store";

export async function GET(request: Request) {
  const ip = clientIpFromHeaders(request.headers);
  const throttle = await rateLimit({
    key: `api:feature-flags:get:${ip}`,
    windowMs: 60_000,
    limit: 120,
  });
  if (!throttle.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const flags = await readPersistedFlags();
  return NextResponse.json(
    {
      flags,
      flat: flattenFlags(flags),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
