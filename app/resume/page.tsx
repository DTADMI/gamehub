import { Button, Card, CardContent, CardHeader, CardTitle } from "@gamehub/ui";
import { Github, Linkedin } from "lucide-react";

import { GITHUB_URL, LINKEDIN_URL } from "@gamehub/game-platform";

import { getVisibleResumeSections } from "@/lib/content-cache";
import type { Database } from "@/lib/supabase/types";

type ResumeSection = Database["public"]["Tables"]["resume_sections"]["Row"];

export const metadata = {
  title: "Resume | GameHub",
  description: "Resume and career highlights for GameHub's creator.",
};

export default async function ResumePage() {
  const sections = (await getVisibleResumeSections()) as ResumeSection[];

  return (
    <div className="container mx-auto space-y-10 px-4 py-10">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Darryl Tadmi</h1>
          <p className="text-muted-foreground text-lg">
            Senior Full Stack Developer focused on building scalable products with thoughtful UX,
            robust data flows, and reliable delivery.
          </p>
          <div className="flex flex-wrap gap-3">
            {LINKEDIN_URL && (
              <Button asChild variant="outline">
                <a href={LINKEDIN_URL} target="_blank" rel="noreferrer">
                  <Linkedin className="mr-2 h-4 w-4" />
                  LinkedIn
                </a>
              </Button>
            )}
            {GITHUB_URL && (
              <Button asChild variant="outline">
                <a href={GITHUB_URL} target="_blank" rel="noreferrer">
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </a>
              </Button>
            )}
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Recruiter-friendly overview</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3 text-sm">
            <p>11+ years of experience delivering modern web platforms across multiple industries.</p>
            <p>Deep strength in React, TypeScript, Node.js, Java, and cloud-native delivery.</p>
            <p>Proven record building game and productivity platforms with measurable performance wins.</p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        {sections?.length ? (
          sections.map((section) => (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-sm sm:prose-base dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: section.content_html }}
                />
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Resume content is not available yet. Add sections from the admin dashboard.
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}

