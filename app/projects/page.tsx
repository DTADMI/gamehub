import { Badge } from "@/components/ui/badge";
import { listProjects } from "@/lib/projects";
import { ExternalLink, Github } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects | GameHub",
  description: "Explore my projects -- each links to its GitHub repository.",
};

export default function ProjectsPage() {
  const allProjects = listProjects();
  const featured = allProjects.filter((p) => p.featured);
  const upcoming = allProjects.filter((p) => p.upcoming);
  const rest = allProjects.filter((p) => !p.featured && !p.upcoming);

  return (
    <div className="px-6 py-8 md:px-8">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold tracking-tight">Projects</h1>
        <p className="text-muted-foreground text-lg">
          Explore my projects. Each one links to its GitHub repository.
        </p>
      </div>

      {featured.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold">Featured</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        </section>
      )}

      {rest.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold">All Projects</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Coming Soon</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((p) => (
              <ProjectCard key={p.slug} project={p} upcoming />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ProjectCard({ project, upcoming }: { project: ReturnType<typeof listProjects>[number]; upcoming?: boolean }) {
  return (
    <a
      href={project.repo}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-card text-card-foreground block rounded-lg border p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold">{project.title}</h3>
          <Github className="text-muted-foreground h-5 w-5 shrink-0" />
        </div>
        <p className="text-muted-foreground text-sm">{project.shortDescription}</p>
        <div className="flex flex-wrap gap-2">
          {project.tags.map((t) => (
            <Badge key={t} variant="secondary">{t}</Badge>
          ))}
          {upcoming && (
            <Badge variant="outline" className="border-amber-500/30 text-amber-600 dark:text-amber-400">
              Coming Soon
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground flex items-center gap-1 text-xs">
          <ExternalLink className="h-3 w-3" /> View on GitHub
        </p>
      </div>
    </a>
  );
}
