import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "reports", "deps");
const outPath = path.join(outDir, "module-replacements-audit.json");

const replacementCatalog = {
  lodash: ["lodash-es", "es-toolkit"],
  moment: ["date-fns", "dayjs"],
  axios: ["fetch API", "ky"],
  uuid: ["crypto.randomUUID()"],
  ramda: ["es-toolkit", "radashi"],
  "node-fetch": ["native fetch"],
};

function findPackageJsonFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".next" || entry.name === ".git") {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findPackageJsonFiles(fullPath));
      continue;
    }
    if (entry.isFile() && entry.name === "package.json") {
      files.push(fullPath);
    }
  }
  return files;
}

const packageFiles = findPackageJsonFiles(root);
const recommendations = [];

for (const pkgPath of packageFiles) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const deps = {
    ...(pkg.dependencies ?? {}),
    ...(pkg.devDependencies ?? {}),
  };
  for (const [name, replacements] of Object.entries(replacementCatalog)) {
    if (!Object.hasOwn(deps, name)) {
      continue;
    }
    recommendations.push({
      package: path.relative(root, pkgPath),
      module: name,
      currentVersion: deps[name],
      replacements,
    });
  }
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  outPath,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      recommendations,
    },
    null,
    2,
  ),
);

if (recommendations.length === 0) {
  console.log("No module replacement candidates found across workspace package.json files.");
} else {
  console.log("Module replacement candidates found:");
  for (const item of recommendations) {
    console.log(`- ${item.package}: ${item.module} -> ${item.replacements.join(", ")}`);
  }
}
console.log(`Report written: ${outPath}`);
