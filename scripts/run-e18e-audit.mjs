import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const outDir = path.join(root, "reports", "deps");
const outPath = path.join(outDir, "e18e-audit.txt");

fs.mkdirSync(outDir, { recursive: true });

let output = "";
try {
  output = execSync("pnpm dlx @e18e/cli analyze", {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 50,
  });
} catch (error) {
  output = `${error.stdout ?? ""}\n${error.stderr ?? ""}`.trim();
  if (!output) {
    fs.writeFileSync(outPath, "\n");
    console.error("e18e audit failed and did not produce output.");
    process.exit(1);
  }
}

fs.writeFileSync(outPath, `${output}\n`);
console.log("e18e audit completed.");
console.log(`Report written: ${outPath}`);
