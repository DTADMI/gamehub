/**
 * Split systems-discovery/src/index.tsx monolith by extracting scenes
 * into per-chapter files under src/scenes/.
 *
 * Chapters are identified by scene ID prefixes:
 *   main  — SD_INTRO, B1-B3, WRAP, SD_OUTRO
 *   space — SD_SPACE_INTRO, S1-S3, SPACE_WRAP, SD_SPACE_OUTRO
 *   body-breath — SD_BOD_BREATH_INTRO, BB1-BB3, BOD_BREATH_WRAP
 *   body-fuel   — SD_BOD_FUEL_INTRO, BF1-BF3, BOD_FUEL_WRAP
 *   body-move   — SD_BOD_MOVE_INTRO, BM1-BM3, BOD_MOVE_WRAP
 *   body-signal — SD_BOD_SIGNAL_INTRO, BSD1-BSD3, BOD_SIGNAL_WRAP
 *   body-grow   — SD_BOD_GROW_INTRO, BG1-BG3, BOD_GROW_WRAP
 *   ocean       — SD_OCEAN_INTRO, O1-O3, OCEAN_WRAP, SD_OCEAN_OUTRO
 *
 * Usage: node scripts/split-systems-discovery.mjs
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd());
const SRC = path.join(ROOT, "packages", "games", "systems-discovery", "src");
const INDEX_FILE = path.join(SRC, "index.tsx");
const SCENES_DIR = path.join(SRC, "scenes");

const content = fs.readFileSync(INDEX_FILE, "utf8");

// ── 1. Extract imports block (everything before const buildScenes) ──
const buildScenesStart = content.indexOf("const buildScenes = (): Scene[] => [");
const prelude = content.slice(0, buildScenesStart);

// ── 2. Extract post-scenes block (everything after the closing ];) ──
// Find the closing of buildScenes: find `];` that closes the array
const scenesBodyStart = content.indexOf("[\n", buildScenesStart) + 1;
// Count brackets to find the matching close
let depth = 1;
let i = scenesBodyStart;
while (i < content.length && depth > 0) {
  if (content[i] === "[") depth++;
  else if (content[i] === "]") depth--;
  i++;
}
const scenesBodyEnd = i; // position after the closing `]`
const postlude = content.slice(scenesBodyEnd + 1); // skip past `];\n`

const scenesBody = content.slice(scenesBodyStart, scenesBodyEnd - 1);

// ── 3. Split scenes body into individual scene objects ──
// Each scene starts with a line like: `    id: "XXX",`
// or for first scene: `  {\n    id: "XXX",`
const sceneRegex = /(\s*\{\s*\n\s*id:\s*"([^"]+)")/g;
const matches = [...scenesBody.matchAll(sceneRegex)];

if (matches.length === 0) {
  console.error("No scenes found!");
  process.exit(1);
}

const scenes = [];
for (let j = 0; j < matches.length; j++) {
  const start = matches[j].index;
  const end = j < matches.length - 1 ? matches[j + 1].index : scenesBody.length;
  const id = matches[j][2];
  scenes.push({ id, text: scenesBody.slice(start, end).trimEnd() });
}

// ── 4. Group scenes by chapter ──
const chapterMap = {
  main: ["SD_INTRO", "B1", "B2", "B3", "WRAP", "SD_OUTRO"],
  space: ["SD_SPACE_INTRO", "S1", "S2", "S3", "SPACE_WRAP", "SD_SPACE_OUTRO"],
  "body-breath": ["SD_BOD_BREATH_INTRO", "BB1", "BB2", "BB3", "BOD_BREATH_WRAP"],
  "body-fuel": ["SD_BOD_FUEL_INTRO", "BF1", "BF2", "BF3", "BOD_FUEL_WRAP"],
  "body-move": ["SD_BOD_MOVE_INTRO", "BM1", "BM2", "BM3", "BOD_MOVE_WRAP"],
  "body-signal": ["SD_BOD_SIGNAL_INTRO", "BSD1", "BSD2", "BSD3", "BOD_SIGNAL_WRAP"],
  "body-grow": ["SD_BOD_GROW_INTRO", "BG1", "BG2", "BG3", "BOD_GROW_WRAP"],
  ocean: ["SD_OCEAN_INTRO", "O1", "O2", "O3", "OCEAN_WRAP", "SD_OCEAN_OUTRO"],
};

const chapters = {};
for (const [name, ids] of Object.entries(chapterMap)) {
  chapters[name] = scenes.filter((s) => ids.includes(s.id));
}

// Verify all scenes are accounted for
const mappedIds = new Set(Object.values(chapterMap).flat());
const unmapped = scenes.filter((s) => !mappedIds.has(s.id));
if (unmapped.length > 0) {
  console.warn(`⚠ ${unmapped.length} unmapped scene(s): ${unmapped.map((s) => s.id).join(", ")}`);
}

// ── 5. Determine which imports each chapter needs ──
// Extract all identifiers used in scene render functions
const allImports = prelude.match(/import\s+.*$/gm) || [];
// (the importLines variable below is kept for documentation of the extraction logic)
// eslint-disable-next-line no-unused-vars
const importLines = allImports.filter((l) => !l.includes("'./puzzles/") && !l.includes('"./puzzles/'));

// Chapters that use puzzles
const chapterPuzzleImports = {
  "body-breath": `import { BreathPuzzle } from "../puzzles/BreathPuzzle";`,
  "body-fuel": `import { FuelMatchingPuzzle } from "../puzzles/FuelMatchingPuzzle";`,
  space: `import { OrbitsPuzzle } from "../puzzles/OrbitsPuzzle";`,
};

// ── 6. Write chapter files ──
fs.mkdirSync(SCENES_DIR, { recursive: true });

const chapterFilenames = {};
const sharedHeaderLines = [
  `// Auto-generated scene group — extracted from index.tsx monolith`,
  `// See scripts/split-systems-discovery.mjs`,
];

for (const [chapter, chapterScenes] of Object.entries(chapters)) {
  if (chapterScenes.length === 0) continue;

  const filename = `scenes-${chapter}.tsx`;
  chapterFilenames[chapter] = filename;

  // Determine which imports this chapter needs
  const puzzleImport = chapterPuzzleImports[chapter] || "";

  // Minimal imports: just React and types. The parent file provides Scene type.
  const fileContent = [
    ...sharedHeaderLines,
    `import React from "react";`,
    `import { t } from "@/lib/i18n";`,
    puzzleImport,
    "",
    `import type { Scene } from "@games/pointclick-engine";`,
    "",
    `export function build${capitalizeChapter(chapter)}Scenes(): Scene[] {`,
    `  return [`,
    chapterScenes.map((s) => s.text + ",").join("\n"),
    `  ];`,
    `}`,
    "",
  ]
    .filter(Boolean)
    .join("\n");

  const filePath = path.join(SCENES_DIR, filename);
  fs.writeFileSync(filePath, fileContent, "utf8");
  console.log(`✅ ${filename} (${chapterScenes.length} scenes)`);
}

// ── 7. Rebuild index.tsx ──
const chapterImports = Object.entries(chapterFilenames)
  .map(
    ([chapter, filename]) =>
      `import { build${capitalizeChapter(chapter)}Scenes } from "./scenes/${filename.replace(".tsx", "")}";`,
  )
  .join("\n");

const newBuildScenes = `const buildScenes = (): Scene[] => [
  ...buildMainScenes(),
  ...buildSpaceScenes(),
  ...buildBodyBreathScenes(),
  ...buildBodyFuelScenes(),
  ...buildBodyMoveScenes(),
  ...buildBodySignalScenes(),
  ...buildBodyGrowScenes(),
  ...buildOceanScenes(),
];`;

// Build the new index.tsx
const newIndexContent =
  prelude.trimEnd() +
  "\n" +
  chapterImports +
  "\n\n" +
  "// Scene definitions — extracted to per-chapter files in ./scenes/\n" +
  "// See scripts/split-systems-discovery.mjs for chapter grouping rules\n" +
  newBuildScenes +
  "\n" +
  postlude;

fs.writeFileSync(INDEX_FILE, newIndexContent, "utf8");
console.log(`\n✅ index.tsx rebuilt with ${Object.keys(chapterFilenames).length} chapter imports`);

function capitalizeChapter(ch) {
  return ch
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}