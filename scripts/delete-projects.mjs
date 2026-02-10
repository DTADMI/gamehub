import { rm, readdir } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();

// Delete packages/projects/ entirely
const projectsDir = join(root, "packages", "projects");
try {
  const entries = await readdir(projectsDir);
  console.log("Found in packages/projects/:", entries);
  await rm(projectsDir, { recursive: true, force: true });
  console.log("Deleted packages/projects/");
} catch (e) {
  console.log("packages/projects/ not found or already deleted:", e.message);
}

// Delete packages/projects-metadata/ entirely
const metadataDir = join(root, "packages", "projects-metadata");
try {
  const entries = await readdir(metadataDir);
  console.log("Found in packages/projects-metadata/:", entries);
  await rm(metadataDir, { recursive: true, force: true });
  console.log("Deleted packages/projects-metadata/");
} catch (e) {
  console.log("packages/projects-metadata/ not found or already deleted:", e.message);
}

// Also clean up apps/frontend if it still exists (old monorepo entry)
const frontendDir = join(root, "apps", "frontend");
try {
  await rm(frontendDir, { recursive: true, force: true });
  console.log("Deleted apps/frontend/");
} catch (e) {
  console.log("apps/frontend/ not found:", e.message);
}

// Clean up apps/ if now empty
const appsDir = join(root, "apps");
try {
  const remaining = await readdir(appsDir);
  if (remaining.length === 0) {
    await rm(appsDir, { recursive: true, force: true });
    console.log("Deleted empty apps/");
  } else {
    console.log("apps/ still has contents:", remaining);
  }
} catch (e) {
  console.log("apps/ not found:", e.message);
}

console.log("Done. Only packages/projects and packages/projects-metadata removed.");
