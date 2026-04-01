import { unstable_cache } from "next/cache";

import { createPublicServerClient } from "@/lib/supabase/public-server";
import type { Database } from "@/lib/supabase/types";

type BlogPost = Database["public"]["Tables"]["blog_posts"]["Row"];
type ResumeSection = Database["public"]["Tables"]["resume_sections"]["Row"];

export const getPublishedPosts = unstable_cache(
  async (): Promise<BlogPost[]> => {
    const supabase = createPublicServerClient();
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    return (data ?? []) as BlogPost[];
  },
  ["content:blog:published"],
  { revalidate: 300, tags: ["blog_posts"] },
);

export async function getPublishedPostBySlug(slug: string): Promise<BlogPost | null> {
  const cached = unstable_cache(
    async (): Promise<BlogPost | null> => {
      const supabase = createPublicServerClient();
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

      return (data ?? null) as BlogPost | null;
    },
    [`content:blog:slug:${slug}`],
    { revalidate: 300, tags: ["blog_posts", `blog_post:${slug}`] },
  );

  return cached();
}

export const getVisibleResumeSections = unstable_cache(
  async (): Promise<ResumeSection[]> => {
    const supabase = createPublicServerClient();
    const { data } = await supabase
      .from("resume_sections")
      .select("*")
      .eq("visible", true)
      .order("sort_order", { ascending: true });

    return (data ?? []) as ResumeSection[];
  },
  ["content:resume:visible"],
  { revalidate: 300, tags: ["resume_sections"] },
);
