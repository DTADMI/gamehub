"use client";

import { useAuth } from "@gamehub/game-platform";
import { useI18n } from "@/lib/i18n";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@gamehub/ui";
import { ArrowLeft, Info, TrendingUp, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Vue inter-jeux (B4).
 *
 * Un score brut n'est pas comparable d'un jeu a l'autre : on affiche ici la
 * position relative (percentile) du joueur dans chaque jeu, puis une note
 * agregee. Le classement par jeu reste la comparaison de reference (lien vers
 * /leaderboard). Voir `docs/technical/cross-game-rating.md`.
 */

type RatingGame = {
  gameType: string;
  score: number;
  percentile: number | null;
  direction: "asc" | "desc";
};

type RatingResponse = {
  aggregate: number | null;
  games: RatingGame[];
  note?: string;
};

function percentileVariant(percentile: number): "default" | "secondary" | "outline" {
  if (percentile >= 80) return "default";
  if (percentile >= 50) return "secondary";
  return "outline";
}

function gameLabel(gameType: string): string {
  // "SNAKE" -> "Snake", "BUBBLE_POP" -> "Bubble Pop"
  return gameType
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function CrossGameRatingPage() {
  const { t } = useI18n();
  const { user, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<RatingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!user) {
        setData(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/rating", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Failed to load rating (${response.status})`);
        }
        const payload = (await response.json()) as RatingResponse;
        if (!cancelled) setData(payload);
      } catch {
        if (!cancelled) setError(t("rating.error"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [user, t]);

  if (authLoading || loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-muted-foreground" role="status">
          {t("rating.loading")}
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-bold">{t("rating.title")}</h1>
        <p className="text-muted-foreground mt-2">{t("rating.signIn")}</p>
        <Button asChild className="mt-4">
          <Link href="/login">{t("common.signIn")}</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <TrendingUp className="h-6 w-6 text-emerald-600" aria-hidden="true" />
            {t("rating.title")}
          </h1>
          <p className="text-muted-foreground mt-2 break-words text-sm">{t("rating.subtitle")}</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/leaderboard">
            <ArrowLeft className="mr-1 h-4 w-4" aria-hidden="true" />
            {t("rating.backToLeaderboard")}
          </Link>
        </Button>
      </div>

      {error ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" aria-hidden="true" />
            {t("rating.aggregate")}
            <span
              className="text-muted-foreground ml-1 inline-flex items-center"
              title={t("rating.aggregateHint")}
              aria-label={t("rating.aggregateHint")}
              role="img"
            >
              <Info className="h-4 w-4" aria-hidden="true" />
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold tabular-nums">
            {data?.aggregate === null || data?.aggregate === undefined
              ? "—"
              : Math.round(data.aggregate)}
            <span className="text-muted-foreground ml-1 text-base font-normal">/ 100</span>
          </p>
        </CardContent>
      </Card>

      {data && data.games.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">{t("rating.noScores")}</p>
          </CardContent>
        </Card>
      ) : null}

      {data && data.games.length > 0 ? (
        <ul className="space-y-3">
          {data.games.map((game) => (
            <li key={game.gameType}>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{gameLabel(game.gameType)}</p>
                      <p className="text-muted-foreground text-xs">
                        {t("rating.score")}: <span className="tabular-nums">{game.score}</span>
                      </p>
                    </div>
                    <Badge variant={percentileVariant(game.percentile ?? 0)}>
                      {game.percentile === null
                        ? "—"
                        : `${t("rating.percentile")} ${Math.round(game.percentile)}`}
                    </Badge>
                  </div>
                  <div
                    className="bg-muted mt-3 h-2 w-full overflow-hidden rounded-full"
                    role="progressbar"
                    aria-label={`${gameLabel(game.gameType)} ${t("rating.percentile")}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={game.percentile === null ? undefined : Math.round(game.percentile)}
                  >
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${game.percentile ?? 0}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  );
}
