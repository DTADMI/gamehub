'use client';

import { ProjectCard, type ProjectCardProps } from './ProjectCard';
import type { ProjectMetadata } from '@games/shared';

export interface ProjectGridProps {
  projects: ProjectMetadata[];
  userAccess?: ProjectCardProps['userAccess'];
  className?: string;
  emptyMessage?: string;
}

export function ProjectGrid({
  projects,
  userAccess,
  className = '',
  emptyMessage = 'No projects available.',
}: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 ${className}`}
    >
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          userAccess={userAccess}
        />
      ))}
    </div>
  );
}

export default ProjectGrid;
