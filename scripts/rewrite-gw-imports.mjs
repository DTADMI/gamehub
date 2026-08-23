// rewrite-gw-imports.mjs — Rewrite @glyph-weaver/* imports to relative paths
import fs from "node:fs";
import path from "node:path";

const destRoot = path.resolve(process.cwd(), "packages/games/glyph-weaver/packages");
const pkgs = ["core", "dictionary", "parser", "compiler", "dsl", "renderer", "ui", "tools"];

let totalRewrites = 0;
let filesChanged = 0;

function walkDir(dir, fn) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkDir(full, fn);
    else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) fn(full);
  }
}

walkDir(destRoot, (filePath) => {
  let content = fs.readFileSync(filePath, "utf-8");
  let changed = false;

  for (const targetPkg of pkgs) {
    const fromPattern = "@glyph-weaver/" + targetPkg;

    // Handle: from '@glyph-weaver/xxx' or from '@glyph-weaver/xxx/subpath'
    const regex1 = new RegExp(
      `from\\s+['"]${fromPattern.replace("/", "\\/")}((?:\\/[^'"]*)?)['"]`,
      "g"
    );

    content = content.replace(regex1, (_match, subPath) => {
      const fileDir = path.dirname(filePath);
      const targetDir = path.join(destRoot, targetPkg, "src");
      let relative = path.relative(fileDir, targetDir).replace(/\\/g, "/");
      if (!relative.startsWith(".")) relative = "./" + relative;

      let fullPath = relative;
      if (subPath) {
        fullPath = relative + subPath.replace(/\.js$/, "").replace(/\.ts$/, "");
      }
      changed = true;
      totalRewrites++;
      return `from '${fullPath}'`;
    });

    // Handle: } from '@glyph-weaver/xxx' (multi-line imports)
    const regex2 = new RegExp(
      `} from\\s+['"]${fromPattern.replace("/", "\\/")}((?:\\/[^'"]*)?)['"]`,
      "g"
    );

    content = content.replace(regex2, (_match, subPath) => {
      const fileDir = path.dirname(filePath);
      const targetDir = path.join(destRoot, targetPkg, "src");
      let relative = path.relative(fileDir, targetDir).replace(/\\/g, "/");
      if (!relative.startsWith(".")) relative = "./" + relative;

      let fullPath = relative;
      if (subPath) {
        fullPath = relative + subPath.replace(/\.js$/, "").replace(/\.ts$/, "");
      }
      changed = true;
      totalRewrites++;
      return `} from '${fullPath}'`;
    });
  }

  if (changed) {
    fs.writeFileSync(filePath, content, "utf-8");
    filesChanged++;
  }
});

console.log(`Files changed: ${filesChanged}`);
console.log(`Total import rewrites: ${totalRewrites}`);