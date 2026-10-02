import type { Metadata } from "next";

import { getGame } from "@gamehub/game-platform/metadata/games";

export function generateMetadata(): Metadata {
  const game = getGame("quantum-architect");
  if (!game) {
    return { title: "GameHub", robots: { index: false, follow: false } };
  }
  return {
    title: game.title,
    description: game.shortDescription,
    alternates: { canonical: "/games/quantum-architect" },
    openGraph: {
      type: "website",
      title: game.title,
      description: game.shortDescription,
      url: "/games/quantum-architect",
      images: [{ url: game.image, alt: game.title }],
    },
  };
}

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
