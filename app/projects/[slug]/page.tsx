import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProject, listProjects } from "@/lib/projects";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return listProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Project Not Found | GameHub" };
  return {
    title: `${project.title} | GameHub Projects`,
    description: project.shortDescription,
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <div className="px-6 py-8 md:px-8">
      <Link href="/projects" className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1 text-sm">
        <ArrowLeft className="h-4 w-4" /> Back to Projects
      </Link>

      <div className="max-w-3xl">
        <div className="mb-4 flex items-start justify-between">
          <h1 className="text-4xl font-bold tracking-tight">{project.title}</h1>
          {project.featured && (
            <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600">
              Featured
            </Badge>
          )}
        </div>

        <p className="text-muted-foreground mb-6 text-xl">{project.shortDescription}</p>

        <div className="mb-6 flex flex-wrap gap-2">
          {project.tags.map((t) => (
            <Badge key={t} variant="secondary">{t}</Badge>
          ))}
          {project.upcoming && (
            <Badge variant="outline" className="border-amber-500/30 text-amber-600 dark:text-amber-400">
              Coming Soon
            </Badge>
          )}
        </div>

        <div className="flex gap-3">
          <Button asChild size="lg" className="gap-2">
            <a href={project.repo} target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4" /> View on GitHub
            </a>
          </Button>
          {project.demo && (
            <Button asChild variant="outline" size="lg" className="gap-2">
              <a href={project.demo} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" /> Live Demo
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
