import { NextResponse } from "next/server";

import { canReadAdminControls, canWriteFeatureFlags } from "@/lib/admin/roles";
import { FLAG_DEFINITIONS, flattenFlags } from "@/lib/feature-flags";
import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";
import { readPersistedFlags, upsertFlag } from "@/lib/server/feature-flags-store";
import { getAdminUser } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const ip = clientIpFromHeaders(request.headers);
  const throttle = await rateLimit({
    key: `api:admin:flags:get:${ip}`,
    windowMs: 60_000,
    limit: 90,
  });

  if (!throttle.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const headerBypass =
    process.env.NODE_ENV !== "production" &&
    request.headers.get("x-e2e-admin") === "1";

  const { user, isAdmin, role } = await getAdminUser();
  const effectiveRole = headerBypass ? "owner" : role;
  const effectiveAccess = headerBypass || (user && isAdmin && effectiveRole);
  if (!effectiveAccess || !effectiveRole || !canReadAdminControls(effectiveRole)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const flags = await readPersistedFlags();

  return NextResponse.json({
    flags,
    role: effectiveRole,
    definitions: flattenFlags(flags),
  });
}

export async function PATCH(request: Request) {
  const ip = clientIpFromHeaders(request.headers);
  const throttle = await rateLimit({
    key: `api:admin:flags:patch:${ip}`,
    windowMs: 60_000,
    limit: 60,
  });

  if (!throttle.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const headerBypass =
    process.env.NODE_ENV !== "production" &&
    request.headers.get("x-e2e-admin") === "1";

  const { user, isAdmin, role } = await getAdminUser();
  const effectiveRole = headerBypass ? "owner" : role;
  const actorUserId = user?.id ?? "00000000-0000-0000-0000-000000000000";
  if (!(headerBypass || (user && isAdmin && effectiveRole))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { path?: string; value?: unknown };
  const path = body.path?.trim();
  if (!path) {
    return NextResponse.json({ error: "Missing flag path" }, { status: 400 });
  }
  if (!FLAG_DEFINITIONS.some((def) => def.path === path)) {
    return NextResponse.json({ error: "Unknown flag path" }, { status: 400 });
  }

  if (!effectiveRole || !canWriteFeatureFlags(effectiveRole, path)) {
    return NextResponse.json(
      { error: "Forbidden for current role", role: effectiveRole, path },
      { status: 403 },
    );
  }

  const value = body.value;
  const userAgent = request.headers.get("user-agent") ?? "";
  const result = await upsertFlag({
    path,
    value,
    actorUserId,
    actorRole: effectiveRole,
    requestIp: ip,
    userAgent,
  });
  const flags = await readPersistedFlags();

  return NextResponse.json({
    ok: true,
    persisted: result.persisted,
    flags,
    role: effectiveRole,
  });
}
