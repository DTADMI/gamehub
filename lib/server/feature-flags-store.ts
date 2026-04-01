import {
  DEFAULT_FEATURE_FLAGS,
  type FeatureFlags,
  FLAG_DEFINITIONS,
  getByPath,
  mergeFeatureFlags,
  setByPath,
} from "@/lib/feature-flags";
import { redis } from "@/lib/redis";
import { createServerClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";

const REDIS_KEY = "gh:feature-flags:v1";

type PersistedFlagRow = {
  path: string;
  value: unknown;
  is_sensitive: boolean;
};

export type FeatureFlagAuditEntry = {
  id: string;
  flag_path: string;
  old_value: Json | null;
  new_value: Json | null;
  actor_user_id: string | null;
  actor_role: string;
  request_ip: string | null;
  user_agent: string | null;
  created_at: string;
};

export async function readPersistedFlags(): Promise<FeatureFlags> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("feature_flags")
    .select("path, value, is_sensitive");

  if (!error && data) {
    const next = structuredClone(DEFAULT_FEATURE_FLAGS) as FeatureFlags;
    for (const row of data as PersistedFlagRow[]) {
      setByPath(next as unknown as Record<string, unknown>, row.path, row.value);
    }
    return mergeFeatureFlags(next);
  }

  const fallback = await redis.get<Partial<FeatureFlags>>(REDIS_KEY);
  return mergeFeatureFlags(fallback ?? DEFAULT_FEATURE_FLAGS);
}

export async function upsertFlag(params: {
  path: string;
  value: unknown;
  actorUserId: string | null;
  actorRole: string;
  requestIp: string;
  userAgent: string;
}) {
  const { path, value, actorUserId, actorRole, requestIp, userAgent } = params;
  const sensitive = FLAG_DEFINITIONS.find((flag) => flag.path === path)?.sensitive ?? false;

  const supabase = await createServerClient();
  const { data: previousRow } = await supabase
    .from("feature_flags")
    .select("value")
    .eq("path", path)
    .maybeSingle();

  const oldValue = previousRow?.value ?? getByPath(DEFAULT_FEATURE_FLAGS, path) ?? null;

  const { error: upsertError } = await supabase.from("feature_flags").upsert(
    {
      path,
      value: value as Json,
      is_sensitive: sensitive,
      updated_by: actorUserId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "path" },
  );

  if (!upsertError) {
    await supabase.from("feature_flag_audit").insert({
      flag_path: path,
      old_value: oldValue as Json,
      new_value: value as Json,
      actor_user_id: actorUserId,
      actor_role: actorRole,
      request_ip: requestIp,
      user_agent: userAgent,
    });
    return { persisted: true };
  }

  const snapshot = await readPersistedFlags();
  setByPath(snapshot as unknown as Record<string, unknown>, path, value);
  await redis.set(REDIS_KEY, snapshot);
  return { persisted: false, fallback: "redis" as const };
}

export async function readFlagAudit(limit = 50): Promise<FeatureFlagAuditEntry[]> {
  const safeLimit = Math.min(200, Math.max(1, Math.trunc(limit)));
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("feature_flag_audit")
    .select(
      "id,flag_path,old_value,new_value,actor_user_id,actor_role,request_ip,user_agent,created_at",
    )
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (error || !data) {
    return [];
  }
  return data as FeatureFlagAuditEntry[];
}
