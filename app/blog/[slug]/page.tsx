import { Badge, Card, CardContent, CardHeader, CardTitle } from "@gamehub/ui";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPublishedPostBySlug } from "@/lib/content-cache";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  return { title: post?.title ?? "Blog Post", description: post?.excerpt };
}

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

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
