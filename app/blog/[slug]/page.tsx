import { notFound } from "next/navigation";

import { Badge, Card, CardContent, CardHeader, CardTitle } from "@gamehub/ui";

import { createServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type BlogPostPageProps = {
  params: { slug: string };
};
type BlogPost = Database["public"]["Tables"]["blog_posts"]["Row"];

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const supabase = (await createServerClient()) as any;
  const { data: postRaw } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", params.slug)
    .eq("status", "published")
    .maybeSingle();
  const post = (postRaw ?? null) as BlogPost | null;

  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto space-y-8 px-4 py-10">
      <Card>
        <CardHeader className="space-y-3">
          <CardTitle className="text-3xl font-semibold">{post.title}</CardTitle>
          {post.excerpt && <p className="text-muted-foreground">{post.excerpt}</p>}
          <div className="flex flex-wrap gap-2">
            {post.tags?.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
          <p className="text-muted-foreground text-xs">
            {post.published_at ? new Date(post.published_at).toLocaleDateString() : ""}
          </p>
        </CardHeader>
        <CardContent>
          <div
            className="prose prose-sm sm:prose-base dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content_html }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
