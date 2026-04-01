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
  };
  experimental: {
    realtimeMultiplayer: boolean;
    threeJsGames: boolean;
  };
};

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
  },
  experimental: {
    realtimeMultiplayer: false,
    threeJsGames: false,
  },
};

export type FlagDefinition = {
  path: string;
  label: string;
  description: string;
  type: "boolean" | "string";
  sensitive: boolean;
};

export const FLAG_DEFINITIONS: FlagDefinition[] = [
  {
    path: "sdBodEnabled",
    label: "Systems Discovery bundle",
    description: "Master switch for Systems Discovery body pack visibility.",
    type: "boolean",
    sensitive: false,
  },
  {
    path: "sdBodBreath",
    label: "Body Systems: Breath",
    description: "Enable Breath sub-pack content.",
    type: "boolean",
    sensitive: false,
  },
  {
    path: "sdBodFuel",
    label: "Body Systems: Fuel",
    description: "Enable Fuel sub-pack content.",
    type: "boolean",
    sensitive: false,
  },
  {
    path: "sdBodMove",
    label: "Body Systems: Move",
    description: "Enable Move sub-pack content.",
    type: "boolean",
    sensitive: false,
  },
  {
    path: "sdBodSignal",
    label: "Body Systems: Signal",
    description: "Enable Signal sub-pack content.",
    type: "boolean",
    sensitive: false,
  },
  {
    path: "sdBodGrow",
    label: "Body Systems: Grow",
    description: "Enable Grow sub-pack content.",
    type: "boolean",
    sensitive: false,
  },
  {
    path: "ui.allowPlayUpcomingLocal",
    label: "Allow local play for upcoming games",
    description: "Allows launch of upcoming games in non-production environments.",
    type: "boolean",
    sensitive: true,
  },
  {
    path: "ui.enhancedGameCards",
    label: "Enhanced game cards",
    description: "Enable richer card visuals and interactions.",
    type: "boolean",
    sensitive: false,
  },
  {
    path: "ui.enhancedCarousel",
    label: "Enhanced carousel",
    description: "Enable advanced carousel controls and interactions.",
    type: "boolean",
    sensitive: false,
  },
  {
    path: "ui.shimmerSkeletons",
    label: "Shimmer loading states",
    description: "Enable shimmer skeleton loading placeholders.",
    type: "boolean",
    sensitive: false,
  },
  {
    path: "ui.animatedHero",
    label: "Hero animation",
    description: "Enable homepage hero transition animations.",
    type: "boolean",
    sensitive: false,
  },
  {
    path: "auth.leaderboardGuestTeaser",
    label: "Leaderboard guest teaser",
    description: "Show teaser + auth CTA for guests on leaderboard.",
    type: "boolean",
    sensitive: false,
  },
  {
    path: "auth.postGameCTAFrequency",
    label: "Post-game CTA frequency",
    description: "Controls how often the post-game auth CTA appears.",
    type: "string",
    sensitive: false,
  },
  {
    path: "auth.requireEmailVerification",
    label: "Require email verification",
    description: "Require verified emails before full feature access.",
    type: "boolean",
    sensitive: true,
  },
  {
    path: "auth.magicLinkLogin",
    label: "Magic link login",
    description: "Enable passwordless login option.",
    type: "boolean",
    sensitive: true,
  },
  {
    path: "games.socialShare",
    label: "Social sharing",
    description: "Enable social sharing controls in supported games.",
    type: "boolean",
    sensitive: false,
  },
  {
    path: "experimental.realtimeMultiplayer",
    label: "Realtime multiplayer",
    description: "Enable realtime multiplayer experiments.",
    type: "boolean",
    sensitive: true,
  },
  {
    path: "experimental.threeJsGames",
    label: "3D games mode",
    description: "Enable Three.js game experiments.",
    type: "boolean",
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

export function flattenFlags(flags: FeatureFlags) {
  return FLAG_DEFINITIONS.map((def) => ({
    ...def,
    sensitive: def.sensitive || isSensitiveFlagPath(def.path),
    value: getByPath(flags, def.path),
  }));
}
