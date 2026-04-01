import { execSync } from "node:child_process";
import process from "node:process";

const vercelEnv = process.env.VERCEL_ENV || "development";

if (vercelEnv !== "preview") {
  process.exit(1);
}

const currentSha = process.env.VERCEL_GIT_COMMIT_SHA;
const previousSha = process.env.VERCEL_GIT_PREVIOUS_SHA;

if (!currentSha || !previousSha) {
  process.exit(1);
}

try {
  execSync(`git cat-file -e ${previousSha}`, { stdio: "ignore" });
  execSync(`git cat-file -e ${currentSha}`, { stdio: "ignore" });
} catch {
  process.exit(1);
}

let diffOutput = "";
try {
  diffOutput = execSync(`git diff --name-only ${previousSha} ${currentSha}`, {
    encoding: "utf8",
  });
} catch {
  process.exit(1);
}

const changedFiles = diffOutput
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);

if (changedFiles.length === 0) {
  process.exit(1);
}

const allowedPrefixes = ["docs/", ".github/"];
const allowedFiles = new Set(["README.md", "AGENTS.md", "LICENSE", ".gitignore"]);

const isSafeChange = (file) =>
  allowedPrefixes.some((prefix) => file.startsWith(prefix)) || allowedFiles.has(file);

const shouldIgnore = changedFiles.every(isSafeChange);

process.exit(shouldIgnore ? 0 : 1);
