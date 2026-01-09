import {
  getAllProjects,
  getEnabledProjects,
  getFeaturedProjects,
  getProjectBySlug,
  getProjectsByCategory,
  type ProjectMetadata,
} from "@gamehub/projects-metadata";
import { Injectable } from "@nestjs/common";

import { AccessControlService } from "../access-control/access-control.service";

@Injectable()
export class ProjectsService {
  constructor(private accessControlService: AccessControlService) {}

  /**
   * Get all projects (respecting user access if provided)
   */
  async getProjects(userId?: string): Promise<ProjectMetadata[]> {
    const projects = getEnabledProjects();

    if (!userId) {
      // Return only free/freemium projects for non-authenticated users
      return projects.filter(
        (p) => !p.requiresAuth && (p.accessTier === "free" || p.accessTier === "freemium"),
      );
    }

    // Get user's accessible projects
    const accessibleProjectIds = await this.accessControlService.getUserAccessibleProjects(userId);

    // Admin has access to all
    if (accessibleProjectIds.includes("*")) {
      return projects;
    }

    // Filter based on user access
    return projects.filter((p) => {
      // Free projects are accessible to all authenticated users
      if (p.accessTier === "free") {
        return true;
      }

      // Freemium projects are accessible to all authenticated users (basic features)
      if (p.accessTier === "freemium") {
        return true;
      }

      // Premium/Enterprise require explicit access
      return accessibleProjectIds.includes(p.slug);
    });
  }

  /**
   * Get featured projects
   */
  async getFeaturedProjects(userId?: string): Promise<ProjectMetadata[]> {
    const projects = await this.getProjects(userId);
    return projects.filter((p) => p.featured);
  }

  /**
   * Get project by slug with access check
   */
  async getProject(slug: string, userId?: string): Promise<ProjectMetadata | null> {
    const project = getProjectBySlug(slug);
    if (!project) {
      return null;
    }

    // Check if user has access
    if (userId) {
      const hasAccess = await this.accessControlService.checkAccess(userId, slug);
      return { ...project, _hasAccess: hasAccess } as any;
    }

    return project;
  }

  /**
   * Get projects by category
   */
  async getProjectsByCategory(category: string, userId?: string): Promise<ProjectMetadata[]> {
    const projects = await this.getProjects(userId);
    return projects.filter((p) => p.category === category);
  }

  /**
   * Check if user can access project
   */
  async canAccessProject(slug: string, userId: string): Promise<boolean> {
    const project = getProjectBySlug(slug);
    if (!project) {
      return false;
    }

    // Project must be enabled
    if (!project.enabled) {
      return false;
    }

    // Free tier is always accessible
    if (project.accessTier === "free") {
      return true;
    }

    // Check access control
    return this.accessControlService.checkAccess(userId, slug);
  }
}
