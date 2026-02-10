import { rmSync, existsSync } from "fs";
import { resolve } from "path";

const root = process.cwd();

// Only delete the 4 project SOURCE directories
// Keep packages/projects-metadata/ intact
const projectDirs = [
  "packages/projects/libra-keeper",
  "packages/projects/quest-hunt",
  "packages/projects/story-forge",
  "packages/projects/velvet-galaxy",
];

for (const dir of projectDirs) {
  const fullPath = resolve(root, dir);
  if (existsSync(fullPath)) {
    rmSync(fullPath, { recursive: true, force: true });
    console.log(`Deleted: ${dir}`);
  } else {
    console.log(`Already gone: ${dir}`);
  }
}

// If packages/projects/ is now empty (or only has metadata we didn't touch), 
// check if there's anything left
const projectsDir = resolve(root, "packages/projects");
if (existsSync(projectsDir)) {
  const { readdirSync } = await import("fs");
  const remaining = readdirSync(projectsDir);
  if (remaining.length === 0) {
    rmSync(projectsDir, { recursive: true, force: true });
    console.log("Deleted empty packages/projects/ directory");
  } else {
    console.log(`packages/projects/ still has: ${remaining.join(", ")}`);
  }
}

console.log("\nDone. packages/projects-metadata/ is untouched.");
