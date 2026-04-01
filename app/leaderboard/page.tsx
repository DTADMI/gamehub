"use client";

import { useAuth, useFeature, AUTH_FLAGS } from "@gamehub/game-platform";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@gamehub/ui";
import Link from "next/link";
import { Trophy, Star, TrendingUp, Lock, Users } from "lucide-react";

type LeaderboardEntry = {
  rank: number;
  player: string;
  score: number;
  game?: string;
};

const placeholderEntries: LeaderboardEntry[] = [
  { rank: 1, player: "Player One", score: 12400, game: "Snake" },
  { rank: 2, player: "Player Two", score: 11150, game: "Tetris" },
  { rank: 3, player: "Player Three", score: 9800, game: "Memory" },
  { rank: 4, player: "Hidden Player", score: 8500, game: "Snake" },
  { rank: 5, player: "Hidden Player", score: 7200, game: "Tetris" },
];

const benefits = [
  {
    icon: Trophy,
    title: "Track Your Scores",
    description: "See your personal bests and progress over time",
  },
  {
    icon: Users,
    title: "Compete Globally",
    description: "Challenge players from around the world",
  },
  {
    icon: Star,
    title: "Earn Achievements",
    description: "Unlock badges and rewards as you play",
  },
  {
    icon: TrendingUp,
    title: "Climb the Ranks",
    description: "Rise through the leaderboard tiers",
  },
];

export default function LeaderboardPage() {
  const { user, isLoading, isGuest } = useAuth();
  const leaderboardGuestBlock = useFeature(AUTH_FLAGS.LEADERBOARD_GUEST_BLOCK);

  // Show guest-block if user is not authenticated or is a guest
  if (leaderboardGuestBlock && (!user || isGuest)) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="relative overflow-hidden rounded-2xl">
          {/* Blurred leaderboard preview background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="p-6 blur-sm opacity-50 pointer-events-none" aria-hidden="true">
              <div className="space-y-3">
                {placeholderEntries.map((entry) => (
                  <div 
                    key={entry.rank} 
                    className="bg-muted/40 flex items-center justify-between rounded-md p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm ${
                        entry.rank === 1 ? "bg-yellow-500/20 text-yellow-600" :
                        entry.rank === 2 ? "bg-gray-300/20 text-gray-500" :
                        entry.rank === 3 ? "bg-orange-500/20 text-orange-600" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {entry.rank}
                      </div>
                      <span className="font-medium">{entry.player}</span>
                    </div>
                    <span className="text-muted-foreground">{entry.score.toLocaleString()} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Overlay card */}
          <div className="relative z-10 flex min-h-[500px] items-center justify-center p-6">
            <Card className="w-full max-w-lg animate-scale-in border-primary/20 bg-card/95 backdrop-blur-sm shadow-2xl">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Lock className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Unlock Leaderboards</CardTitle>
                <p className="text-muted-foreground text-sm mt-2">
                  Sign in to see global rankings and compete with players worldwide
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Benefits grid */}
                <div className="grid grid-cols-2 gap-3">
                  {benefits.map((benefit) => (
                    <div 
                      key={benefit.title}
                      className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <benefit.icon className="h-5 w-5 text-primary mb-2" />
                      <span className="text-xs font-medium">{benefit.title}</span>
                    </div>
                  ))}
                </div>

                {/* CTA buttons */}
                <div className="space-y-3">
                  <Button asChild className="w-full" size="lg">
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full" size="lg">
                    <Link href="/auth/register">Create Free Account</Link>
                  </Button>
                </div>

                {/* Loading indicator */}
                {isLoading && (
                  <p className="text-xs text-center text-muted-foreground animate-pulse">
                    Checking session...
                  </p>
                )}

                {/* Play as guest hint */}
                <p className="text-xs text-center text-muted-foreground">
                  Want to play first?{" "}
                  <Link href="/games" className="text-primary hover:underline">
                    Browse games
                  </Link>{" "}
                  and sign in later to save your scores.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main id="main-content" className="container mx-auto space-y-8 px-4 py-10">
      {/* Header Section */}
      <section className="space-y-2 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Leaderboard</h1>
            <p className="text-muted-foreground">
              Global rankings across all games
            </p>
          </div>
        </div>
      </section>

      {/* User Stats Card */}
      {user && (
        <Card className="animate-fade-in-up stagger-1 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                {user.username?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <p className="font-medium">{user.username || "Player"}</p>
                <p className="text-sm text-muted-foreground">Your Ranking</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">#--</p>
                <p className="text-xs text-muted-foreground">Global Rank</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">--</p>
                <p className="text-xs text-muted-foreground">Total Score</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">--</p>
                <p className="text-xs text-muted-foreground">Games Played</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Table */}
      <Card className="animate-fade-in-up stagger-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            Top Players
          </CardTitle>
          <Badge variant="secondary">Preview Data</Badge>
        </CardHeader>
        <CardContent className="space-y-2">
          {placeholderEntries.slice(0, 3).map((entry) => (
            <div 
              key={entry.rank} 
              className={`flex items-center justify-between rounded-lg p-4 transition-colors hover:bg-muted/60 ${
                entry.rank === 1 ? "bg-yellow-500/5 border border-yellow-500/20" :
                entry.rank === 2 ? "bg-gray-400/5 border border-gray-400/20" :
                entry.rank === 3 ? "bg-orange-500/5 border border-orange-500/20" :
                "bg-muted/40"
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Rank badge with medal colors */}
                <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${
                  entry.rank === 1 ? "bg-yellow-500/20 text-yellow-600" :
                  entry.rank === 2 ? "bg-gray-300/30 text-gray-500" :
                  entry.rank === 3 ? "bg-orange-500/20 text-orange-600" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {entry.rank === 1 && <Trophy className="h-5 w-5" />}
                  {entry.rank !== 1 && entry.rank}
                </div>
                <div>
                  <span className="font-medium">{entry.player}</span>
                  {entry.game && (
                    <p className="text-xs text-muted-foreground">Top game: {entry.game}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="font-semibold text-lg">{entry.score.toLocaleString()}</span>
                <p className="text-xs text-muted-foreground">points</p>
              </div>
            </div>
          ))}

          {/* More players hint */}
          <div className="pt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Full leaderboard with real-time rankings coming soon!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Game-specific leaderboards teaser */}
      <section className="animate-fade-in-up stagger-3">
        <h2 className="text-xl font-semibold mb-4">Game Leaderboards</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {["Snake", "Tetris", "Memory"].map((game) => (
            <Card key={game} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">{game}</p>
                  <p className="text-sm text-muted-foreground">View rankings</p>
                </div>
                <Badge variant="outline">Coming Soon</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
