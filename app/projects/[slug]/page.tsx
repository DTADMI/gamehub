import { getAllProjects,getProjectBySlug } from "@games/shared";
import { Badge } from "@games/shared";
import { Button } from "@games/shared";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@games/shared";
import { Separator } from "@games/shared";
import { CheckCircle2, ExternalLink,Lock, PlayCircle } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ProjectPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const projects = getAllProjects();
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const project = getProjectBySlug(params.slug);

  if (!project) {
    return {
      title: "Project Not Found | GameHub",
    };
  }

  return {
    title: `${project.title} | GameHub Projects`,
    description: project.fullDescription || project.shortDescription,
    openGraph: {
      title: project.title,
      description: project.shortDescription,
      images: project.image ? [project.image] : [],
    },
  };
}

export default function ProjectDetailPage({ params }: ProjectPageProps) {
  const project = getProjectBySlug(params.slug);

  if (!project) {
    notFound();
  }

  // TODO: Get actual user access from context/session
  const userAccess = {
    hasAccess: false,
    isPremium: false,
    isAuthenticated: false,
  };

  const requiresUpgrade = project.requiresSubscription && !userAccess.isPremium;
  const requiresAuth = project.requiresAuth && !userAccess.isAuthenticated;

  const getTierBadge = () => {
    const tierColors = {
      free: "bg-green-500/10 text-green-500 border-green-500/20",
      freemium: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      premium: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      enterprise: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    };

    return (
      <Badge variant="outline" className={tierColors[project.accessTier]}>
        {project.accessTier.charAt(0).toUpperCase() + project.accessTier.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <Link href="/projects" className="text-muted-foreground hover:text-foreground text-sm">
            Projects
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm">{project.title}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left: Image */}
          {project.image && (
            <div className="bg-muted relative aspect-video overflow-hidden rounded-lg border">
              <Image
                src={project.image}
                alt={project.title}
                fill
                className="object-cover"
                priority
              />
              {requiresUpgrade && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                  <Lock className="h-16 w-16 text-white" />
                </div>
              )}
            </div>
          )}

          {/* Right: Info */}
          <div className="flex flex-col justify-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight">{project.title}</h1>
            <p className="text-muted-foreground mb-6 text-xl">{project.fullDescription}</p>

            <div className="mb-6 flex flex-wrap gap-2">
              {getTierBadge()}
              {project.featured && (
                <Badge
                  variant="outline"
                  className="border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                >
                  Featured
                </Badge>
              )}
              {project.inPreview && (
                <Badge
                  variant="outline"
                  className="border-cyan-500/20 bg-cyan-500/10 text-cyan-500"
                >
                  Preview
                </Badge>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              {!project.enabled || project.upcoming ? (
                <Button disabled size="lg" className="w-full sm:w-auto">
                  Coming Soon
                </Button>
              ) : requiresAuth ? (
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/login">Sign In to Access</Link>
                </Button>
              ) : requiresUpgrade ? (
                <>
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link href={`/projects/${project.slug}/upgrade`}>
                      <Lock className="mr-2 h-4 w-4" />
                      Upgrade to Access
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                    <Link href="#features">Learn More</Link>
                  </Button>
                </>
              ) : (
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href={project.route}>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Launch Project
                  </Link>
                </Button>
              )}
            </div>

            {/* Metadata */}
            <div className="text-muted-foreground mt-6 text-sm">
              {project.version && <p>Version: {project.version}</p>}
              {project.lastUpdated && (
                <p>Last updated: {new Date(project.lastUpdated).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Features Section */}
      <div id="features" className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">Features</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {project.features.map((feature, idx) => (
            <Card key={idx}>
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
                  <CardTitle className="text-base">{feature}</CardTitle>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      <Separator className="my-8" />

      {/* Technologies Section */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">Built With</h2>
        <div className="flex flex-wrap gap-2">
          {project.technologies.map((tech) => (
            <Badge key={tech} variant="secondary" className="px-3 py-1">
              {tech}
            </Badge>
          ))}
        </div>
      </div>

      {/* Languages Section */}
      {project.supportedLanguages && project.supportedLanguages.length > 0 && (
        <>
          <Separator className="my-8" />
          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-bold">Supported Languages</h2>
            <div className="flex flex-wrap gap-2">
              {project.supportedLanguages.map((lang) => (
                <Badge key={lang} variant="outline">
                  {lang.toUpperCase()}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}

      {/* External Link */}
      {project.externalUrl && (
        <>
          <Separator className="my-8" />
          <div className="flex items-center justify-between rounded-lg border p-6">
            <div>
              <h3 className="mb-1 font-semibold">Visit External Site</h3>
              <p className="text-muted-foreground text-sm">
                This project is also available on an external platform
              </p>
            </div>
            <Button asChild variant="outline">
              <a href={project.externalUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit
              </a>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
