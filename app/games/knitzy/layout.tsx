import type { Metadata } from "next";

import { getGame } from "@gamehub/game-platform/metadata/games";

export function generateMetadata(): Metadata {
  const game = getGame("knitzy");
  if (!game) {
    return { title: "GameHub", robots: { index: false, follow: false } };
  }
  return {
    title: game.title,
    description: game.shortDescription,
    alternates: { canonical: "/games/knitzy" },
    openGraph: {
      type: "website",
      title: game.title,
      description: game.shortDescription,
      url: "/games/knitzy",
      images: [{ url: game.image, alt: game.title }],
    },
  };
}

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
