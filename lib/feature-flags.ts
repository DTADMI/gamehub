import { isSensitiveFlagPath } from "@/lib/admin/roles";

export type FeatureFlags = {
  sdBodEnabled: boolean;
  sdBodBreath: boolean;
  sdBodFuel: boolean;
  sdBodMove: boolean;
  sdBodSignal: boolean;
  sdBodGrow: boolean;
  ui: {
    allowPlayUpcomingLocal: boolean;
    enhancedGameCards: boolean;
    enhancedCarousel: boolean;
    shimmerSkeletons: boolean;
    animatedHero: boolean;
    postGameAuthCTA: boolean;
  };
  auth: {
    leaderboardGuestTeaser: boolean;
    postGameCTAFrequency: "always" | "occasional" | "rare" | "never";
    requireEmailVerification: boolean;
    magicLinkLogin: boolean;
  };
  games: {
    socialShare: boolean;
    chronoShift: boolean;
    elementalConflux: boolean;
    quantumArchitect: boolean;
    blockBlast: boolean;
  };
  experimental: {
    realtimeMultiplayer: boolean;
    threeJsGames: boolean;
  };
};

export type FlagType = "boolean" | "percentage" | "user_list" | "subscription_tier";

export interface FeatureFlag {
  id: string;
  path: string;
  label: string;
  description: string;
  type: FlagType;
  enabled: boolean;
  percentage: number;
  userIds: string[];
  subscriptionTiers: string[];
  sensitive: boolean;
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  sdBodEnabled: true,
  sdBodBreath: true,
  sdBodFuel: true,
  sdBodMove: true,
  sdBodSignal: true,
  sdBodGrow: true,
  ui: {
    allowPlayUpcomingLocal: false,
    enhancedGameCards: true,
    enhancedCarousel: true,
    shimmerSkeletons: true,
    animatedHero: true,
    postGameAuthCTA: true,
  },
  auth: {
    leaderboardGuestTeaser: true,
    postGameCTAFrequency: "occasional",
    requireEmailVerification: false,
    magicLinkLogin: false,
  },
  games: {
    socialShare: false,
    chronoShift: false,
    elementalConflux: false,
    quantumArchitect: false,
    blockBlast: false,
  },
  experimental: {
    realtimeMultiplayer: false,
    threeJsGames: false,
  },
};

export const FLAG_DEFINITIONS: FeatureFlag[] = [
  {
    id: "sdBodEnabled",
    path: "sdBodEnabled",
    label: "Systems Discovery bundle",
    description: "Master switch for Systems Discovery body pack visibility.",
    type: "boolean",
    enabled: true,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: false,
  },
  {
    id: "sdBodBreath",
    path: "sdBodBreath",
    label: "Body Systems: Breath",
    description: "Enable Breath sub-pack content.",
    type: "boolean",
    enabled: true,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: false,
  },
  {
    id: "sdBodFuel",
    path: "sdBodFuel",
    label: "Body Systems: Fuel",
    description: "Enable Fuel sub-pack content.",
    type: "boolean",
    enabled: true,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: false,
  },
  {
    id: "sdBodMove",
    path: "sdBodMove",
    label: "Body Systems: Move",
    description: "Enable Move sub-pack content.",
    type: "boolean",
    enabled: true,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: false,
  },
  {
    id: "sdBodSignal",
    path: "sdBodSignal",
    label: "Body Systems: Signal",
    description: "Enable Signal sub-pack content.",
    type: "boolean",
    enabled: true,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: false,
  },
  {
    id: "sdBodGrow",
    path: "sdBodGrow",
    label: "Body Systems: Grow",
    description: "Enable Grow sub-pack content.",
    type: "boolean",
    enabled: true,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: false,
  },
  {
    id: "ui.allowPlayUpcomingLocal",
    path: "ui.allowPlayUpcomingLocal",
    label: "Allow local play for upcoming games",
    description: "Allows launch of upcoming games in non-production environments.",
    type: "boolean",
    enabled: false,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: true,
  },
  {
    id: "ui.enhancedGameCards",
    path: "ui.enhancedGameCards",
    label: "Enhanced game cards",
    description: "Enable richer card visuals and interactions.",
    type: "boolean",
    enabled: true,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: false,
  },
  {
    id: "ui.enhancedCarousel",
    path: "ui.enhancedCarousel",
    label: "Enhanced carousel",
    description: "Enable advanced carousel controls and interactions.",
    type: "boolean",
    enabled: true,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: false,
  },
  {
    id: "ui.shimmerSkeletons",
    path: "ui.shimmerSkeletons",
    label: "Shimmer loading states",
    description: "Enable shimmer skeleton loading placeholders.",
    type: "boolean",
    enabled: true,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: false,
  },
  {
    id: "ui.animatedHero",
    path: "ui.animatedHero",
    label: "Hero animation",
    description: "Enable homepage hero transition animations.",
    type: "boolean",
    enabled: true,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: false,
  },
  {
    id: "ui.postGameAuthCTA",
    path: "ui.postGameAuthCTA",
    label: "Post-game auth CTA",
    description: "Show sign-in prompt after game completion.",
    type: "boolean",
    enabled: true,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: false,
  },
  {
    id: "auth.leaderboardGuestTeaser",
    path: "auth.leaderboardGuestTeaser",
    label: "Leaderboard guest teaser",
    description: "Show teaser + auth CTA for guests on leaderboard.",
    type: "boolean",
    enabled: true,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: false,
  },
  {
    id: "auth.postGameCTAFrequency",
    path: "auth.postGameCTAFrequency",
    label: "Post-game CTA frequency",
    description: "Controls how often the post-game auth CTA appears.",
    type: "boolean",
    enabled: true,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: false,
  },
  {
    id: "auth.requireEmailVerification",
    path: "auth.requireEmailVerification",
    label: "Require email verification",
    description: "Require verified emails before full feature access.",
    type: "boolean",
    enabled: false,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: true,
  },
  {
    id: "auth.magicLinkLogin",
    path: "auth.magicLinkLogin",
    label: "Magic link login",
    description: "Enable passwordless login option.",
    type: "boolean",
    enabled: false,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: true,
  },
  {
    id: "games.socialShare",
    path: "games.socialShare",
    label: "Social sharing",
    description: "Enable social sharing controls in supported games.",
    type: "boolean",
    enabled: false,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: false,
  },
  {
    id: "games.chronoShift",
    path: "games.chronoShift",
    label: "ChronoShift Labyrinth",
    description: "Enable ChronoShift Labyrinth game access.",
    type: "boolean",
    enabled: false,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: true,
  },
  {
    id: "games.elementalConflux",
    path: "games.elementalConflux",
    label: "Elemental Conflux",
    description: "Enable Elemental Conflux game access.",
    type: "boolean",
    enabled: false,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: true,
  },
  {
    id: "games.quantumArchitect",
    path: "games.quantumArchitect",
    label: "Quantum Architect",
    description: "Enable Quantum Architect game access.",
    type: "boolean",
    enabled: false,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: true,
  },
  {
    id: "games.blockBlast",
    path: "games.blockBlast",
    label: "Block Blast",
    description: "Enable Block Blast game access.",
    type: "boolean",
    enabled: false,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: true,
  },
  {
    id: "experimental.realtimeMultiplayer",
    path: "experimental.realtimeMultiplayer",
    label: "Realtime multiplayer",
    description: "Enable realtime multiplayer experiments.",
    type: "boolean",
    enabled: false,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: true,
  },
  {
    id: "experimental.threeJsGames",
    path: "experimental.threeJsGames",
    label: "3D games mode",
    description: "Enable Three.js game experiments.",
    type: "boolean",
    enabled: false,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: true,
  },
];

