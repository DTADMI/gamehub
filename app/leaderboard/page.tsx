"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LeaderboardPage() {
  return (
    <div className="px-6 py-8 md:px-8">
      <h1 className="mb-4 text-3xl font-bold">Leaderboard</h1>
      <div className="bg-muted/30 flex min-h-[40vh] flex-col items-center justify-center rounded-lg border">
        <p className="text-muted-foreground mb-2 text-lg">Leaderboard Coming Soon</p>
        <p className="text-muted-foreground mb-4 max-w-md text-center text-sm">
          The leaderboard requires a backend API connection. Connect a backend service to see
          player scores and rankings across all games.
        </p>
        <Button asChild variant="outline">
          <Link href="/games">Play Games</Link>
        </Button>
      </div>
    </div>
  );
}
