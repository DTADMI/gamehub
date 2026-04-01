import { NextResponse } from "next/server";

import { canReadAdminControls } from "@/lib/admin/roles";
import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";
import { readFlagAudit } from "@/lib/server/feature-flags-store";
import { getAdminUser } from "@/lib/supabase/admin";

function csvEscape(value: unknown): string {
  if (value == null) {
    return "";
  }
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  const ip = clientIpFromHeaders(request.headers);
  const throttle = await rateLimit({
    key: `api:admin:flags:audit:get:${ip}`,
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
  const effectiveAccess = headerBypass || (user && isAdmin && effectiveRole);
  if (!effectiveAccess || !effectiveRole || !canReadAdminControls(effectiveRole)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const limitParam = Number(url.searchParams.get("limit") ?? "50");
  const format = url.searchParams.get("format");
  const audit = await readFlagAudit(limitParam);

  if (format === "csv") {
    const lines = [
      "id,flag_path,old_value,new_value,actor_user_id,actor_role,request_ip,user_agent,created_at",
      ...audit.map((row) =>
        [
          csvEscape(row.id),
          csvEscape(row.flag_path),
          csvEscape(row.old_value),
          csvEscape(row.new_value),
          csvEscape(row.actor_user_id),
          csvEscape(row.actor_role),
          csvEscape(row.request_ip),
          csvEscape(row.user_agent),
          csvEscape(row.created_at),
        ].join(","),
      ),
    ];
    return new Response(lines.join("\n"), {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="feature-flag-audit.csv"',
      },
    });
  }

  return NextResponse.json({ audit });
}
