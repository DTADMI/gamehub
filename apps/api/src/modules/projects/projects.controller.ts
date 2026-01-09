import { Controller, Get, Param, Query, Request, UseGuards } from "@nestjs/common";

import { OptionalJwtAuthGuard } from "../auth/guards/optional-jwt-auth.guard";
import { ProjectsService } from "./projects.service";

@Controller("projects")
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  /**
   * Get all accessible projects
   * GET /projects
   */
  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async getProjects(@Request() req) {
    const userId = req.user?.id;
    return this.projectsService.getProjects(userId);
  }

  /**
   * Get featured projects
   * GET /projects/featured
   */
  @Get("featured")
  @UseGuards(OptionalJwtAuthGuard)
  async getFeaturedProjects(@Request() req) {
    const userId = req.user?.id;
    return this.projectsService.getFeaturedProjects(userId);
  }

  /**
   * Get projects by category
   * GET /projects/category/:category
   */
  @Get("category/:category")
  @UseGuards(OptionalJwtAuthGuard)
  async getProjectsByCategory(@Request() req, @Param("category") category: string) {
    const userId = req.user?.id;
    return this.projectsService.getProjectsByCategory(category, userId);
  }

  /**
   * Get project by slug
   * GET /projects/:slug
   */
  @Get(":slug")
  @UseGuards(OptionalJwtAuthGuard)
  async getProject(@Request() req, @Param("slug") slug: string) {
    const userId = req.user?.id;
    const project = await this.projectsService.getProject(slug, userId);

    if (!project) {
      return { error: "Project not found", statusCode: 404 };
    }

    return project;
  }

  /**
   * Check if user can access a project
   * GET /projects/:slug/can-access
   */
  @Get(":slug/can-access")
  @UseGuards(OptionalJwtAuthGuard)
  async canAccessProject(@Request() req, @Param("slug") slug: string) {
    const userId = req.user?.id;

    if (!userId) {
      return { canAccess: false, reason: "Not authenticated" };
    }

    const canAccess = await this.projectsService.canAccessProject(slug, userId);

    return { canAccess };
  }
}
