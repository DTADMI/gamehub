import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const outDir = path.join(root, "reports", "deps");
const outPath = path.join(outDir, "outdated.txt");
fs.mkdirSync(outDir, { recursive: true });

let output = "";
try {
  output = execSync("pnpm outdated -r", {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 50,
  });
} catch (error) {
  // pnpm outdated exits non-zero when updates exist; still useful output.
  output = `${error.stdout ?? ""}${error.stderr ?? ""}`;
}

fs.writeFileSync(outPath, output);
process.stdout.write(output);

if (!output.trim()) {
  console.error("Outdated audit failed unexpectedly.");
  process.exit(1);
}

console.log(`Outdated report written: ${outPath}`);
