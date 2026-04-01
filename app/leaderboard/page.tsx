"use client";

import { useAuth } from "@gamehub/game-platform";
import { useFlags } from "@gamehub/game-platform/contexts/FlagsContext";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@gamehub/ui";
import { Crown, LogIn, Trophy } from "lucide-react";
import Link from "next/link";

type LeaderboardEntry = {
  rank: number;
  player: string;
  score: number;
  trend?: "up" | "down" | "same";
};

const previewEntries: LeaderboardEntry[] = [
  { rank: 1, player: "Player One", score: 12400, trend: "same" },
  { rank: 2, player: "Player Two", score: 11150, trend: "up" },
  { rank: 3, player: "Player Three", score: 9800, trend: "down" },
  { rank: 4, player: "Player Four", score: 8750, trend: "up" },
  { rank: 5, player: "Player Five", score: 8200, trend: "same" },
];

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
              {previewEntries.slice(0, 3).map((entry) => (
                <div key={entry.rank} className="bg-muted/40 flex items-center justify-between rounded-md p-3">
                  <div className="flex items-center gap-3">
                    <Badge variant={rankVariant(entry.rank)}>{entry.rank}</Badge>
                    <span className="font-medium">{entry.player}</span>
                  </div>
                  <span className="text-muted-foreground text-sm">{entry.score.toLocaleString()} pts</span>
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
                Sign in to save scores, track progress, and compete in ranking ladders.
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
              Leaderboards are available to signed-in users only. Create an account to track scores
              and progression.
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
          Global rankings are in preview for signed-in users while backend ingestion is finalized.
        </p>
      </section>
      <Card className="animate-fade-in-up animation-delay-100">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Top Players</CardTitle>
          <Badge variant="secondary">Preview</Badge>
        </CardHeader>
        <CardContent className="space-y-2">
          {previewEntries.map((entry) => (
            <div key={entry.rank} className="bg-muted/40 flex items-center justify-between rounded-md p-3">
              <div className="flex items-center gap-3">
                <Badge variant={rankVariant(entry.rank)} className="min-w-[3rem] justify-center gap-1">
                  {entry.rank <= 3 ? <Crown className="h-3.5 w-3.5" /> : null}
                  {entry.rank}
                </Badge>
                <span className="font-medium">{entry.player}</span>
                {entry.trend === "up" ? <span className="text-xs text-emerald-600">up</span> : null}
                {entry.trend === "down" ? <span className="text-xs text-amber-600">down</span> : null}
              </div>
              <span className="text-muted-foreground text-sm">{entry.score.toLocaleString()} pts</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
