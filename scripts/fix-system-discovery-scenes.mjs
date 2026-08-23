// Add shared imports to all scene files and clean up index.tsx

import fs from "node:fs";
import path from "node:path";

const SRCDIR = path.join(process.cwd(), "packages", "games", "systems-discovery", "src");
const SCENES_DIR = path.join(SRCDIR, "scenes");
const INDEX_FILE = path.join(SRCDIR, "index.tsx");

const SHARED_IMPORT = 'import { HomeostasisMeter, PostGameCTA, createPipesState, evaluatePipes, createSequenceState, pressSequenceKey, setTileRotation, toggleValve } from "./_imports";\nimport type { PipesState, SequenceState } from "./_imports";';

// ── Add shared imports to scene files ──
const sceneFiles = fs.readdirSync(SCENES_DIR).filter((f) => f.endsWith(".tsx") && f !== "_imports.tsx");

for (const file of sceneFiles) {
  const filePath = path.join(SCENES_DIR, file);
  let content = fs.readFileSync(filePath, "utf8");

  // Add shared import after the last existing import
  if (!content.includes("./_imports")) {
    const lines = content.split("\n");
    let lastImportIdx = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("import ") || lines[i].startsWith("import type ")) {
        lastImportIdx = i;
      }
    }
    // Insert after last import line, before the empty line + export function
    lines.splice(lastImportIdx + 1, 0, "", SHARED_IMPORT);
    content = lines.join("\n");
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`Added imports to: ${file}`);
  }
}

// ── Clean up index.tsx — remove imports now in scene files ──
let indexContent = fs.readFileSync(INDEX_FILE, "utf8");

// Remove imports that are only used in the scene files (now handled by _imports.ts)
const importsToRemove = [
  'import HomeostasisMeter from "@gamehub/game-platform/components/sysdisc/HomeostasisMeter";',
  'import { PostGameCTA } from "@games/pointclick-engine";',
  'import {\n  createPipesState,\n  evaluatePipes,\n  type PipesState,\n  setTileRotation,\n  toggleValve,\n} from "@games/pointclick-engine/puzzles/pipes";',
  'import {\n  createSequenceState,\n  pressSeq as pressSequenceKey,\n  type SequenceState,\n} from "@games/pointclick-engine/puzzles/sequence";',
  'import { BreathPuzzle } from "./puzzles/BreathPuzzle";',
  'import { FuelMatchingPuzzle } from "./puzzles/FuelMatchingPuzzle";',
  'import { OrbitsPuzzle } from "./puzzles/OrbitsPuzzle";',
];

for (const imp of importsToRemove) {
  indexContent = indexContent.replace(imp + "\n", "");
}

fs.writeFileSync(INDEX_FILE, indexContent, "utf8");
console.log("Cleaned up index.tsx imports");
console.log("Done.");