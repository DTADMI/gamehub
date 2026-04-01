import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const examplePath = path.join(root, ".env.example");

const requiredVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "KV_REST_API_URL",
  "KV_REST_API_TOKEN",
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

function parseEnvKeys(filePath) {
  if (!fs.existsSync(filePath)) {
    return new Set();
  }
  const text = fs.readFileSync(filePath, "utf8");
  const keys = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => line.split("=")[0].trim());
  return new Set(keys);
}

if (!fs.existsSync(examplePath)) {
  console.error("Missing .env.example");
  process.exit(1);
}

const exampleKeys = parseEnvKeys(examplePath);
const missingInExample = requiredVars.filter((key) => !exampleKeys.has(key));

if (missingInExample.length > 0) {
  console.error("Missing required env vars in .env.example:");
  for (const key of missingInExample) {
    console.error(`- ${key}`);
  }
  process.exit(1);
}

const checkTargets = [".env.local", ".env"];
for (const file of checkTargets) {
  const filePath = path.join(root, file);
  if (!fs.existsSync(filePath)) {
    continue;
  }
  const keys = parseEnvKeys(filePath);
  const missing = requiredVars.filter((key) => !keys.has(key));
  if (missing.length > 0) {
    console.error(`${file} is missing required env vars:`);
    for (const key of missing) {
      console.error(`- ${key}`);
    }
    process.exit(1);
  }
}

console.log("Environment validation passed.");
