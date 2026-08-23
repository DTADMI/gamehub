// fix-gw-inline-imports.mjs — Fix remaining inline import('@glyph-weaver/core') references
import fs from "node:fs";
import path from "node:path";

const destRoot = path.resolve(process.cwd(), "packages/games/glyph-weaver/packages");

const files = [
  "packages/games/glyph-weaver/packages/compiler/src/multi-ring.ts",
  "packages/games/glyph-weaver/packages/parser/src/index.ts",
];

for (const file of files) {
  const absFile = path.resolve(process.cwd(), file);
  let content = fs.readFileSync(absFile, "utf-8");
  const fileDir = path.dirname(absFile);
  const coreDir = path.join(destRoot, "core", "src");
  let relative = path.relative(fileDir, coreDir).replace(/\\/g, "/");
  if (!relative.startsWith(".")) relative = "./" + relative;

  const before = content;
  content = content.replace(
    /import\('@glyph-weaver\/core'\)/g,
    `import('${relative}')`
  );

  if (content !== before) {
    fs.writeFileSync(absFile, content, "utf-8");
    console.log(`Fixed ${file}: import('@glyph-weaver/core') → import('${relative}')`);
  } else {
    console.log(`No changes in ${file}`);
  }
}

console.log("Done");