import { NextResponse } from "next/server";

import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";
import { redis } from "@/lib/redis";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const ip = clientIpFromHeaders(request.headers);
  const limit = await rateLimit({
    key: `api:health:${ip}`,
    windowMs: 60_000,
    limit: 60,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      { status: "rate_limited", message: "Too many requests" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.max(1, Math.ceil((limit.resetAt - Date.now()) / 1000))),
          "Cache-Control": "no-store",
        },
      },
    );
  }

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
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
