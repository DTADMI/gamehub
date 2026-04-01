"use client";

import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@gamehub/ui";
import Image from "next/image";
import Link from "next/link";

import { useFlags } from "../contexts/FlagsContext";
import type { Game } from "../metadata/games";

export interface GameCardProps {
  featured?: boolean;
  priorityImage?: boolean;
  game: Game;
}

function BasicGameCard({ game, featured, priorityImage = false }: GameCardProps) {
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

function EnhancedGameCard({ game, featured, priorityImage = false }: GameCardProps) {
  const card = (
    <Card className="group h-full overflow-hidden border-2 border-transparent transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/20">
      <div className="bg-muted/30 relative aspect-[16/9] w-full overflow-hidden">
        <Image
          src={game.image}
          alt={game.title}
          fill
          priority={priorityImage}
          loading={priorityImage ? "eager" : "lazy"}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute top-3 right-3">
          {featured ? (
            <Badge variant="default" className="bg-emerald-600/90">
              Playable
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-amber-100/90 text-amber-900 dark:bg-amber-900/60 dark:text-amber-100">
              Coming Soon
            </Badge>
          )}
        </div>
      </div>
      <CardHeader className="pb-3">
        <CardTitle className="line-clamp-1 transition-colors group-hover:text-primary">
          {game.title}
        </CardTitle>
        <CardDescription className="line-clamp-2">{game.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2">
          {game.tags?.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
          {game.tags && game.tags.length > 3 ? (
            <Badge variant="outline">+{game.tags.length - 3}</Badge>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );

  if (!featured) {
    return card;
  }

  return (
    <Link
      href={game.path || `/games/${game.slug}`}
      className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {card}
    </Link>
  );
}

export function GameCard(props: GameCardProps) {
  const { flags } = useFlags();
  if (flags.ui.enhancedGameCards) {
    return <EnhancedGameCard {...props} />;
  }
  return <BasicGameCard {...props} />;
}

export default GameCard;
