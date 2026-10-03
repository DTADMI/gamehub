import { NextResponse } from "next/server";

import { resolveProgress, type ProgressRecord } from "@gamehub/game-platform/lib/progress";
import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";
import { createServerClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";

/**
 * Sauvegarde de progression (B8, D1 option C).
 *
 * GET  /api/progress?gameId=SNAKE  -> la copie distante (ou null)
 * PUT  /api/progress               -> ecrit la copie locale SI elle est au moins
 *                                     aussi recente que la distante ; sinon 409
 *                                     avec la copie distante (conflit presente,
 *                                     jamais ecrase en silence).
 *
 * Toute erreur de base est journalisee et renvoyee avec son code (jamais masquee
 * par un faux « non trouve »).
 */

const MAX_GAME_ID = 64;
const MAX_PAYLOAD_BYTES = 60_000;

type ProgressBody = {
  gameId?: unknown;
  data?: unknown;
  updatedAt?: unknown;
};

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function validateBody(body: ProgressBody): { gameId: string; updatedAt: string; data: Json } | string {
  if (typeof body.gameId !== "string" || body.gameId.trim().length === 0 || body.gameId.length > MAX_GAME_ID) {
    return "gameId must be a non-empty string of at most 64 characters";
  }
  if (typeof body.updatedAt !== "string" || Number.isNaN(Date.parse(body.updatedAt))) {
    return "updatedAt must be an ISO date string";
  }
  if (body.data === undefined || body.data === null) {
    return "data is required";
  }
  let serialized: string;
  try {
    serialized = JSON.stringify(body.data);
  } catch {
    return "data must be JSON-serialisable";
  }
  if (serialized.length > MAX_PAYLOAD_BYTES) {
    return "data exceeds the 60 kB limit";
  }
  // Le JSON.stringify ci-dessus a reussi : la valeur est representable en JSON,
  // donc sur le type `Json` de la base.
  return { gameId: body.gameId.trim(), updatedAt: body.updatedAt, data: body.data as Json };
}

export async function GET(request: Request) {
  const ip = clientIpFromHeaders(request.headers);
  const throttle = await rateLimit({ key: `api:progress:get:${ip}`, windowMs: 60_000, limit: 240 });
  if (!throttle.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const gameId = new URL(request.url).searchParams.get("gameId");
  if (!gameId || gameId.length > MAX_GAME_ID) {
    return badRequest("gameId is required");
  }

  const { data, error } = await supabase
    .from("user_game_progress")
    .select("game_id, progress, updated_at")
    .eq("user_id", user.id)
    .eq("game_id", gameId)
    .maybeSingle();

  if (error) {
    console.error("progress GET failed", { code: error.code, message: error.message });
    return NextResponse.json(
      { error: "Failed to load progress", code: error.code ?? null },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json({ record: null });
  }

  return NextResponse.json({
    record: { gameId: data.game_id, data: data.progress, updatedAt: data.updated_at },
  });
}

export async function PUT(request: Request) {
  const ip = clientIpFromHeaders(request.headers);
  const throttle = await rateLimit({ key: `api:progress:put:${ip}`, windowMs: 60_000, limit: 120 });
  if (!throttle.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let body: ProgressBody;
  try {
    body = (await request.json()) as ProgressBody;
  } catch {
    return badRequest("Invalid JSON body");
  }

  const parsed = validateBody(body);
  if (typeof parsed === "string") return badRequest(parsed);

  const { data: existing, error: readError } = await supabase
    .from("user_game_progress")
    .select("game_id, progress, updated_at")
    .eq("user_id", user.id)
    .eq("game_id", parsed.gameId)
    .maybeSingle();

  if (readError) {
    console.error("progress PUT read failed", { code: readError.code, message: readError.message });
    return NextResponse.json(
      { error: "Failed to read progress", code: readError.code ?? null },
      { status: 500 },
    );
  }

  const local: ProgressRecord = {
    gameId: parsed.gameId,
    data: parsed.data,
    updatedAt: parsed.updatedAt,
  };
  const remote: ProgressRecord | null = existing
    ? { gameId: existing.game_id, data: existing.progress, updatedAt: existing.updated_at }
    : null;

  const resolution = resolveProgress(local, remote);
  if (resolution && resolution.status === "conflict" && resolution.source === "remote") {
    return NextResponse.json(
      { conflict: true, reason: resolution.reason, record: resolution.record },
      { status: 409 },
    );
  }

  const { data: saved, error: writeError } = await supabase
    .from("user_game_progress")
    .upsert(
      {
        user_id: user.id,
        game_id: parsed.gameId,
        progress: parsed.data,
        updated_at: parsed.updatedAt,
      },
      { onConflict: "user_id,game_id" },
    )
    .select("game_id, progress, updated_at")
    .single();

  if (writeError) {
    console.error("progress PUT write failed", { code: writeError.code, message: writeError.message });
    return NextResponse.json(
      { error: "Failed to save progress", code: writeError.code ?? null },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    record: { gameId: saved.game_id, data: saved.progress, updatedAt: saved.updated_at },
  });
}
