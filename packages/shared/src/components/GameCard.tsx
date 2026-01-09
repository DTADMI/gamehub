"use client";

import Link from "next/link";

import type { Game } from "../metadata/games";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export interface GameCardProps {
  featured?: boolean;
  game: Game;
}

export function GameCard({ game, featured }: GameCardProps) {
  return (
    <Link href={game.path || `/games/${game.slug}`}>
      <Card className="h-full transition-shadow hover:shadow-lg">
        <CardHeader>
          <CardTitle>{game.title}</CardTitle>
          <CardDescription>{game.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {game.tags?.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default GameCard;
