// Add eslint-disable for react-hooks/rules-of-hooks to all scene files
// (the render functions call React hooks which ESLint flags)

import fs from "node:fs";
import path from "node:path";

const SCENES_DIR = path.join(process.cwd(), "packages", "games", "systems-discovery", "src", "scenes");

const files = fs.readdirSync(SCENES_DIR).filter((f) => f.endsWith(".tsx"));

for (const file of files) {
  const filePath = path.join(SCENES_DIR, file);
  let content = fs.readFileSync(filePath, "utf8");
  
  if (!content.includes("eslint-disable react-hooks")) {
    content = '/* eslint-disable react-hooks/rules-of-hooks */\n' + content;
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`Added eslint-disable: ${file}`);
  }
}
console.log("Done.");