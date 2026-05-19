import { NextResponse } from "next/server";

import { flattenFlags } from "@/lib/feature-flags";
import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";
import { readPersistedFlags } from "@/lib/server/feature-flags-store";

export async function GET(request: Request) {
  const ip = clientIpFromHeaders(request.headers);
  const throttle = await rateLimit({
    key: `api:features:get:${ip}`,
    windowMs: 60_000,
    limit: 120,
  });
  if (!throttle.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const flags = await readPersistedFlags();
  const flatFlags = flattenFlags(flags).reduce<Record<string, boolean | string | unknown>>(
    (acc, entry) => {
      acc[entry.path] = entry.value;
      return acc;
    },
    {},
  );

  return NextResponse.json(
    {
      ...flatFlags,
      realtime_enabled: Boolean(flags.experimental.realtimeMultiplayer),
      snake_3d_mode: Boolean(flags.experimental.threeJsGames),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