export function mergeFeatureFlags(partial?: Partial<FeatureFlags> | null): FeatureFlags {
  const next = partial ?? {};
  return {
    ...DEFAULT_FEATURE_FLAGS,
    ...next,
    ui: {
      ...DEFAULT_FEATURE_FLAGS.ui,
      ...(next.ui ?? {}),
    },
    auth: {
      ...DEFAULT_FEATURE_FLAGS.auth,
      ...(next.auth ?? {}),
    },
    games: {
      ...DEFAULT_FEATURE_FLAGS.games,
      ...(next.games ?? {}),
    },
    experimental: {
      ...DEFAULT_FEATURE_FLAGS.experimental,
      ...(next.experimental ?? {}),
    },
  };
}

export function getByPath<T = unknown>(obj: unknown, path: string): T | undefined {
  const keys = path.split(".");
  let current: any = obj;
  for (const key of keys) {
    if (current == null || typeof current !== "object") {
      return undefined;
    }
    current = current[key];
  }
  return current as T | undefined;
}

export function setByPath(obj: Record<string, any>, path: string, value: unknown) {
  const keys = path.split(".");
  let current: Record<string, any> = obj;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const key = keys[i];
    if (!current[key] || typeof current[key] !== "object") {
      current[key] = {};
    }
    current = current[key] as Record<string, any>;
  }
  current[keys[keys.length - 1]] = value;
}

export function findFlagDefinition(path: string): FeatureFlag | undefined {
  return FLAG_DEFINITIONS.find((def) => def.path === path);
}

export function flattenFlags(flags: FeatureFlags) {
  return FLAG_DEFINITIONS.map((def) => ({
    ...def,
    sensitive: def.sensitive || isSensitiveFlagPath(def.path),
    value: getByPath(flags, def.path),
  }));
}

export function evaluateFlag(
  def: FeatureFlag,
  flags: FeatureFlags,
  userId?: string,
  userTier?: string,
): boolean {
  const runtimeValue = getByPath(flags, def.path);
  const enabled = typeof runtimeValue === "boolean" ? runtimeValue : def.enabled;

  if (!enabled) {
    return false;
  }

  switch (def.type) {
    case "boolean":
      return true;
    case "percentage": {
      const pct =
        typeof runtimeValue === "number" ? runtimeValue : def.percentage;
      return Math.random() * 100 < pct;
    }
    case "user_list": {
      if (!userId) return false;
      const ids =
        Array.isArray(runtimeValue) && runtimeValue.length > 0
          ? (runtimeValue as string[])
          : def.userIds;
      return ids.includes(userId);
    }
    case "subscription_tier": {
      if (!userTier) return false;
      const tiers =
        Array.isArray(runtimeValue) && runtimeValue.length > 0
          ? (runtimeValue as string[])
          : def.subscriptionTiers;
      return tiers.includes(userTier);
    }
    default:
      return false;
  }
}

export function isFeatureEnabled(
  path: string,
  userId?: string,
  userTier?: string,
): boolean {
  const def = findFlagDefinition(path);
  if (!def) return false;

  const flags = DEFAULT_FEATURE_FLAGS;
  return evaluateFlag(def, flags, userId, userTier);
}

export function getAllFeatureFlags(): FeatureFlag[] {
  return [...FLAG_DEFINITIONS];
}

let flagCacheVersion = 0;

export function invalidateFlagCache(): void {
  flagCacheVersion += 1;
}

export function getFlagCacheVersion(): number {
  return flagCacheVersion;
}
