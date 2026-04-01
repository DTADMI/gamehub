import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@gamehub/ui";
import Link from "next/link";

import { canModerateLeaderboard, hasRoleAtLeast } from "@/lib/admin/roles";
import { getAdminUser } from "@/lib/supabase/admin";

export default async function AdminHomePage() {
  const { role } = await getAdminUser();
  const canEditContent = role ? hasRoleAtLeast(role, "editor") : false;
  const canManageFlags = role ? hasRoleAtLeast(role, "admin") : false;
  const canModerate = role ? canModerateLeaderboard(role) : false;

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-semibold">Admin dashboard</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Manage portfolio content, rollout flags, and ranking operations with role-based controls.
        </p>
        {role ? <Badge className="mt-3">Role: {role}</Badge> : null}
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Resume content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground text-sm">
              Update the resume sections shown on the public resume page.
            </p>
            <Button asChild disabled={!canEditContent}>
              <Link href="/admin/resume">Manage resume</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Blog posts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground text-sm">
              Draft, publish, and edit posts in the blog section.
            </p>
            <Button asChild disabled={!canEditContent}>
              <Link href="/admin/blog">Manage blog</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature flags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground text-sm">
              Server-persisted flags with audit logging and sensitive-toggle restrictions.
            </p>
            <Button asChild disabled={!canManageFlags}>
              <Link href="/admin/flags">Manage feature flags</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leaderboard moderation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground text-sm">
              Moderate suspicious score entries and lock/activate seasonal windows.
            </p>
            <Button asChild disabled={!canModerate}>
              <Link href="/admin/leaderboard">Manage leaderboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
