import { NextResponse } from "next/server";

import { redis } from "@/lib/redis";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  const checks = {
    app: "ok",
    redis: "degraded",
    supabase: "degraded",
  } as const;

  let redisStatus: "ok" | "degraded" = "degraded";
  let supabaseStatus: "ok" | "degraded" = "degraded";

  try {
    const pong = await redis.ping();
    if (String(pong).toUpperCase().includes("PONG")) {
      redisStatus = "ok";
    }
  } catch {
    redisStatus = "degraded";
  }

  try {
    const supabase = await createServerClient();
    const { error } = await supabase.from("app_admins").select("id").limit(1);
    if (!error) {
      supabaseStatus = "ok";
    }
  } catch {
    supabaseStatus = "degraded";
  }

  return NextResponse.json(
    {
      status: redisStatus === "ok" && supabaseStatus === "ok" ? "ok" : "degraded",
      checks: { ...checks, redis: redisStatus, supabase: supabaseStatus },
      timestamp: new Date().toISOString(),
    },
    { status: 200 },
  );
}
