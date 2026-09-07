// Script: Safely remove unused imports flagged by ESLint
// Only handles named import removals — won't touch variables, destructuring, or args
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const ESLINT_JSON = execSync('npx eslint . --format json 2>NUL', { shell: true, maxBuffer: 50 * 1024 * 1024, encoding: 'utf8' });
const results = JSON.parse(ESLINT_JSON);

const fixes = {};

for (const fileResult of results) {
  for (const msg of fileResult.messages) {
    if (msg.ruleId !== '@typescript-eslint/no-unused-vars') continue;
    // Only handle imports — these are safe to remove
    if (!msg.message.includes('is defined but never used')) continue;
    const file = fileResult.filePath;
    if (!fixes[file]) fixes[file] = [];
    fixes[file].push({ line: msg.line, message: msg.message });
  }
}

let totalFixes = 0;
let filesFixed = 0;

for (const [file, warnings] of Object.entries(fixes)) {
  let lines = readFileSync(file, 'utf8').split('\n');
  let changed = false;
  
  for (const w of warnings.sort((a, b) => b.line - a.line)) {
    const lineIdx = w.line - 1;
    if (lineIdx < 0 || lineIdx >= lines.length) continue;
    const line = lines[lineIdx];
    
    // Only process import lines
    if (!line.trim().startsWith('import ')) continue;
    
    const varMatch = w.message.match(/^'([^']+)'/);
    if (!varMatch) continue;
    const varName = varMatch[1];
    
    // Skip if it mentions "Allowed unused" (it's a function parameter, not an import)
    if (w.message.includes('unused args')) continue;
    
    if (line.includes('{') && line.includes('}')) {
      // Named import: import { A, B, C } from '...'
      // Try: import { X } from '...' — single binding → remove entire line
      // Try: import { A, X, B } — remove X and adjust commas
      
      // Check if it's a single import
      const bindings = line.match(/\{([^}]+)\}/)?.[1] || '';
      const parts = bindings.split(',').map(s => s.trim()).filter(Boolean);
      
      if (parts.length === 1 && parts[0] === varName) {
        // Single import → remove whole line
        lines[lineIdx] = '';
        changed = true;
        totalFixes++;
        continue;
      }
      
      if (parts.includes(varName)) {
        // Remove this specific binding
        const openIdx = line.indexOf('{');
        const closeIdx = line.indexOf('}');
        const before = line.substring(0, openIdx + 1);
        const bindingsStr = line.substring(openIdx + 1, closeIdx);
        const after = line.substring(closeIdx);
        
        // Remove the var and clean up commas
        let newBindings = bindingsStr
          .split(',')
          .map(s => s.trim())
          .filter(s => s !== varName && s !== '')
          .join(', ');
        
        lines[lineIdx] = before + ' ' + newBindings + ' ' + after;
        changed = true;
        totalFixes++;
      }
    } else {
      // Default import: import X from '...'
      // Only remove if it's a simple match
      if (line.match(new RegExp(`^import\\s+${varName}\\s+from`))) {
        lines[lineIdx] = '';
        changed = true;
        totalFixes++;
      }
    }
  }
  
  if (changed) {
    // Clean up: remove 2+ consecutive blank lines
    const cleaned = [];
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === '' && i > 0 && cleaned[cleaned.length - 1]?.trim() === '') continue;
      cleaned.push(lines[i]);
    }
    writeFileSync(file, cleaned.join('\n'), 'utf8');
    filesFixed++;
    console.log(`  ${file.split('/').pop()}: removed unused import(s)`);
  }
}

console.log(`\nDone: ${totalFixes} import removals in ${filesFixed} files`);