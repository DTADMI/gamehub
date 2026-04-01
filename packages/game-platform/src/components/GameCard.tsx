"use client";

import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@gamehub/ui";
import Image from "next/image";
import Link from "next/link";

import type { Game } from "../metadata/games";

export interface GameCardProps {
  featured?: boolean;
  priorityImage?: boolean;
  game: Game;
}

export function GameCard({ game, featured, priorityImage = false }: GameCardProps) {
  const card = (
    <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative aspect-[16/9] w-full">
        <Image
          src={game.image}
          alt={game.title}
          fill
          priority={priorityImage}
          loading={priorityImage ? "eager" : "lazy"}
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
      </div>
      <CardHeader>
        <CardTitle>{game.title}</CardTitle>
        <CardDescription>{game.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {featured ? (
            <Badge variant="default">Playable</Badge>
          ) : (
            <Badge variant="outline">Coming Soon</Badge>
          )}
          {game.tags?.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  if (!featured) {
    return card;
  }

  return <Link href={game.path || `/games/${game.slug}`}>{card}</Link>;
}

export default GameCard;
