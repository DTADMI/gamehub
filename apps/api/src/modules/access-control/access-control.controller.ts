import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";

import { AdminGuard } from "../auth/guards/admin.guard";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AccessControlService } from "./access-control.service";
import { CheckAccessDto, GrantAccessDto, UpdateAccessTierDto } from "./dto";

@Controller("access")
@UseGuards(JwtAuthGuard)
export class AccessControlController {
  constructor(private readonly accessControlService: AccessControlService) {}

  /**
   * Check if current user has access to a project
   * GET /access/:projectId/check
   */
  @Get(":projectId/check")
  async checkAccess(@Req() req: Request & { user: any }, @Param("projectId") projectId: string) {
    const hasAccess = await this.accessControlService.checkAccess(req.user.id, projectId);
    return { hasAccess };
  }

  /**
   * Get all projects current user has access to
   * GET /access/my-projects
   */
  @Get("my-projects")
  async getMyProjects(@Req() req: Request & { user: any }) {
    const projects = await this.accessControlService.getUserAccessibleProjects(req.user.id);
    return { projects };
  }

  /**
   * Get current user's access details for a project
   * GET /access/:projectId
   */
  @Get(":projectId")
  async getAccessDetails(
    @Req() req: Request & { user: any },
    @Param("projectId") projectId: string,
  ) {
    const details = await this.accessControlService.getAccessDetails(req.user.id, projectId);
    return details;
  }

  /**
   * Grant access to a project (Admin only)
   * POST /access/grant
   */
  @Post("grant")
  @UseGuards(AdminGuard)
  async grantAccess(@Body() dto: GrantAccessDto) {
    return this.accessControlService.grantAccess(
      dto.userId,
      dto.projectId,
      dto.tier,
      dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    );
  }

  /**
   * Revoke access to a project (Admin only)
   * DELETE /access/:userId/:projectId
   */
  @Delete(":userId/:projectId")
  @UseGuards(AdminGuard)
  async revokeAccess(@Param("userId") userId: string, @Param("projectId") projectId: string) {
    await this.accessControlService.revokeAccess(userId, projectId);
    return { success: true };
  }

  /**
   * Update access tier (Admin only)
   * PATCH /access/:userId/:projectId/tier
   */
  @Patch(":userId/:projectId/tier")
  @UseGuards(AdminGuard)
  async updateAccessTier(
    @Param("userId") userId: string,
    @Param("projectId") projectId: string,
    @Body() dto: UpdateAccessTierDto,
  ) {
    return this.accessControlService.updateAccessTier(userId, projectId, dto.tier);
  }

  /**
   * Get all users with access to a project (Admin only)
   * GET /access/project/:projectId/users
   */
  @Get("project/:projectId/users")
  @UseGuards(AdminGuard)
  async getProjectUsers(@Param("projectId") projectId: string) {
    const users = await this.accessControlService.getProjectUsers(projectId);
    return { users };
  }
}
