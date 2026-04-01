"use client";

import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@gamehub/ui";
import Image from "next/image";

import { useSiteLocale } from "@gamehub/game-platform/lib/site-locale";
import { useProjectsManifest } from "@/lib/portfolio-queries";
import { siteCopy } from "@/lib/site-copy";

export default function ProjectsClientPage() {
  const { locale } = useSiteLocale();
  const copy = siteCopy[locale].projects;
  const { data: manifest = [] } = useProjectsManifest();

  const projects = manifest
    .filter((project) => project.visible !== false && project.enabled !== false);
  const featured = projects.filter((project) => project.featured);

  const renderActionButtons = (project: (typeof projects)[number]) => (
    <div className="grid grid-cols-2 gap-2">
      <Button
        asChild={project.repoVisibility === "public"}
        variant={project.repoVisibility === "public" ? "outline" : "secondary"}
        className="w-full"
        disabled={project.repoVisibility !== "public"}
      >
        {project.repoVisibility === "public" ? (
          <a href={project.repoUrl} target="_blank" rel="noreferrer">
            {copy.viewRepository}
          </a>
        ) : (
          <span>Private repo</span>
        )}
      </Button>

      <Button asChild={project.deployed} className="w-full" disabled={!project.deployed}>
        {project.deployed && project.websiteUrl ? (
          <a href={project.websiteUrl} target="_blank" rel="noreferrer">
            Website
          </a>
        ) : (
          <span>Coming soon</span>
        )}
      </Button>
    </div>
  );

  const renderCard = (project: (typeof projects)[number]) => (
    <Card key={project.slug} className="flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[16/9]">
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
      </div>
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
        {renderActionButtons(project)}
      </CardContent>
    </Card>
  );

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
          {featured.map((project) => renderCard(project))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{copy.allProjects}</h2>
          <Badge variant="secondary">
            {projects.length} {copy.total}
          </Badge>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => renderCard(project))}
        </div>
      </section>
    </div>
  );
}
