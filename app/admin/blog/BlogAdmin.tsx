"use client";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@gamehub/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { createBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type BlogPost = Database["public"]["Tables"]["blog_posts"]["Row"];

const blogPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, hyphens only"),
  excerpt: z.string().optional(),
  content_html: z.string().min(1, "Content is required"),
  tags: z.string().optional(),
  status: z.enum(["draft", "published"]),
  featured: z.boolean(),
  published_at: z.string().optional(),
  cover_image_url: z.string().optional(),
});

type BlogPostForm = z.infer<typeof blogPostSchema>;

const defaultFormValues: BlogPostForm = {
  title: "",
  slug: "",
  excerpt: "",
  content_html: "",
  tags: "",
  status: "draft",
  featured: false,
  published_at: "",
  cover_image_url: "",
};

const toFormValues = (post: BlogPost): BlogPostForm => ({
  title: post.title,
  slug: post.slug,
  excerpt: post.excerpt ?? "",
  content_html: post.content_html,
  tags: (post.tags ?? []).join(", "),
  status: post.status as BlogPostForm["status"],
  featured: post.featured,
  published_at: post.published_at ?? "",
  cover_image_url: post.cover_image_url ?? "",
});

export function BlogAdmin() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BlogPostForm>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: defaultFormValues,
  });

  const loadPosts = async () => {
    const supabase = createBrowserClient() as any;
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });
    setPosts(data ?? []);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const startEdit = (post: BlogPost) => {
    setEditing(post);
    reset(toFormValues(post));
  };

  const resetForm = () => {
    setEditing(null);
    reset(defaultFormValues);
  };

  const onSubmit = async (data: BlogPostForm) => {
    setLoading(true);
    const supabase = createBrowserClient() as any;
    const payload = {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || null,
      content_html: data.content_html,
      status: data.status,
      tags: data.tags
        ? data.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],
      featured: data.featured,
      cover_image_url: data.cover_image_url || null,
      published_at: data.published_at || null,
    };

    if (editing) {
      await supabase.from("blog_posts").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("blog_posts").insert(payload);
    }

    setLoading(false);
    resetForm();
    loadPosts();
  };

  const uploadCoverImage = async (file: File | null) => {
    if (!file) {
      return;
    }
    setUploading(true);
    setUploadMessage(null);

    try {
      const formData = new FormData();
      formData.set("file", file);

      const response = await fetch("/api/admin/uploads/blog-cover", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error ?? "Upload failed");
      }

      const payload = (await response.json()) as { url: string };
      setValue("cover_image_url", payload.url);
      setUploadMessage("Cover uploaded.");
    } catch (err) {
      setUploadMessage(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const deletePost = async (id: string) => {
    const supabase = createBrowserClient() as any;
    await supabase.from("blog_posts").delete().eq("id", id);
    loadPosts();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold">Blog posts</h1>
        <p className="text-muted-foreground">
          Draft and publish posts. Only published posts appear on the public blog.
        </p>

        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{post.title}</CardTitle>
                  <p className="text-muted-foreground text-sm">Slug: {post.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={post.status === "published" ? "default" : "outline"}>
                    {post.status}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => startEdit(post)}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => deletePost(post.id)}>
                    Delete
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {post.excerpt && (
                  <p className="text-muted-foreground text-sm">{post.excerpt}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>{editing ? "Edit post" : "New post"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                aria-invalid={!!errors.title}
                {...register("title")}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                aria-invalid={!!errors.slug}
                {...register("slug")}
              />
              {errors.slug && <p className="text-sm text-red-500">{errors.slug.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Input
                id="excerpt"
                {...register("excerpt")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                {...register("tags")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cover">Cover image URL</Label>
              <Input
                id="cover"
                {...register("cover_image_url")}
              />
              <Input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  void uploadCoverImage(file);
                  event.target.value = "";
                }}
              />
              <p className="text-muted-foreground text-xs">
                {uploading ? "Uploading..." : uploadMessage ?? "Upload to Supabase media bucket or paste a URL."}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="published_at">Publish date (ISO)</Label>
              <Input
                id="published_at"
                {...register("published_at")}
                placeholder="2026-02-24T12:00:00Z"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="featured">Featured</Label>
              <Controller
                name="featured"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="featured"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Controller
                name="content_html"
                control={control}
                render={({ field }) => (
                  <>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Write your post..."
                    />
                    {errors.content_html && (
                      <p className="text-sm text-red-500">{errors.content_html.message}</p>
                    )}
                  </>
                )}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save post"}
              </Button>
              <Button type="button" variant="ghost" onClick={resetForm}>
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
