import Link from "next/link";

import { Button, Card, CardContent, CardHeader, CardTitle } from "@gamehub/ui";

export default function AdminHomePage() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-semibold">Admin dashboard</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Manage portfolio content and publishing without touching the database directly.
        </p>
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
            <Button asChild>
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
            <Button asChild>
              <Link href="/admin/blog">Manage blog</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
