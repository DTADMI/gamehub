import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const outDir = path.join(root, "reports", "deps");
const treePath = path.join(outDir, "pnpm-ls-tree.json");
const summaryPath = path.join(outDir, "pnpm-ls-summary.json");

fs.mkdirSync(outDir, { recursive: true });

let stdout = "";
try {
  stdout = execSync(`pnpm --dir "${root}" ls --json -r`, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 200,
  });
} catch (error) {
  console.error("Failed to export dependency graph.");
  console.error(error.message);
  process.exit(1);
}

function splitTopLevelJsonArrays(input) {
  const chunks = [];
  let depth = 0;
  let inString = false;
  let escape = false;
  let start = -1;

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];

    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\") {
      escape = true;
      continue;
    }
    if (ch === "\"") {
      inString = !inString;
      continue;
    }
    if (inString) {
      continue;
    }

    if (ch === "[") {
      if (depth === 0) {
        start = i;
      }
      depth += 1;
    } else if (ch === "]") {
      depth -= 1;
      if (depth === 0 && start !== -1) {
        chunks.push(input.slice(start, i + 1));
        start = -1;
      }
    }
  }
  return chunks;
}

let parsed;
try {
  const chunks = splitTopLevelJsonArrays(stdout || "");
  if (chunks.length === 0) {
    throw new Error("No JSON arrays found in pnpm ls output.");
  }
  parsed = chunks.flatMap((chunk) => JSON.parse(chunk));
} catch (error) {
  console.error("Failed to parse pnpm ls JSON output.", error);
  process.exit(1);
}

const summary = parsed.map((pkg) => ({
  name: pkg.name,
  path: pkg.path,
  dependencyCount: Object.keys(pkg.dependencies ?? {}).length,
  devDependencyCount: Object.keys(pkg.devDependencies ?? {}).length,
}));

fs.writeFileSync(treePath, JSON.stringify(parsed, null, 2));
fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

console.log(`Dependency graph exported: ${treePath}`);
console.log(`Dependency summary exported: ${summaryPath}`);
