import { Injectable, NotFoundException } from "@nestjs/common";
import { AccessTier, UserProjectAccess } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AccessControlService {
  constructor(private prisma: PrismaService) {}

  /**
   * Check if a user has access to a specific project
   */
  async checkAccess(userId: string, projectId: string): Promise<boolean> {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        isAdmin: true,
        allowedProjects: true,
        subscriptionStatus: true,
        subscriptionExpiresAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Admins have access to everything
    if (user.isAdmin) {
      return true;
    }

    // Check if project is in user's allowed list
    if (user.allowedProjects.includes(projectId)) {
      return true;
    }

    // Check for explicit access grant
    const access = await this.prisma.userProjectAccess.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    if (!access) {
      return false;
    }

    // Check if access has expired
    if (access.expiresAt && access.expiresAt < new Date()) {
      return false;
    }

    return true;
  }

  /**
   * Get all projects a user has access to
   */
  async getUserAccessibleProjects(userId: string): Promise<string[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        isAdmin: true,
        allowedProjects: true,
        projectAccess: {
          where: {
            OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
          },
          select: {
            projectId: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Admins can access all projects
    if (user.isAdmin) {
      return ["*"]; // Special marker for admin
    }

    // Combine allowed projects and explicit access
    const accessibleProjects = new Set([
      ...user.allowedProjects,
      ...user.projectAccess.map((a) => a.projectId),
    ]);

    return Array.from(accessibleProjects);
  }

  /**
   * Grant access to a project
   */
  async grantAccess(
    userId: string,
    projectId: string,
    tier: AccessTier,
    expiresAt?: Date,
  ): Promise<UserProjectAccess> {
    return this.prisma.userProjectAccess.upsert({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
      update: {
        tier,
        expiresAt,
      },
      create: {
        userId,
        projectId,
        tier,
        expiresAt,
      },
    });
  }

  /**
   * Revoke access to a project
   */
  async revokeAccess(userId: string, projectId: string): Promise<void> {
    await this.prisma.userProjectAccess.delete({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });
  }

  /**
   * Get user's access details for a project
   */
  async getAccessDetails(userId: string, projectId: string): Promise<UserProjectAccess | null> {
    return this.prisma.userProjectAccess.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });
  }

  /**
   * Get all users with access to a project (for admin)
   */
  async getProjectUsers(projectId: string) {
    return this.prisma.userProjectAccess.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Update access tier
   */
  async updateAccessTier(
    userId: string,
    projectId: string,
    tier: AccessTier,
  ): Promise<UserProjectAccess> {
    return this.prisma.userProjectAccess.update({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
      data: {
        tier,
      },
    });
  }

  /**
   * Extend access expiration
   */
  async extendAccess(
    userId: string,
    projectId: string,
    newExpiresAt: Date,
  ): Promise<UserProjectAccess> {
    return this.prisma.userProjectAccess.update({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
      data: {
        expiresAt: newExpiresAt,
      },
    });
  }
}
