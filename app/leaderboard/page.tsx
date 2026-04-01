"use client";

import { useAuth } from "@gamehub/game-platform";
import { useFlags } from "@gamehub/game-platform/contexts/FlagsContext";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@gamehub/ui";
import { Crown, LogIn, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const GAME_OPTIONS = [
  "SNAKE",
  "BREAKOUT",
  "TETRIS",
  "BUBBLE_POP",
  "MEMORY",
  "CHESS",
  "CHECKERS",
] as const;

type Entry = {
  rank: number;
  score: number;
  submittedAt: string;
  user: {
    id: string;
    username: string;
  };
};

type LeaderboardResponse = {
  gameType: string;
  season: {
    id: string;
    name: string;
    slug: string;
  } | null;
  entries: Entry[];
};

function rankVariant(rank: number): "default" | "secondary" | "outline" {
  if (rank === 1) {
    return "default";
  }
  if (rank === 2) {
    return "secondary";
  }
  return "outline";
}

function GuestTeaser() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-10">
      <div className="relative overflow-hidden rounded-xl">
        <div className="pointer-events-none blur-sm select-none" aria-hidden>
          <Card>
            <CardHeader>
              <CardTitle>Top Players</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[1, 2, 3].map((rank) => (
                <div key={rank} className="bg-muted/40 flex items-center justify-between rounded-md p-3">
                  <div className="flex items-center gap-3">
                    <Badge variant={rankVariant(rank)}>{rank}</Badge>
                    <span className="font-medium">Player {rank}</span>
                  </div>
                  <span className="text-muted-foreground text-sm">
                    {(10_000 - rank * 250).toLocaleString()} pts
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="bg-background/85 absolute inset-0 flex items-center justify-center backdrop-blur-sm">
          <Card className="mx-4 w-full max-w-md animate-fade-in-scale">
            <CardHeader className="text-center">
              <div className="mb-3 flex justify-center">
                <div className="bg-primary/10 rounded-full p-3">
                  <Trophy className="text-primary h-8 w-8" />
                </div>
              </div>
              <CardTitle>Unlock Leaderboards</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-center text-sm">
                Sign in to save scores, track seasonal rankings, and compete globally.
              </p>
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/auth?redirect=/leaderboard">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign in
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/auth?redirect=/leaderboard">Create account</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const { user, isLoading } = useAuth();
  const { flags } = useFlags();
  const [gameType, setGameType] = useState<(typeof GAME_OPTIONS)[number]>("SNAKE");
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loadingBoard, setLoadingBoard] = useState(false);
  const [boardError, setBoardError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!user) {
        setData(null);
        return;
      }

      setLoadingBoard(true);
      setBoardError(null);
      try {
        const response = await fetch(`/api/leaderboard?gameType=${gameType}&limit=25`, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`Failed to load leaderboard (${response.status})`);
        }
        const payload = (await response.json()) as LeaderboardResponse;
        if (!cancelled) {
          setData(payload);
        }
      } catch (err) {
        if (!cancelled) {
          setBoardError(err instanceof Error ? err.message : "Failed to load leaderboard");
        }
      } finally {
        if (!cancelled) {
          setLoadingBoard(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [gameType, user]);

  const me = useMemo(
    () => data?.entries.find((entry) => entry.user.id === user?.id) ?? null,
    [data?.entries, user?.id],
  );

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 px-4 py-10">
        <div className="animate-pulse space-y-3">
          <div className="bg-muted h-12 w-1/3 rounded" />
          <div className="bg-muted h-64 rounded" />
        </div>
      </div>
    );
  }

  if (!user && flags.auth.leaderboardGuestTeaser) {
    return <GuestTeaser />;
  }

  if (!user) {
    return (
      <div className="container mx-auto space-y-6 px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Sign in to unlock leaderboards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Leaderboards are available to signed-in users only.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/auth?redirect=/leaderboard">Sign in</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/auth?redirect=/leaderboard">Create account</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-10">
      <section className="animate-fade-in-up space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Leaderboard</h1>
        <p className="text-muted-foreground">
          Seasonal ranking backed by server scores and anti-spam validation.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={gameType}
            onValueChange={(nextValue) => setGameType(nextValue as (typeof GAME_OPTIONS)[number])}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Select game" />
            </SelectTrigger>
            <SelectContent>
              {GAME_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {data?.season ? <Badge variant="secondary">{data.season.name}</Badge> : null}
        </div>
      </section>

      <Card className="animate-fade-in-up animation-delay-100">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Top Players</CardTitle>
          <Badge variant="secondary">{gameType}</Badge>
        </CardHeader>
        <CardContent className="space-y-2">
          {loadingBoard ? (
            <p className="text-muted-foreground text-sm">Loading leaderboard...</p>
          ) : null}
          {boardError ? <p className="text-destructive text-sm">{boardError}</p> : null}
          {!loadingBoard && !boardError && (data?.entries.length ?? 0) === 0 ? (
            <p className="text-muted-foreground text-sm">No scores yet. Be the first to submit.</p>
          ) : null}

          {(data?.entries ?? []).map((entry) => (
            <div
              key={`${entry.user.id}-${entry.rank}`}
              className="bg-muted/40 flex items-center justify-between rounded-md p-3"
            >
              <div className="flex items-center gap-3">
                <Badge variant={rankVariant(entry.rank)} className="min-w-[3rem] justify-center gap-1">
                  {entry.rank <= 3 ? <Crown className="h-3.5 w-3.5" /> : null}
                  {entry.rank}
                </Badge>
                <span className="font-medium">{entry.user.username}</span>
                {entry.user.id === user.id ? <Badge variant="outline">You</Badge> : null}
              </div>
              <span className="text-muted-foreground text-sm tabular-nums">
                {entry.score.toLocaleString()} pts
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {me ? (
        <Card>
          <CardHeader>
            <CardTitle>Your Position</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            Rank <span className="font-semibold">#{me.rank}</span> with{" "}
            <span className="font-semibold">{me.score.toLocaleString()}</span> points.
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
