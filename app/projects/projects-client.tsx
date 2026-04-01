"use client";

import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@gamehub/ui";
import Image from "next/image";
import { startTransition, useCallback, useDeferredValue, useMemo, useState } from "react";

import { useSiteLocale } from "@gamehub/game-platform/lib/site-locale";
import type { ProjectEntry } from "@gamehub/game-platform/metadata/projects";
import { useProjectsManifest } from "@/lib/portfolio-queries";
import { siteCopy } from "@/lib/site-copy";

export default function ProjectsClientPage() {
  const { locale } = useSiteLocale();
  const copy = siteCopy[locale].projects;
  const { data: manifestData, isError, isFetching } = useProjectsManifest();
  const manifest = (manifestData ?? []) as ProjectEntry[];
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const [scope, setScope] = useState<"all" | "deployed" | "upcoming">("all");

  const projects = useMemo(
    () =>
      manifest
        .filter((project) => project.visible !== false && project.enabled !== false)
        .filter((project) => {
          if (scope === "deployed") {
            return project.deployed;
          }
          if (scope === "upcoming") {
            return !project.deployed;
          }
          return true;
        })
        .filter((project) => {
          if (!deferredQuery) {
            return true;
          }
          const haystack = `${project.title} ${project.shortDescription} ${project.tags.join(" ")}`.toLowerCase();
          return haystack.includes(deferredQuery);
        }),
    [manifest, deferredQuery, scope],
  );
  const featured = useMemo(() => projects.filter((project) => project.featured), [projects]);

  const handleScopeChange = useCallback((nextScope: "all" | "deployed" | "upcoming") => {
    startTransition(() => setScope(nextScope));
  }, []);

  const renderActionButtons = useCallback((project: (typeof projects)[number]) => (
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
  ), [copy.viewRepository]);

  const renderCard = useCallback((project: (typeof projects)[number]) => (
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
  ), [renderActionButtons]);

  return (
    <div className="container mx-auto space-y-10 px-4 py-10">
      <section className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">{copy.title}</h1>
        <p className="text-muted-foreground max-w-2xl text-lg">{copy.subtitle}</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects..."
            className="bg-background ring-border placeholder:text-muted-foreground min-h-11 w-full rounded-md border px-3 text-sm focus:ring-2 focus:outline-none sm:max-w-sm"
          />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant={scope === "all" ? "default" : "outline"} onClick={() => handleScopeChange("all")}>
              All
            </Button>
            <Button size="sm" variant={scope === "deployed" ? "default" : "outline"} onClick={() => handleScopeChange("deployed")}>
              Live
            </Button>
            <Button size="sm" variant={scope === "upcoming" ? "default" : "outline"} onClick={() => handleScopeChange("upcoming")}>
              Coming soon
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{copy.featured}</h2>
          <Badge variant="secondary">
            {featured.length} {copy.highlighted}
          </Badge>
        </div>
        {isError ? (
          <div className="text-destructive rounded-md border border-current/30 p-4 text-sm">
            Unable to load projects right now.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((project) => renderCard(project))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{copy.allProjects}</h2>
          <Badge variant="secondary">
            {isFetching ? "Updating..." : `${projects.length} ${copy.total}`}
          </Badge>
        </div>
        {projects.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => renderCard(project))}
          </div>
        ) : (
          <div className="text-muted-foreground rounded-md border border-dashed p-6 text-sm">
            No projects match the current filters.
          </div>
        )}
      </section>
    </div>
  );
}
