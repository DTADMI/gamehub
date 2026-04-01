import { NextResponse } from "next/server";

import { canModerateLeaderboard } from "@/lib/admin/roles";
import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";
import { getAdminUser } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function asUuidOrNull(value: string | undefined): string | null {
  if (!value) {
    return null;
  }
  return UUID_REGEX.test(value) ? value : null;
}

export async function GET(request: Request) {
  const ip = clientIpFromHeaders(request.headers);
  const throttle = await rateLimit({
    key: `api:admin:leaderboard:seasons:get:${ip}`,
    windowMs: 60_000,
    limit: 120,
  });
  if (!throttle.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const headerBypass =
    process.env.NODE_ENV !== "production" &&
    request.headers.get("x-e2e-admin") === "1";

  const { user, isAdmin, role } = await getAdminUser();
  const effectiveRole = headerBypass ? "owner" : role;
  if (!(headerBypass || (user && isAdmin && effectiveRole && canModerateLeaderboard(effectiveRole)))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("leaderboard_seasons")
    .select("id,slug,name,starts_at,ends_at,is_active,is_locked,created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json(
      { error: "Failed to load seasons", details: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ seasons: data ?? [] });
}

export async function PATCH(request: Request) {
  const ip = clientIpFromHeaders(request.headers);
  const throttle = await rateLimit({
    key: `api:admin:leaderboard:seasons:patch:${ip}`,
    windowMs: 60_000,
    limit: 40,
  });
  if (!throttle.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const headerBypass =
    process.env.NODE_ENV !== "production" &&
    request.headers.get("x-e2e-admin") === "1";

  const { user, isAdmin, role } = await getAdminUser();
  const effectiveRole = headerBypass ? "owner" : role;
  if (!(headerBypass || (user && isAdmin && effectiveRole && canModerateLeaderboard(effectiveRole)))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    seasonId?: string;
    isLocked?: boolean;
    activate?: boolean;
  };

  if (!body.seasonId) {
    return NextResponse.json({ error: "seasonId is required" }, { status: 400 });
  }

  const supabase = await createServerClient();
  const actor = asUuidOrNull(user?.id);

  if (typeof body.isLocked === "boolean") {
    const { error } = await supabase
      .from("leaderboard_seasons")
      .update({
        is_locked: body.isLocked,
        locked_at: body.isLocked ? new Date().toISOString() : null,
        locked_by: body.isLocked ? actor : null,
      })
      .eq("id", body.seasonId);
    if (error) {
      return NextResponse.json(
        { error: "Failed to update season lock", details: error.message },
        { status: 500 },
      );
    }
  }

  if (body.activate) {
    const { error: deactivateError } = await supabase
      .from("leaderboard_seasons")
      .update({ is_active: false })
      .eq("is_active", true);
    if (deactivateError) {
      return NextResponse.json(
        { error: "Failed to deactivate previous active season", details: deactivateError.message },
        { status: 500 },
      );
    }

    const { error: activateError } = await supabase
      .from("leaderboard_seasons")
      .update({ is_active: true })
      .eq("id", body.seasonId);
    if (activateError) {
      return NextResponse.json(
        { error: "Failed to activate season", details: activateError.message },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ ok: true });
}
