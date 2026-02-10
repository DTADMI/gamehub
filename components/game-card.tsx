"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export interface GameCardGame {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  slug: string;
  featured?: boolean;
  upcoming?: boolean;
}

export function GameCard({ game, featured }: { game: GameCardGame; featured?: boolean }) {
  return (
    <Link href={`/games/${game.slug}`}>
      <Card className="h-full transition-shadow hover:shadow-lg">
        <CardHeader>
          <CardTitle>{game.title}</CardTitle>
          <CardDescription>{game.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {game.tags?.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
            {game.upcoming && (
              <Badge variant="outline" className="border-amber-500/30 text-amber-600 dark:text-amber-400">
                Coming Soon
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
