"use client";

import { useEffect, useState } from "react";

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
import { createBrowserClient } from "@/lib/supabase/client";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import type { Database } from "@/lib/supabase/types";

type BlogPost = Database["public"]["Tables"]["blog_posts"]["Row"];

const emptyPost = {
  id: "",
  title: "",
  slug: "",
  excerpt: "",
  content_html: "",
  status: "draft",
  tags: "",
  featured: false,
  published_at: "",
  cover_image_url: "",
};

export function BlogAdmin() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState(emptyPost);
  const [loading, setLoading] = useState(false);

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
    setForm({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      content_html: post.content_html,
      status: post.status,
      tags: (post.tags ?? []).join(", "),
      featured: post.featured,
      published_at: post.published_at ?? "",
      cover_image_url: post.cover_image_url ?? "",
    });
  };

  const resetForm = () => {
    setEditing(null);
    setForm(emptyPost);
  };

  const savePost = async () => {
    setLoading(true);
    const supabase = createBrowserClient() as any;
    const payload = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt || null,
      content_html: form.content_html,
      status: form.status,
      tags: form.tags
        ? form.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],
      featured: form.featured,
      cover_image_url: form.cover_image_url || null,
      published_at: form.published_at || null,
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
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={form.slug}
              onChange={(event) => setForm({ ...form, slug: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Input
              id="excerpt"
              value={form.excerpt}
              onChange={(event) => setForm({ ...form, excerpt: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={form.tags}
              onChange={(event) => setForm({ ...form, tags: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cover">Cover image URL</Label>
            <Input
              id="cover"
              value={form.cover_image_url}
              onChange={(event) => setForm({ ...form, cover_image_url: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(value) => setForm({ ...form, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="published_at">Publish date (ISO)</Label>
            <Input
              id="published_at"
              value={form.published_at}
              onChange={(event) => setForm({ ...form, published_at: event.target.value })}
              placeholder="2026-02-24T12:00:00Z"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="featured">Featured</Label>
            <Switch
              id="featured"
              checked={form.featured}
              onCheckedChange={(value) => setForm({ ...form, featured: value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Content</Label>
            <RichTextEditor
              value={form.content_html}
              onChange={(value) => setForm({ ...form, content_html: value })}
              placeholder="Write your post..."
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={savePost} disabled={loading}>
              {loading ? "Saving..." : "Save post"}
            </Button>
            <Button variant="ghost" onClick={resetForm}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
