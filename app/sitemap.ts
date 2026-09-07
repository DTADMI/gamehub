import { games } from "@gamehub/game-platform/metadata/games";
import { type MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gamehub.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/games`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
  ];

  const gameRoutes: MetadataRoute.Sitemap = Object.values(games)
    .filter((g) => g.visible && g.enabled)
    .map((g) => ({
      url: `${SITE_URL}/games/${g.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  return [...staticRoutes, ...gameRoutes];
}