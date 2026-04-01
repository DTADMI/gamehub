export type LeaderboardUser = {
  id: string;
  username: string;
  email?: string | null;
  avatar?: string | null;
};

export type GameType =
  | "SNAKE"
  | "BUBBLE_POP"
  | "TETRIS"
  | "BREAKOUT"
  | "KNITZY"
  | "MEMORY"
  | "CHECKERS"
  | "CHESS"
  | "PLATFORMER"
  | "TOWER_DEFENSE";

export type LeaderboardScope = "PERSONAL" | "FRIENDS" | "GLOBAL";
export type TimeWindow = "ALL_TIME" | "YEAR" | "MONTH" | "WEEK" | "DAY";

export type LeaderboardEntry = {
  rank: number;
  user: LeaderboardUser;
  score: number;
  gameType: GameType;
};

type LeaderboardApiResponse = {
  gameType: GameType;
  entries: Array<{
    rank: number;
    score: number;
    user: { id: string; username: string };
  }>;
};

function getApiBase(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL;
  if (!configured) {
    return "";
  }
  return configured.replace(/\/api\/?$/, "");
}

function endpoint(path: string) {
  const base = getApiBase();
  return base ? `${base}${path}` : path;
}

export async function fetchLeaderboard(params: {
  gameType: GameType;
  limit?: number;
}): Promise<{ leaderboard: LeaderboardEntry[] }> {
  const data = await fetchLeaderboardPaged({
    gameType: params.gameType,
    first: params.limit ?? 25,
  });
  return { leaderboard: data.leaderboard.edges.map((e) => e.node) };
}

export async function fetchLeaderboardPaged(params: {
  gameType: GameType;
  scope?: LeaderboardScope;
  window?: TimeWindow;
  first?: number;
  after?: string | null;
}): Promise<{
  leaderboard: {
    edges: { cursor: string; node: LeaderboardEntry }[];
    pageInfo: { hasNextPage: boolean; endCursor?: string | null };
  };
}> {
  const search = new URLSearchParams({
    gameType: params.gameType,
    limit: String(params.first ?? 25),
  });
  const response = await fetch(endpoint(`/api/leaderboard?${search.toString()}`), {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error(`Leaderboard fetch failed (${response.status})`);
  }
  const payload = (await response.json()) as LeaderboardApiResponse;
  const edges = payload.entries.map((entry, index) => ({
    cursor: `${entry.rank}:${index}`,
    node: {
      rank: entry.rank,
      score: entry.score,
      gameType: payload.gameType,
      user: entry.user,
    },
  }));
  return {
    leaderboard: {
      edges,
      pageInfo: { hasNextPage: false, endCursor: edges.at(-1)?.cursor ?? null },
    },
  };
}

export type SubmitScoreResult = {
  submitScore: {
    id: string;
    score: number;
    createdAt: string;
    gameType: GameType;
    user: LeaderboardUser;
  };
};

export async function submitScore(params: {
  gameType: GameType;
  score: number;
  metadata?: Record<string, unknown>;
}): Promise<SubmitScoreResult> {
  const response = await fetch(endpoint("/api/leaderboard/submit"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    const details = await response.text();
    throw new Error(`submitScore failed (${response.status}): ${details}`);
  }
  const payload = (await response.json()) as {
    id: string;
    score: number;
    createdAt: string;
    gameType: GameType;
  };
  return {
    submitScore: {
      ...payload,
      user: {
        id: "self",
        username: "You",
      },
    },
  };
}

export type Plan = "FREE" | "PRO";

export type CreateCheckoutInput = {
  plan: Plan;
  returnUrl: string;
  cancelUrl: string;
};

export type CreateCheckoutResult = {
  createCheckout: {
    id: string;
    url: string;
  };
};

export async function createCheckout(_input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
  throw new Error("Checkout integration is not configured in this app.");
}

export type PremiumFeatures = {
  advancedLeaderboards: boolean;
  cosmetics: boolean;
  earlyAccess: boolean;
};

export type Subscription = {
  id: string;
  userId: string;
  plan: Plan;
  status: string;
  currentPeriodEnd: string;
} | null;

export type Viewer = {
  id: string;
  username: string;
  avatar?: string | null;
  subscription: Subscription;
  premium: PremiumFeatures;
} | null;

export async function fetchViewer(): Promise<{ viewer: Viewer }> {
  return { viewer: null };
}
