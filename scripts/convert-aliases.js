const fs = require("fs");
const path = require("path");
const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;

// Get all TypeScript/JavaScript files in the project
function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and .next directories
      if (["node_modules", ".next", ".turbo", ".git", "dist", "build"].includes(file)) {
        return;
      }
      getFiles(filePath, fileList);
    } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Convert path alias to relative path
function toRelativePath(from, to, currentFile) {
  const relativePath = path.relative(
    path.dirname(currentFile),
    path.resolve(path.dirname(from), to),
  );

  // Ensure the path starts with ./ or ../
  return relativePath.startsWith(".") ? relativePath : "./" + relativePath;
}

// Process a single file
function processFile(filePath) {
  try {
    const code = fs.readFileSync(filePath, "utf8");

    // Parse the code into an AST
    const ast = parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript", "classProperties", "decorators-legacy"],
    });

    let hasChanges = false;

    // Traverse the AST
    traverse(ast, {
      ImportDeclaration(path) {
        const source = path.node.source.value;

        // Skip if not an alias path
        if (typeof source !== "string" || !source.startsWith("@/")) {
          return;
        }

        // Convert @/components/Button to relative path
        const relativePath = toRelativePath(filePath, source.replace("@/", ""), filePath);

        // Update the import path
        path.node.source.value = relativePath;
        hasChanges = true;
      },

      // Handle dynamic imports
      CallExpression(path) {
        if (
          (path.node.callee.type === "Import" ||
            (path.node.callee.type === "Identifier" && path.node.callee.name === "require")) &&
          path.node.arguments.length > 0 &&
          path.node.arguments[0].type === "StringLiteral"
        ) {
          const source = path.node.arguments[0].value;

          if (source.startsWith("@/")) {
            const relativePath = toRelativePath(filePath, source.replace("@/", ""), filePath);

            path.node.arguments[0].value = relativePath;
            hasChanges = true;
          }
        }
      },
    });

    // If changes were made, write the file back
    if (hasChanges) {
      const output = generate(ast, {
        retainLines: true,
        comments: true,
        sourceMaps: false,
        sourceFileName: filePath,
      });

      fs.writeFileSync(filePath, output.code, "utf8");
      console.log(`Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Main function
function run() {
  const targetDir = process.argv[2] || process.cwd();
  console.log(`Processing files in: ${targetDir}`);

  const files = getFiles(targetDir);
  console.log(`Found ${files.length} files to process`);

  files.forEach((file) => {
    processFile(file);
  });

  console.log("Conversion complete!");
}

run();
