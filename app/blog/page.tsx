import Link from "next/link";

import { Badge, Card, CardContent, CardHeader, CardTitle } from "@gamehub/ui";

import { createServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type BlogPost = Database["public"]["Tables"]["blog_posts"]["Row"];

export const metadata = {
  title: "Blog | GameHub",
  description: "Product, engineering, and game development notes.",
};

export default async function BlogPage() {
  const supabase = createServerClient() as any;
  const { data: postsRaw } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  const posts = (postsRaw ?? []) as BlogPost[];

  return (
    <div className="container mx-auto space-y-10 px-4 py-10">
      <section className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">Blog</h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Deep dives into product thinking, engineering lessons, and behind-the-scenes work.
        </p>
      </section>

      {posts?.length ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.id} className="flex h-full flex-col">
              <CardHeader className="space-y-3">
                <CardTitle>
                  <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                    {post.title}
                  </Link>
                </CardTitle>
                {post.excerpt && <p className="text-muted-foreground text-sm">{post.excerpt}</p>}
              </CardHeader>
              <CardContent className="mt-auto space-y-3">
                {post.tags?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : null}
                <p className="text-muted-foreground text-xs">
                  {post.published_at ? new Date(post.published_at).toLocaleDateString() : ""}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No posts published yet. Check back soon.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
