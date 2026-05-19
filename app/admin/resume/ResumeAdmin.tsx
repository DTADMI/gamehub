"use client";

import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Switch } from "@gamehub/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { createBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type ResumeSection = Database["public"]["Tables"]["resume_sections"]["Row"];

const resumeSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  content_html: z.string().min(1, "Content is required"),
  sort_order: z.number().min(0, "Sort order must be non-negative"),
  visible: z.boolean(),
});

type ResumeSectionForm = z.infer<typeof resumeSectionSchema>;

const defaultFormValues: ResumeSectionForm = {
  title: "",
  slug: "",
  content_html: "",
  sort_order: 0,
  visible: true,
};

const toFormValues = (section: ResumeSection): ResumeSectionForm => ({
  title: section.title,
  slug: section.slug,
  content_html: section.content_html,
  sort_order: section.sort_order,
  visible: section.visible,
});

export function ResumeAdmin() {
  const [sections, setSections] = useState<ResumeSection[]>([]);
  const [editing, setEditing] = useState<ResumeSection | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ResumeSectionForm>({
    resolver: zodResolver(resumeSectionSchema),
    defaultValues: defaultFormValues,
  });

  const loadSections = async () => {
    const supabase = createBrowserClient() as any;
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
    reset(toFormValues(section));
  };

  const resetForm = () => {
    setEditing(null);
    reset(defaultFormValues);
  };

  const onSubmit = async (data: ResumeSectionForm) => {
    setLoading(true);
    const supabase = createBrowserClient() as any;
    if (editing) {
      await supabase
        .from("resume_sections")
        .update({
          slug: data.slug,
          title: data.title,
          content_html: data.content_html,
          sort_order: data.sort_order,
          visible: data.visible,
        })
        .eq("id", editing.id);
    } else {
      await supabase.from("resume_sections").insert({
        slug: data.slug,
        title: data.title,
        content_html: data.content_html,
        sort_order: data.sort_order,
        visible: data.visible,
      });
    }
    setLoading(false);
    resetForm();
    loadSections();
  };

  const deleteSection = async (id: string) => {
    const supabase = createBrowserClient() as any;
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
                  Order: {section.sort_order} &bull; {section.visible ? "Visible" : "Hidden"}
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
              <Label htmlFor="sort_order">Sort order</Label>
              <Input
                id="sort_order"
                type="number"
                aria-invalid={!!errors.sort_order}
                {...register("sort_order", { valueAsNumber: true })}
              />
              {errors.sort_order && <p className="text-sm text-red-500">{errors.sort_order.message}</p>}
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="visible">Visible</Label>
              <Controller
                name="visible"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="visible"
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
                      placeholder="Write the resume section content..."
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
                {loading ? "Saving..." : "Save section"}
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
