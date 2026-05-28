import { NextResponse } from "next/server";

import { canReadAdminControls, canWriteFeatureFlags } from "@/lib/admin/roles";
import { validateCsrf } from "@/lib/csrf";
import {
  type FeatureFlags,
  type FeatureFlag,
  FLAG_DEFINITIONS,
  findFlagDefinition,
  flattenFlags,
  getByPath,
  mergeFeatureFlags,
  setByPath,
} from "@/lib/feature-flags";
import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";
import { readPersistedFlags, upsertFlag } from "@/lib/server/feature-flags-store";
import { getAdminUser } from "@/lib/supabase/admin";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function asUuidOrNull(value: string | undefined): string | null {
  if (!value) {
    return null;
  }
  return UUID_REGEX.test(value) ? value : null;
}

let e2eFlagsCache: FeatureFlags | null = null;

function cloneFlags(flags: FeatureFlags): FeatureFlags {
  return mergeFeatureFlags(structuredClone(flags));
}

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

  let flags = await readPersistedFlags();
  if (headerBypass) {
    if (!e2eFlagsCache) {
      e2eFlagsCache = cloneFlags(flags);
    }
    flags = cloneFlags(e2eFlagsCache);
  }

  return NextResponse.json({
    flags,
    role: effectiveRole,
    definitions: flattenFlags(flags),
  });
}

export async function PATCH(request: Request) {
  if (!validateCsrf(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
  const actorUserId = asUuidOrNull(user?.id);
  if (!(headerBypass || (user && isAdmin && effectiveRole))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    path?: string;
    value?: unknown;
    enabled?: boolean;
    percentage?: number;
    userIds?: string[];
    subscriptionTiers?: string[];
  };
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

  const def = findFlagDefinition(path);
  const userAgent = request.headers.get("user-agent") ?? "";
  let result: { persisted: boolean; fallback?: "redis" } = { persisted: false };
  let flags: FeatureFlags;

  if (headerBypass) {
    if (!e2eFlagsCache) {
      e2eFlagsCache = cloneFlags(await readPersistedFlags());
    }
    if (def && def.type === "boolean") {
      const value =
        typeof body.enabled === "boolean"
          ? body.enabled
          : typeof body.value === "boolean"
            ? body.value
            : !getByPath(e2eFlagsCache as unknown as Record<string, unknown>, path);
      setByPath(e2eFlagsCache as unknown as Record<string, unknown>, path, value);
    } else {
      setByPath(e2eFlagsCache as unknown as Record<string, unknown>, path, body.value);
    }
    e2eFlagsCache = cloneFlags(e2eFlagsCache);
    flags = cloneFlags(e2eFlagsCache);
  } else {
    let persistedValue: unknown;
    if (def && def.type === "boolean") {
      persistedValue =
        typeof body.enabled === "boolean"
          ? body.enabled
          : typeof body.value === "boolean"
            ? body.value
            : false;
    } else if (def && def.type === "percentage") {
      persistedValue = typeof body.percentage === "number" ? body.percentage : body.value;
    } else if (def && def.type === "user_list") {
      persistedValue = Array.isArray(body.userIds) ? body.userIds : body.value;
    } else if (def && def.type === "subscription_tier") {
      persistedValue = Array.isArray(body.subscriptionTiers)
        ? body.subscriptionTiers
        : body.value;
    } else {
      persistedValue = body.value;
    }

    result = await upsertFlag({
      path,
      value: persistedValue,
      actorUserId,
      actorRole: effectiveRole,
      requestIp: ip,
      userAgent,
    });
    flags = await readPersistedFlags();
  }

  return NextResponse.json({
    ok: true,
    persisted: result.persisted,
    flags,
    role: effectiveRole,
  });
}
