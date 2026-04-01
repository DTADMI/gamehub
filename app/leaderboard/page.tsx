import { Badge, Card, CardContent, CardHeader, CardTitle } from "@gamehub/ui";

type LeaderboardEntry = {
  rank: number;
  player: string;
  score: number;
};

const placeholderEntries: LeaderboardEntry[] = [
  { rank: 1, player: "Player One", score: 12400 },
  { rank: 2, player: "Player Two", score: 11150 },
  { rank: 3, player: "Player Three", score: 9800 },
];

export default function LeaderboardPage() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-10">
      <section className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Leaderboard</h1>
        <p className="text-muted-foreground">
          Global rankings are coming soon. Preview standings are shown for UI testing.
        </p>
      </section>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Top Players</CardTitle>
          <Badge variant="secondary">Preview</Badge>
        </CardHeader>
        <CardContent className="space-y-2">
          {placeholderEntries.map((entry) => (
            <div key={entry.rank} className="bg-muted/40 flex items-center justify-between rounded-md p-3">
              <div className="flex items-center gap-3">
                <Badge>{entry.rank}</Badge>
                <span className="font-medium">{entry.player}</span>
              </div>
              <span className="text-muted-foreground text-sm">{entry.score.toLocaleString()} pts</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
