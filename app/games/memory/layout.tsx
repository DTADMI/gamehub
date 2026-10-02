import type { Metadata } from "next";

import { getGame } from "@gamehub/game-platform/metadata/games";

export function generateMetadata(): Metadata {
  const game = getGame("memory");
  if (!game) {
    return { title: "GameHub", robots: { index: false, follow: false } };
  }
  return {
    title: game.title,
    description: game.shortDescription,
    alternates: { canonical: "/games/memory" },
    openGraph: {
      type: "website",
      title: game.title,
      description: game.shortDescription,
      url: "/games/memory",
      images: [{ url: game.image, alt: game.title }],
    },
  };
}

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
