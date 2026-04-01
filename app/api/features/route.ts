import { NextResponse } from "next/server";

import { flattenFlags } from "@/lib/feature-flags";
import { readPersistedFlags } from "@/lib/server/feature-flags-store";

export async function GET() {
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
