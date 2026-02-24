"use client";

import { useEffect, useState } from "react";

import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Switch } from "@gamehub/ui";
import { createBrowserClient } from "@/lib/supabase/client";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import type { Database } from "@/lib/supabase/types";

type ResumeSection = Database["public"]["Tables"]["resume_sections"]["Row"];

const emptySection = {
  id: "",
  slug: "",
  title: "",
  content_html: "",
  sort_order: 0,
  visible: true,
};

export function ResumeAdmin() {
  const [sections, setSections] = useState<ResumeSection[]>([]);
  const [editing, setEditing] = useState<ResumeSection | null>(null);
  const [form, setForm] = useState(emptySection);
  const [loading, setLoading] = useState(false);

  const loadSections = async () => {
    const supabase = createBrowserClient();
    const { data } = await supabase
      .from("resume_sections")
      .select("*")
      .order("sort_order", { ascending: true });
    setSections(data ?? []);
  };

  useEffect(() => {
    loadSections();
  }, []);

  const startEdit = (section: ResumeSection) => {
    setEditing(section);
    setForm({
      id: section.id,
      slug: section.slug,
      title: section.title,
      content_html: section.content_html,
      sort_order: section.sort_order,
      visible: section.visible,
    });
  };

  const resetForm = () => {
    setEditing(null);
    setForm(emptySection);
  };

  const saveSection = async () => {
    setLoading(true);
    const supabase = createBrowserClient();
    if (editing) {
      await supabase
        .from("resume_sections")
        .update({
          slug: form.slug,
          title: form.title,
          content_html: form.content_html,
          sort_order: form.sort_order,
          visible: form.visible,
        })
        .eq("id", editing.id);
    } else {
      await supabase.from("resume_sections").insert({
        slug: form.slug,
        title: form.title,
        content_html: form.content_html,
        sort_order: form.sort_order,
        visible: form.visible,
      });
    }
    setLoading(false);
    resetForm();
    loadSections();
  };

  const deleteSection = async (id: string) => {
    const supabase = createBrowserClient();
    await supabase.from("resume_sections").delete().eq("id", id);
    loadSections();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold">Resume content</h1>
        <p className="text-muted-foreground">
          Add, reorder, and refresh resume sections visible on the public resume page.
        </p>

        <div className="space-y-4">
          {sections.map((section) => (
            <Card key={section.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <p className="text-muted-foreground text-sm">Slug: {section.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => startEdit(section)}>
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteSection(section.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Order: {section.sort_order} • {section.visible ? "Visible" : "Hidden"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>{editing ? "Edit section" : "Add new section"}</CardTitle>
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
            <Label htmlFor="sort_order">Sort order</Label>
            <Input
              id="sort_order"
              type="number"
              value={form.sort_order}
              onChange={(event) =>
                setForm({ ...form, sort_order: Number(event.target.value) })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="visible">Visible</Label>
            <Switch
              id="visible"
              checked={form.visible}
              onCheckedChange={(value) => setForm({ ...form, visible: value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Content</Label>
            <RichTextEditor
              value={form.content_html}
              onChange={(value) => setForm({ ...form, content_html: value })}
              placeholder="Write the resume section content..."
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={saveSection} disabled={loading}>
              {loading ? "Saving..." : "Save section"}
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
