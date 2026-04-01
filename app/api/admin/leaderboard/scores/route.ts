import { NextResponse } from "next/server";

import { canModerateLeaderboard } from "@/lib/admin/roles";
import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";
import { type LeaderboardScoreStatus, normalizeGameType } from "@/lib/server/leaderboard";
import { getAdminUser } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";

type ScoreStatus = LeaderboardScoreStatus;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isScoreStatus(value: unknown): value is ScoreStatus {
  return value === "valid" || value === "flagged" || value === "removed";
}

function asUuidOrNull(value: string | undefined): string | null {
  if (!value) {
    return null;
  }
  return UUID_REGEX.test(value) ? value : null;
}

export async function GET(request: Request) {
  const ip = clientIpFromHeaders(request.headers);
  const throttle = await rateLimit({
    key: `api:admin:leaderboard:scores:get:${ip}`,
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

  const url = new URL(request.url);
  const gameTypeParam = url.searchParams.get("gameType");
  const statusParam = url.searchParams.get("status");
  const seasonSlug = url.searchParams.get("seasonSlug");
  const limitParam = Number(url.searchParams.get("limit") ?? "50");
  const limit = Number.isFinite(limitParam) ? Math.min(200, Math.max(1, Math.trunc(limitParam))) : 50;

  const supabase = await createServerClient();
  let seasonId: string | null = null;

  if (seasonSlug) {
    const { data: season } = await supabase
      .from("leaderboard_seasons")
      .select("id")
      .eq("slug", seasonSlug)
      .maybeSingle();
    seasonId = season?.id ?? null;
  }

  let query = supabase
    .from("leaderboard_scores")
    .select(
      "id,user_id,player_name,game_type,score,status,created_at,season_id,moderated_at,moderated_by,moderation_reason,moderation_note",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (gameTypeParam) {
    query = query.eq("game_type", normalizeGameType(gameTypeParam));
  }
  if (statusParam && isScoreStatus(statusParam)) {
    query = query.eq("status", statusParam);
  }
  if (seasonId) {
    query = query.eq("season_id", seasonId);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json(
      { error: "Failed to load leaderboard scores", details: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ scores: data ?? [] });
}

export async function PATCH(request: Request) {
  const ip = clientIpFromHeaders(request.headers);
  const throttle = await rateLimit({
    key: `api:admin:leaderboard:scores:patch:${ip}`,
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
  if (!(headerBypass || (user && isAdmin && effectiveRole && canModerateLeaderboard(effectiveRole)))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    scoreId?: string;
    status?: ScoreStatus;
    reason?: string;
    note?: string;
  };

  if (!body.scoreId || !isScoreStatus(body.status)) {
    return NextResponse.json({ error: "scoreId and valid status are required" }, { status: 400 });
  }

  const supabase = await createServerClient();
  const actorUserId = asUuidOrNull(user?.id);

  const { data: previous, error: previousError } = await supabase
    .from("leaderboard_scores")
    .select("id, status")
    .eq("id", body.scoreId)
    .maybeSingle();

  if (previousError || !previous) {
    return NextResponse.json({ error: "Score not found" }, { status: 404 });
  }

  if (previous.status === body.status) {
    return NextResponse.json({ ok: true, unchanged: true, scoreId: body.scoreId });
  }

  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("leaderboard_scores")
    .update({
      status: body.status,
      moderated_at: now,
      moderated_by: actorUserId,
      moderation_reason: body.reason?.trim() || null,
      moderation_note: body.note?.trim() || null,
    })
    .eq("id", body.scoreId);

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to update score status", details: updateError.message },
      { status: 500 },
    );
  }

  await supabase.from("leaderboard_score_moderation_audit").insert({
    score_id: body.scoreId,
    old_status: previous.status,
    new_status: body.status,
    reason: body.reason?.trim() || null,
    note: body.note?.trim() || null,
    actor_user_id: actorUserId,
    actor_role: effectiveRole ?? "admin",
    request_ip: ip,
    user_agent: request.headers.get("user-agent"),
  });

  return NextResponse.json({
    ok: true,
    scoreId: body.scoreId,
    oldStatus: previous.status,
    newStatus: body.status,
  });
}
