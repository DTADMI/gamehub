"use client";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@gamehub/ui";
import { useCallback, useEffect, useMemo, useState } from "react";

type SeasonRow = {
  id: string;
  slug: string;
  name: string;
  is_active: boolean;
  is_locked: boolean;
  starts_at: string;
  ends_at: string | null;
};

type ScoreStatus = "valid" | "flagged" | "removed";

type ScoreRow = {
  id: string;
  user_id: string;
  player_name: string;
  game_type: string;
  score: number;
  status: ScoreStatus;
  created_at: string;
  season_id: string | null;
  moderated_at: string | null;
  moderation_reason: string | null;
  moderation_note: string | null;
};

export function LeaderboardModerationAdmin() {
  const [seasons, setSeasons] = useState<SeasonRow[]>([]);
  const [scores, setScores] = useState<ScoreRow[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | ScoreStatus>("all");
  const [gameFilter, setGameFilter] = useState<string>("all");
  const [seasonFilter, setSeasonFilter] = useState<string>("all");
  const [reasonByScore, setReasonByScore] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingScoreId, setSavingScoreId] = useState<string | null>(null);

  const e2eHeaders = useMemo(() => {
    if (typeof window === "undefined") {
      return undefined;
    }
    const params = new URLSearchParams(window.location.search);
    return params.get("e2e_admin") === "1" ? ({ "x-e2e-admin": "1" } as const) : undefined;
  }, []);

  const loadSeasons = useCallback(async () => {
    const response = await fetch("/api/admin/leaderboard/seasons", {
      cache: "no-store",
      headers: e2eHeaders,
    });
    if (!response.ok) {
      throw new Error(`Failed to load seasons (${response.status})`);
    }
    const payload = (await response.json()) as { seasons?: SeasonRow[] };
    setSeasons(payload.seasons ?? []);
  }, [e2eHeaders]);

  const loadScores = useCallback(async () => {
    const params = new URLSearchParams();
    params.set("limit", "80");
    if (statusFilter !== "all") {
      params.set("status", statusFilter);
    }
    if (gameFilter !== "all") {
      params.set("gameType", gameFilter);
    }
    if (seasonFilter !== "all") {
      params.set("seasonSlug", seasonFilter);
    }

    const response = await fetch(`/api/admin/leaderboard/scores?${params.toString()}`, {
      cache: "no-store",
      headers: e2eHeaders,
    });
    if (!response.ok) {
      throw new Error(`Failed to load scores (${response.status})`);
    }
    const payload = (await response.json()) as { scores?: ScoreRow[] };
    setScores(payload.scores ?? []);
  }, [e2eHeaders, gameFilter, seasonFilter, statusFilter]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([loadSeasons(), loadScores()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load moderation data");
    } finally {
      setLoading(false);
    }
  }, [loadScores, loadSeasons]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const updateSeasonLock = async (seasonId: string, isLocked: boolean) => {
    setError(null);
    const response = await fetch("/api/admin/leaderboard/seasons", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(e2eHeaders ?? {}),
      },
      body: JSON.stringify({ seasonId, isLocked }),
    });
    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? "Failed to update season lock");
    }
    await loadSeasons();
  };

  const activateSeason = async (seasonId: string) => {
    setError(null);
    const response = await fetch("/api/admin/leaderboard/seasons", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(e2eHeaders ?? {}),
      },
      body: JSON.stringify({ seasonId, activate: true }),
    });
    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? "Failed to activate season");
    }
    await loadAll();
  };

  const moderateScore = async (scoreId: string, status: ScoreStatus) => {
    setSavingScoreId(scoreId);
    setError(null);
    try {
      const response = await fetch("/api/admin/leaderboard/scores", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(e2eHeaders ?? {}),
        },
        body: JSON.stringify({
          scoreId,
          status,
          reason: reasonByScore[scoreId] ?? "",
        }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error ?? "Failed moderation update");
      }
      await loadScores();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed moderation update");
    } finally {
      setSavingScoreId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold">Leaderboard Moderation</h1>
        <p className="text-muted-foreground max-w-3xl text-sm">
          Moderate suspicious scores, lock seasons, and control active competition windows.
        </p>
      </section>

      {error ? (
        <Card className="border-destructive/40">
          <CardContent className="text-destructive py-4 text-sm">{error}</CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Seasons</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading seasons...</p>
          ) : (
            seasons.map((season) => (
              <div key={season.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
                <div className="space-y-1">
                  <p className="font-medium">{season.name}</p>
                  <p className="text-muted-foreground text-xs">{season.slug}</p>
                  <div className="flex items-center gap-2">
                    {season.is_active ? <Badge>Active</Badge> : <Badge variant="outline">Inactive</Badge>}
                    {season.is_locked ? (
                      <Badge variant="destructive">Locked</Badge>
                    ) : (
                      <Badge variant="secondary">Open</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`lock-${season.id}`} className="text-xs">
                      Lock submissions
                    </Label>
                    <Switch
                      id={`lock-${season.id}`}
                      checked={season.is_locked}
                      onCheckedChange={(next) => void updateSeasonLock(season.id, next)}
                    />
                  </div>
                  {!season.is_active ? (
                    <Button size="sm" variant="outline" onClick={() => void activateSeason(season.id)}>
                      Activate
                    </Button>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Scores</CardTitle>
          <Button variant="outline" size="sm" onClick={() => void loadScores()}>
            Refresh scores
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="valid">Valid</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                  <SelectItem value="removed">Removed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Game</Label>
              <Select value={gameFilter} onValueChange={setGameFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All games</SelectItem>
                  <SelectItem value="snake">Snake</SelectItem>
                  <SelectItem value="bubble-pop">Bubble Pop</SelectItem>
                  <SelectItem value="tetris">Tetris</SelectItem>
                  <SelectItem value="breakout">Breakout</SelectItem>
                  <SelectItem value="knitzy">Knitzy</SelectItem>
                  <SelectItem value="memory">Memory</SelectItem>
                  <SelectItem value="checkers">Checkers</SelectItem>
                  <SelectItem value="chess">Chess</SelectItem>
                  <SelectItem value="platformer">Platformer</SelectItem>
                  <SelectItem value="tower-defense">Tower Defense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Season</Label>
              <Select value={seasonFilter} onValueChange={setSeasonFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All seasons</SelectItem>
                  {seasons.map((season) => (
                    <SelectItem key={season.id} value={season.slug}>
                      {season.slug}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <p className="text-muted-foreground text-sm">Loading scores...</p>
          ) : (
            <div className="space-y-3">
              {scores.map((row) => (
                <div key={row.id} className="space-y-3 rounded-md border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        {row.player_name} - {row.score.toLocaleString()}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {row.game_type} - {new Date(row.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={row.status === "valid" ? "secondary" : row.status === "flagged" ? "outline" : "destructive"}>
                      {row.status}
                    </Badge>
                  </div>
                  <Input
                    value={reasonByScore[row.id] ?? ""}
                    onChange={(event) =>
                      setReasonByScore((current) => ({ ...current, [row.id]: event.target.value }))
                    }
                    placeholder="Moderation reason (optional)"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={savingScoreId === row.id}
                      onClick={() => void moderateScore(row.id, "valid")}
                    >
                      Mark valid
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={savingScoreId === row.id}
                      onClick={() => void moderateScore(row.id, "flagged")}
                    >
                      Flag
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={savingScoreId === row.id}
                      onClick={() => void moderateScore(row.id, "removed")}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              {scores.length === 0 ? (
                <p className="text-muted-foreground text-sm">No scores found for this filter set.</p>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
