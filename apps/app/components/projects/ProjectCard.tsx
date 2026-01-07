'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, ExternalLink, PlayCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'link';
import type { ProjectMetadata } from '@games/shared';

export interface ProjectCardProps {
  project: ProjectMetadata;
  userAccess?: {
    hasAccess: boolean;
    isPremium: boolean;
    isAuthenticated: boolean;
  };
  className?: string;
}

export function ProjectCard({ project, userAccess, className }: ProjectCardProps) {
  const hasAccess = userAccess?.hasAccess ?? false;
  const requiresUpgrade = project.requiresSubscription && !userAccess?.isPremium;
  const requiresAuth = project.requiresAuth && !userAccess?.isAuthenticated;

  const getTierBadge = () => {
    const tierColors = {
      free: 'bg-green-500/10 text-green-500 border-green-500/20',
      freemium: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      premium: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      enterprise: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    };

    return (
      <Badge variant="outline" className={tierColors[project.accessTier]}>
        {project.accessTier.charAt(0).toUpperCase() + project.accessTier.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = () => {
    if (project.upcoming) {
      return (
        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
          Coming Soon
        </Badge>
      );
    }
    if (project.inPreview) {
      return (
        <Badge variant="outline" className="bg-cyan-500/10 text-cyan-500 border-cyan-500/20">
          Preview
        </Badge>
      );
    }
    if (project.featured) {
      return (
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
          Featured
        </Badge>
      );
    }
    return null;
  };

  const getCTA = () => {
    if (!project.enabled) {
      return (
        <Button disabled className="w-full">
          Not Available
        </Button>
      );
    }

    if (project.upcoming) {
      return (
        <Button disabled className="w-full">
          Coming Soon
        </Button>
      );
    }

    if (requiresAuth) {
      return (
        <Button asChild className="w-full">
          <Link href="/login">Sign In to Access</Link>
        </Button>
      );
    }

    if (requiresUpgrade) {
      return (
        <Button asChild variant="default" className="w-full">
          <Link href={`/projects/${project.slug}/upgrade`}>
            <Lock className="mr-2 h-4 w-4" />
            Upgrade to Access
          </Link>
        </Button>
      );
    }

    if (hasAccess) {
      return (
        <Button asChild className="w-full">
          <Link href={project.route}>
            <PlayCircle className="mr-2 h-4 w-4" />
            Open Project
          </Link>
        </Button>
      );
    }

    // Free or freemium tier
    if (project.accessTier === 'free' || project.accessTier === 'freemium') {
      return (
        <Button asChild className="w-full">
          <Link href={project.route}>
            <PlayCircle className="mr-2 h-4 w-4" />
            Get Started
          </Link>
        </Button>
      );
    }

    return (
      <Button asChild variant="outline" className="w-full">
        <Link href={`/projects/${project.slug}`}>
          Learn More
        </Link>
      </Button>
    );
  };

  return (
    <Card className={`flex flex-col overflow-hidden transition-all hover:shadow-lg ${className}`}>
      {/* Image */}
      {project.image && (
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover transition-transform hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Lock overlay for locked projects */}
          {!hasAccess && requiresUpgrade && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <Lock className="h-12 w-12 text-white" />
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <CardHeader className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2">{project.title}</CardTitle>
          {project.externalUrl && (
            <ExternalLink className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          )}
        </div>
        <CardDescription className="line-clamp-2">{project.shortDescription}</CardDescription>
      </CardHeader>

      <CardContent>
        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {getTierBadge()}
          {getStatusBadge()}
        </div>

        {/* Features preview */}
        {project.features && project.features.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-muted-foreground mb-2">Key Features:</p>
            <ul className="text-sm space-y-1">
              {project.features.slice(0, 3).map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-primary" />
                  <span className="line-clamp-1">{feature}</span>
                </li>
              ))}
              {project.features.length > 3 && (
                <li className="text-muted-foreground italic">
                  +{project.features.length - 3} more features
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Technologies */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {project.technologies.slice(0, 4).map((tech) => (
              <Badge key={tech} variant="secondary" className="text-xs">
                {tech}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      {/* Footer with CTA */}
      <CardFooter className="pt-0">
        {getCTA()}
      </CardFooter>
    </Card>
  );
}

export default ProjectCard;
