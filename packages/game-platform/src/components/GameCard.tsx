"use client";

import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@gamehub/ui";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

import type { Game } from "../metadata/games";
import { useFeature, UI_FLAGS } from "../lib/flags";

export interface GameCardProps {
  featured?: boolean;
  priorityImage?: boolean;
  game: Game;
  /** Animation delay for staggered list rendering (0-6) */
  animationDelay?: number;
}

export function GameCard({ game, featured, priorityImage = false, animationDelay }: GameCardProps) {
  const useAnimations = useFeature(UI_FLAGS.CARD_ANIMATIONS);

  const cardContent = (
    <Card 
      className={cn(
        "group h-full overflow-hidden",
        useAnimations && "card-interactive",
        !useAnimations && "transition-shadow hover:shadow-lg",
        animationDelay !== undefined && `animate-fade-in-up stagger-${animationDelay}`
      )}
    >
      {/* Image container with overlay on hover */}
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <Image
          src={game.image}
          alt={game.title}
          fill
          priority={priorityImage}
          loading={priorityImage ? "eager" : "lazy"}
          className={cn(
            "object-cover",
            useAnimations && "transition-transform duration-300 group-hover:scale-105"
          )}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
        {/* Hover overlay with play indicator for featured games */}
        {featured && (
          <div 
            className={cn(
              "absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm",
              "opacity-0 transition-opacity duration-200",
              "group-hover:opacity-100 group-focus-visible:opacity-100"
            )}
            aria-hidden="true"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
              <svg 
                className="h-6 w-6 ml-1" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
        {/* Coming soon overlay for non-featured games */}
        {!featured && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-background/40"
            aria-hidden="true"
          >
            <span className="rounded-full bg-muted/90 px-4 py-2 text-sm font-medium text-muted-foreground backdrop-blur-sm">
              Coming Soon
            </span>
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-1 text-balance">{game.title}</CardTitle>
        <CardDescription className="line-clamp-2">{game.description}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-wrap gap-2">
          {featured ? (
            <Badge variant="default" className="bg-primary/90">
              <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-primary-foreground animate-pulse" />
              Playable
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              Coming Soon
            </Badge>
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

  // Non-featured cards are not clickable
  if (!featured) {
    return <div className="cursor-not-allowed">{cardContent}</div>;
  }

  return (
    <Link 
      href={game.path || `/games/${game.slug}`}
      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
    >
      {cardContent}
    </Link>
  );
}

export default GameCard;
