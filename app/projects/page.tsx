import { listProjects } from "@games/shared";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@gamehub/ui";
import { ExternalLink } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects | GameHub",
  description: "Explore full-stack projects and products in the GameHub portfolio.",
};

export default function ProjectsPage() {
  const projects = listProjects().filter((p) => p.visible !== false);
  const featured = projects.filter((p) => p.featured);
  const all = projects.filter((p) => p.enabled !== false);

  return (
    <div className="container mx-auto space-y-10 px-4 py-10">
      <section className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">Projects</h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Product-focused builds with clear technical depth, shipping discipline, and modern UX.
          Every project links directly to its GitHub repository.
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Featured</h2>
          <Badge variant="secondary">{featured.length} highlighted</Badge>
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
                    View on GitHub
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">All Projects</h2>
          <Badge variant="secondary">{all.length} total</Badge>
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
                    View repository
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
