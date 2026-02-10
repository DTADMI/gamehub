import { rmSync, existsSync, unlinkSync } from "fs";
import { resolve } from "path";

const root = process.cwd();

// Directories to delete entirely
const dirsToDelete = [
  "packages/projects",
  "packages/game-platform",
  "packages/games",
  "packages/pointclick-engine",
  "packages/ui",
  "packages/tsconfig",
  "packages/projects-metadata",
  "packages",
  "apps",
  "cypress",
  "e2e",
  "tests",
  "tests-e2e",
  "docs",
  "scripts",
  ".github",
];

// Files to delete
const filesToDelete = [
  ".dockerignore",
  "docker-compose.yml",
  "firebase.json",
  "playwright.config.ts",
  "tailwind.config.ts",
  "jsconfig.json",
  ".eslintrc.js",
  "eslint.config.mjs",
  ".npmrc",
  ".nvmrc",
  ".node-version",
  ".prettierrc",
  ".prettierignore",
  ".env.example",
  "README.md",
  "turbo.json",
  "pnpm-workspace.yaml",
];

for (const dir of dirsToDelete) {
  const p = resolve(root, dir);
  if (existsSync(p)) {
    try {
      rmSync(p, { recursive: true, force: true });
      console.log(`Deleted directory: ${dir}`);
    } catch (e) {
      console.log(`Failed to delete ${dir}: ${e.message}`);
    }
  } else {
    console.log(`Skipped (not found): ${dir}`);
  }
}

for (const file of filesToDelete) {
  const p = resolve(root, file);
  if (existsSync(p)) {
    try {
      unlinkSync(p);
      console.log(`Deleted file: ${file}`);
    } catch (e) {
      console.log(`Failed to delete ${file}: ${e.message}`);
    }
  } else {
    console.log(`Skipped (not found): ${file}`);
  }
}

console.log("\nCleanup complete!");
