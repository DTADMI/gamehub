import { NextResponse } from "next/server";

import { flattenFlags } from "@/lib/feature-flags";
import { readPersistedFlags } from "@/lib/server/feature-flags-store";

export async function GET() {
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
