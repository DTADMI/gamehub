import { createServerClient } from "./server";

export async function getAdminUser() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, isAdmin: false };
  }

  const { data } = await supabase
    .from("app_admins")
    .select("id, role")
    .eq("user_id", user.id)
    .maybeSingle();

  return { user, isAdmin: Boolean(data) };
}
