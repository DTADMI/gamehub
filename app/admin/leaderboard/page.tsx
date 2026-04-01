import { notFound } from "next/navigation";

import { canModerateLeaderboard } from "@/lib/admin/roles";
import { getAdminUser } from "@/lib/supabase/admin";

import { LeaderboardModerationAdmin } from "./LeaderboardModerationAdmin";

export default async function AdminLeaderboardPage() {
  const { role } = await getAdminUser();
  if (!role || !canModerateLeaderboard(role)) {
    notFound();
  }
  return <LeaderboardModerationAdmin />;
}
