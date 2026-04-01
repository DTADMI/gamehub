import { Badge, Card, CardContent, CardHeader, CardTitle } from "@gamehub/ui";
import Link from "next/link";

import { getPublishedPosts } from "@/lib/content-cache";
import { getServerLocale } from "@/lib/server-locale";
import { siteCopy } from "@/lib/site-copy";
import type { Database } from "@/lib/supabase/types";

type BlogPost = Database["public"]["Tables"]["blog_posts"]["Row"];

export const metadata = {
  title: "Blog | GameHub",
  description: "Product, engineering, and game development notes.",
};

export default async function BlogPage() {
  const locale = await getServerLocale();
  const copy = siteCopy[locale].blog;
  const posts = (await getPublishedPosts()) as BlogPost[];
  const featured = posts.find((post) => post.featured) ?? posts[0] ?? null;
  const remaining = posts.filter((post) => post.id !== featured?.id);

  return (
    <div className="container mx-auto space-y-8 px-4 py-10">
      <section className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">{copy.title}</h1>
        <p className="text-muted-foreground max-w-2xl text-lg">{copy.subtitle}</p>
      </section>

      {featured ? (
        <Card className="overflow-hidden">
          {featured.cover_image_url ? (
            <div className="bg-muted relative h-56 w-full sm:h-72">
              <img
                src={featured.cover_image_url}
                alt={featured.title}
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{featured.featured ? "Featured" : "Latest"}</Badge>
              {featured.published_at ? (
                <span className="text-muted-foreground text-xs">
                  {new Date(featured.published_at).toLocaleDateString(
                    locale === "fr" ? "fr-CA" : "en-CA",
                  )}
                </span>
              ) : null}
            </div>
            <CardTitle className="text-2xl">
              <Link href={`/blog/${featured.slug}`} className="hover:text-primary transition-colors">
                {featured.title}
              </Link>
            </CardTitle>
            {featured.excerpt ? <p className="text-muted-foreground">{featured.excerpt}</p> : null}
          </CardHeader>
          <CardContent>
            <Link href={`/blog/${featured.slug}`} className="text-primary text-sm hover:underline">
              {copy.readArticle}
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {remaining.length ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {remaining.map((post) => (
            <Card key={post.id} className="flex h-full flex-col">
              <CardHeader className="space-y-3">
                <CardTitle>
                  <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                    {post.title}
                  </Link>
                </CardTitle>
                {post.excerpt ? <p className="text-muted-foreground text-sm">{post.excerpt}</p> : null}
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
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-xs">
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString(
                          locale === "fr" ? "fr-CA" : "en-CA",
                        )
                      : ""}
                  </p>
                  <Link href={`/blog/${post.slug}`} className="text-primary text-xs hover:underline">
                    {copy.readArticle}
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            {copy.fallback}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
