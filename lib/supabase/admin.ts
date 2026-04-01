import { cookies } from "next/headers";

import { type AdminRole,normalizeAdminRole } from "@/lib/admin/roles";

import { createServerClient } from "./server";

export async function getAdminUser() {
  const cookieStore = await cookies();
  const bypassToken = process.env.E2E_ADMIN_BYPASS_TOKEN;
  const bypassCookie = cookieStore.get("gh_e2e_admin_bypass")?.value;
  const isExplicitE2E =
    process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_E2E === "true";
  const isE2EBypassActive =
    process.env.NODE_ENV !== "production" &&
    Boolean(bypassToken) &&
    bypassToken === bypassCookie;

  if (isE2EBypassActive || isExplicitE2E) {
    return {
      user: {
        id: "e2e-admin",
        email: "e2e-admin@local.test",
      } as unknown as { id: string; email?: string | null },
      isAdmin: true,
      role: "owner" as AdminRole,
    };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, isAdmin: false, role: null };
  }

  const { data } = await supabase
    .from("app_admins")
    .select("id, role")
    .eq("user_id", user.id)
    .maybeSingle();

  const role = data?.role ? normalizeAdminRole(data.role) : null;

  return { user, isAdmin: Boolean(data), role };
}
