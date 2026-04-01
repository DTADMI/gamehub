import fs from "node:fs";
import path from "node:path";

const requiredFiles = [
  "app/layout.tsx",
  "app/page.tsx",
  "app/admin/blog/page.tsx",
  "packages/game-platform/src/contexts/AuthContext.tsx",
  "packages/game-platform/src/components/ModeToggle.tsx",
  "tests-e2e/smoke.spec.ts",
];

const root = process.cwd();
const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));

if (missing.length > 0) {
  console.error("Smoke checks failed. Missing required files:");
  for (const file of missing) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

console.log("Smoke checks passed.");
