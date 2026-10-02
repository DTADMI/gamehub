#!/usr/bin/env node
/**
 * generate-game-metadata.mjs - donne a chaque page de jeu son propre metadata.
 *
 * Pourquoi : les pages `app/games/<slug>/page.tsx` sont des composants clients
 * (chargement dynamique du jeu), donc elles ne peuvent pas exporter `metadata`.
 * Sans layout serveur, les 24 pages de jeu heritaient du titre de l accueil, donc
 * aucun titre ni description par jeu dans les resultats de recherche.
 *
 * Ce script cree un `layout.tsx` serveur par jeu (donnees tirees du manifeste
 * `@gamehub/game-platform/metadata/games`). Idempotent : un layout deja present
 * n est pas reecrit.
 *
 * Usage : node scripts/generate-game-metadata.mjs [--check]
 *   --check : n ecrit rien, sort 1 si un layout manque (pour un garde-fou).
 */
import { existsSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const GAMES_DIR = join(ROOT, "app", "games");
const checkOnly = process.argv.includes("--check");

const template = (slug) => `import type { Metadata } from "next";

import { getGame } from "@gamehub/game-platform/metadata/games";

export function generateMetadata(): Metadata {
  const game = getGame("${slug}");
  if (!game) {
    return { title: "GameHub", robots: { index: false, follow: false } };
  }
  return {
    title: game.title,
    description: game.shortDescription,
    alternates: { canonical: "/games/${slug}" },
    openGraph: {
      type: "website",
      title: game.title,
      description: game.shortDescription,
      url: "/games/${slug}",
      images: [{ url: game.image, alt: game.title }],
    },
  };
}

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
`;

if (!existsSync(GAMES_DIR)) {
  console.error(`FAIL - ${GAMES_DIR} introuvable`);
  process.exit(1);
}

const slugs = readdirSync(GAMES_DIR).filter((name) => {
  if (name === "[slug]" || name === "layout.tsx" || name === "page.tsx") return false;
  return existsSync(join(GAMES_DIR, name, "page.tsx"));
});

let created = 0;
const missing = [];
for (const slug of slugs) {
  const target = join(GAMES_DIR, slug, "layout.tsx");
  if (existsSync(target)) {
    const content = readFileSync(target, "utf8");
    if (content.includes("generateMetadata")) continue;
  }
  if (checkOnly) {
    missing.push(slug);
    continue;
  }
  writeFileSync(target, template(slug), "utf8");
  created += 1;
}

if (checkOnly) {
  if (missing.length > 0) {
    console.error(`Layouts de jeu manquants : ${missing.join(", ")}`);
    process.exit(1);
  }
  console.log(`generate-game-metadata : ${slugs.length} page(s) de jeu avec metadata.`);
  process.exit(0);
}

console.log(`generate-game-metadata : ${created} layout(s) cree(s), ${slugs.length} page(s) de jeu au total.`);
