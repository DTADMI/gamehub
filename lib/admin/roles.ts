export type AdminRole = "owner" | "admin" | "editor" | "analyst";

const ROLE_WEIGHT: Record<AdminRole, number> = {
  owner: 400,
  admin: 300,
  editor: 200,
  analyst: 100,
};

export function normalizeAdminRole(value: string | null | undefined): AdminRole {
  if (!value) {
    return "analyst";
  }
  const role = value.toLowerCase();
  if (role === "owner" || role === "admin" || role === "editor" || role === "analyst") {
    return role;
  }
  return "analyst";
}

export function hasRoleAtLeast(role: AdminRole, minimum: AdminRole): boolean {
  return ROLE_WEIGHT[role] >= ROLE_WEIGHT[minimum];
}

export function isSensitiveFlagPath(path: string): boolean {
  const sensitivePrefixes = [
    "ui.allowPlayUpcomingLocal",
    "experimental.",
    "auth.requireEmailVerification",
    "auth.magicLinkLogin",
  ];
  return sensitivePrefixes.some((prefix) => path === prefix || path.startsWith(prefix));
}

export function canReadAdminControls(role: AdminRole): boolean {
  return hasRoleAtLeast(role, "analyst");
}

export function canWriteFeatureFlags(role: AdminRole, path: string): boolean {
  if (!hasRoleAtLeast(role, "admin")) {
    return false;
  }
  if (isSensitiveFlagPath(path)) {
    return role === "owner";
  }
  return true;
}

export function adminRoleMatrix() {
  return [
    {
      role: "owner",
      canAccessAdmin: true,
      canEditContent: true,
      canManageFlags: true,
      canManageSensitiveFlags: true,
      canModerateLeaderboard: true,
    },
    {
      role: "admin",
      canAccessAdmin: true,
      canEditContent: true,
      canManageFlags: true,
      canManageSensitiveFlags: false,
      canModerateLeaderboard: true,
    },
    {
      role: "editor",
      canAccessAdmin: true,
      canEditContent: true,
      canManageFlags: false,
      canManageSensitiveFlags: false,
      canModerateLeaderboard: false,
    },
    {
      role: "analyst",
      canAccessAdmin: true,
      canEditContent: false,
      canManageFlags: false,
      canManageSensitiveFlags: false,
      canModerateLeaderboard: false,
    },
  ] as const;
}
