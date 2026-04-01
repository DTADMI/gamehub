import { listProjects } from "@gamehub/game-platform";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@gamehub/ui";
import { ExternalLink } from "lucide-react";
import { Metadata } from "next";

import { getServerLocale } from "@/lib/server-locale";
import { siteCopy } from "@/lib/site-copy";

export const metadata: Metadata = {
  title: "Projects | GameHub",
  description: "Explore full-stack projects and products in the GameHub portfolio.",
};

export default async function ProjectsPage() {
  const locale = await getServerLocale();
  const copy = siteCopy[locale].projects;
  const projects = listProjects().filter((p) => p.visible !== false);
  const featured = projects.filter((p) => p.featured);
  const all = projects.filter((p) => p.enabled !== false);

  return (
    <div className="container mx-auto space-y-10 px-4 py-10">
      <section className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">{copy.title}</h1>
        <p className="text-muted-foreground max-w-2xl text-lg">{copy.subtitle}</p>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{copy.featured}</h2>
          <Badge variant="secondary">
            {featured.length} {copy.highlighted}
          </Badge>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((project) => (
            <Card key={project.slug} className="flex h-full flex-col">
              <CardHeader className="space-y-3">
                <CardTitle>{project.title}</CardTitle>
                <p className="text-muted-foreground text-sm">{project.shortDescription}</p>
              </CardHeader>
              <CardContent className="mt-auto space-y-4">
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button asChild variant="outline" className="w-full">
                  <a href={project.repo} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {copy.viewOnGithub}
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{copy.allProjects}</h2>
          <Badge variant="secondary">
            {all.length} {copy.total}
          </Badge>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {all.map((project) => (
            <Card key={project.slug} className="flex h-full flex-col">
              <CardHeader className="space-y-3">
                <CardTitle>{project.title}</CardTitle>
                <p className="text-muted-foreground text-sm">{project.shortDescription}</p>
              </CardHeader>
              <CardContent className="mt-auto space-y-4">
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button asChild variant="ghost" className="w-full">
                  <a href={project.repo} target="_blank" rel="noreferrer">
                    {copy.viewRepository}
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
