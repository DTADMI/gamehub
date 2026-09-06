import { isSensitiveFlagPath } from "@/lib/admin/roles";

export type FeatureFlags = {
  sdBodEnabled: boolean;
  sdBodBreath: boolean;
  sdBodFuel: boolean;
  sdBodMove: boolean;
  sdBodSignal: boolean;
  sdBodGrow: boolean;
  sdSpaceSatellite: boolean;
  sdSpaceDeepSpace: boolean;
  sdOceanEnabled: boolean;
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
    dungeonDelver: boolean;
    snake: boolean;
    breakout: boolean;
    tetris: boolean;
    platformer: boolean;
    bubblePop: boolean;
    checkers: boolean;
    chess: boolean;
    knitzy: boolean;
    memory: boolean;
    patternMatching: boolean;
    blockBlast: boolean;
    towerDefense: boolean;
    elementalConflux: boolean;
    chronoShift: boolean;
    quantumArchitect: boolean;
    spellCraft: boolean;
    glyphWeaver: boolean;
    systemsDiscovery: boolean;
    toymakerEscape: boolean;
    riteOfDiscovery: boolean;
    escapeRoom: boolean;
    mysteryManor: boolean;
    artifactHunter: boolean;
    clockworkConspiracy: boolean;
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
  sdSpaceSatellite: true,
  sdSpaceDeepSpace: true,
  sdOceanEnabled: true,
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
    dungeonDelver: true,
    snake: true,
    breakout: true,
    tetris: true,
    platformer: true,
    bubblePop: true,
    checkers: true,
    chess: true,
    knitzy: true,
    memory: true,
    patternMatching: true,
    blockBlast: true,
    towerDefense: true,
    elementalConflux: true,
    chronoShift: true,
    quantumArchitect: true,
    spellCraft: true,
    glyphWeaver: true,
    systemsDiscovery: true,
    toymakerEscape: true,
    riteOfDiscovery: true,
    escapeRoom: true,
    mysteryManor: true,
    artifactHunter: true,
    clockworkConspiracy: true,
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
    id: "sdSpaceSatellite",
    path: "sdSpaceSatellite",
    label: "Systems Discovery: Space Satellite Systems",
    description: "Enable Satellite Systems sub-pack content in Space pack.",
    type: "boolean",
    enabled: true,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: false,
  },
  {
    id: "sdSpaceDeepSpace",
    path: "sdSpaceDeepSpace",
    label: "Systems Discovery: Space Deep Space",
    description: "Enable Deep Space sub-pack content in Space pack.",
    type: "boolean",
    enabled: true,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: false,
  },
  {
    id: "sdOceanEnabled",
    path: "sdOceanEnabled",
    label: "Systems Discovery: Ocean Pack",
    description: "Enable Ocean pack (marine biology, currents, ecosystems).",
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
    id: "games.dungeonDelver",
    path: "games.dungeonDelver",
    label: "Dungeon Delver",
    description: "Enable the Dungeon Delver roguelike dungeon crawler game.",
    type: "boolean",
    enabled: true,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: false,
  },
  {
    id: "games.snake",
    path: "games.snake",
    label: "Snake",
    description: "Enable the classic Snake arcade game.",
    type: "boolean",
    enabled: true,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: false,
  },
  {
    id: "games.breakout",
    path: "games.breakout",
    label: "Breakout",
    description: "Enable the Breakout brick-breaking arcade game.",
    type: "boolean",
    enabled: true,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: false,
  },
  {
    id: "games.tetris",
    path: "games.tetris",
    label: "Tetris",
    description: "Enable the Tetris block-stacking arcade game.",
    type: "boolean",
    enabled: true,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: false,
  },
  {
    id: "games.platformer",
    path: "games.platformer",
    label: "Platformer",
    description: "Enable the Platformer side-scrolling arcade game.",
    type: "boolean",
    enabled: true,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: false,
  },
  {
    id: "games.bubblePop",
    path: "games.bubblePop",
    label: "Bubble Pop",
    description: "Enable the Bubble Pop arcade game.",
    type: "boolean",
    enabled: true,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: false,
  },
  {
    id: "games.checkers",
    path: "games.checkers",
    label: "Checkers",
    description: "Enable the Checkers board game.",
    type: "boolean",
    enabled: true,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: false,
  },
  {
    id: "games.chess",
    path: "games.chess",
    label: "Chess",
    description: "Enable the Chess board game.",
    type: "boolean",
    enabled: true,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: false,
  },
  {
    id: "games.knitzy",
    path: "games.knitzy",
    label: "Knitzy",
    description: "Enable the Knitzy puzzle game.",
    type: "boolean",
    enabled: true,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: false,
  },
  {
    id: "games.memory",
    path: "games.memory",
    label: "Memory",
    description: "Enable the Memory card-matching casual game.",
    type: "boolean",
    enabled: true,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: false,
  },
  {
    id: "games.patternMatching",
    path: "games.patternMatching",
    label: "Pattern Matching",
    description: "Enable the Pattern Matching puzzle game.",
    type: "boolean",
    enabled: true,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: false,
  },
  {
    id: "games.blockBlast",
    path: "games.blockBlast",
    label: "Block Blast",
    description: "Enable the Block Blast puzzle game.",
    type: "boolean",
    enabled: true,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: false,
  },
  {
    id: "games.towerDefense",
    path: "games.towerDefense",
    label: "Tower Defense",
    description: "Enable the Tower Defense strategy game.",
    type: "boolean",
    enabled: true,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: false,
  },
  {
    id: "games.elementalConflux",
    path: "games.elementalConflux",
    label: "Elemental Conflux",
    description: "Enable the Elemental Conflux puzzle game.",
    type: "boolean",
    enabled: true,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: false,
  },
  {
    id: "games.chronoShift",
    path: "games.chronoShift",
    label: "Chrono Shift",
    description: "Enable the Chrono Shift puzzle game.",
    type: "boolean",
    enabled: true,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: false,
  },
  {
    id: "games.quantumArchitect",
    path: "games.quantumArchitect",
    label: "Quantum Architect",
    description: "Enable the Quantum Architect 3D puzzle game.",
    type: "boolean",
    enabled: true,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: false,
  },
  {
    id: "games.spellCraft",
    path: "games.spellCraft",
    label: "Spell Craft",
    description: "Enable the Spell Craft puzzle game.",
    type: "boolean",
    enabled: true,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: false,
  },
  {
    id: "games.glyphWeaver",
    path: "games.glyphWeaver",
    label: "Glyph Weaver",
    description: "Enable the Glyph Weaver creative WebGL game.",
    type: "boolean",
    enabled: true,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: false,
  },
  {
    id: "games.systemsDiscovery",
    path: "games.systemsDiscovery",
    label: "Systems Discovery",
    description: "Enable the Systems Discovery point-and-click educational game.",
    type: "boolean",
    enabled: true,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: false,
  },
  {
    id: "games.toymakerEscape",
    path: "games.toymakerEscape",
    label: "Toymaker Escape",
    description: "Enable the Toymaker Escape point-and-click puzzle game.",
    type: "boolean",
    enabled: true,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: false,
  },
  {
    id: "games.riteOfDiscovery",
    path: "games.riteOfDiscovery",
    label: "Rite of Discovery",
    description: "Enable the Rite of Discovery point-and-click game.",
    type: "boolean",
    enabled: true,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: false,
  },
  {
    id: "games.escapeRoom",
    path: "games.escapeRoom",
    label: "Escape Room",
    description: "Enable the Escape Room point-and-click puzzle game.",
    type: "boolean",
    enabled: true,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: false,
  },
  {
    id: "games.mysteryManor",
    path: "games.mysteryManor",
    label: "Mystery Manor",
    description: "Enable the Mystery Manor point-and-click murder mystery game.",
    type: "boolean",
    enabled: true,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: false,
  },
  {
    id: "games.artifactHunter",
    path: "games.artifactHunter",
    label: "Artifact Hunter",
    description: "Enable the Artifact Hunter point-and-click adventure game.",
    type: "boolean",
    enabled: true,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: false,
  },
  {
    id: "games.clockworkConspiracy",
    path: "games.clockworkConspiracy",
    label: "Clockwork Conspiracy",
    description: "Enable the Clockwork Conspiracy point-and-click puzzle game.",
    type: "boolean",
    enabled: true,
    percentage: 0,
    userIds: [],
    subscriptionTiers: [],
    sensitive: false,
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
      if (!userId) {return false;}
      const ids =
        Array.isArray(runtimeValue) && runtimeValue.length > 0
          ? (runtimeValue as string[])
          : def.userIds;
      return ids.includes(userId);
    }
    case "subscription_tier": {
      if (!userTier) {return false;}
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
  if (!def) {return false;}

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
