// Add return types to exported React components and API routes
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ESLINT = spawn('npx', ['eslint', '.', '--format', 'json'], {
  cwd: resolve(import.meta.dirname, '..'),
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: true,
});

let stdout = '';
let stderr = '';
ESLINT.stdout.on('data', (c) => { stdout += c.toString(); });
ESLINT.stderr.on('data', (c) => { stderr += c.toString(); });

ESLINT.on('close', (code) => {
  if (code !== 0) {
    console.error('eslint exited with', code, stderr.slice(0, 500));
  }
  
  // Filter JSON from npm warnings
  const jsonStart = stdout.indexOf('[{');
  if (jsonStart === -1) { console.error('No JSON found'); process.exit(1); }
  const results = JSON.parse(stdout.substring(jsonStart));
  
  const fileWarnings = new Map();
  for (const r of results) {
    for (const m of r.messages) {
      if (m.ruleId !== '@typescript-eslint/explicit-module-boundary-types') continue;
      if (!m.message.includes('Missing return type on function')) continue;
      const f = r.filePath;
      if (!fileWarnings.has(f)) fileWarnings.set(f, []);
      fileWarnings.get(f).push({ line: m.line, col: m.column });
    }
  }
  
  const sorted = [...fileWarnings.entries()].sort((a, b) => b[1].length - a[1].length);
  let totalFixes = 0, filesFixed = 0, skipped = 0;
  
  for (const [file, warnings] of sorted) {
    let txt = readFileSync(file, 'utf8');
    let changed = false;
    
    const isTsx = file.endsWith('.tsx');
    const isRoute = file.includes('/api/') && file.endsWith('route.ts');
    if (!isTsx && !isRoute) { skipped += warnings.length; continue; }
    
    // Process from last to first to preserve positions
    for (const w of warnings.sort((a, b) => b.line - a.line)) {
      // Calculate position in text for line w.line
      let pos = 0;
      let line = 1;
      for (let i = 0; i < txt.length && line < w.line; i++) {
        if (txt[i] === '\n') line++;
        if (line < w.line) pos = i + 1;
      }
      
      // Find 'function' keyword near this position
      const searchStart = Math.max(0, pos - 300);
      const searchEnd = Math.min(txt.length, pos + 2000);
      const searchText = txt.substring(searchStart, searchEnd);
      
      // Find the function beginning — look for the first function at or after pos
      const funcRegex = /\b(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+(\w+)/g;
      let match, bestMatch = null, bestDist = Infinity;
      while ((match = funcRegex.exec(searchText)) !== null) {
        const absPos = searchStart + match.index;
        if (absPos >= pos - 20) {
          const dist = Math.abs(absPos - pos);
          if (dist < bestDist) { bestMatch = match; bestDist = dist; }
        }
      }
      
      // Also try const arrow: export const Name = (...) => {
      // and: const Name = (...) => {
      if (!bestMatch) {
        const arrowRegex = /\b(?:export\s+)?(?:default\s+)?(?:(?:async\s+)?function\s+(\w+)|const\s+(\w+)\s*[:=])/g;
        while ((match = arrowRegex.exec(searchText)) !== null) {
          const absPos = searchStart + match.index;
          if (absPos >= pos - 20) {
            const dist = Math.abs(absPos - pos);
            if (dist < bestDist) { bestMatch = match; bestDist = dist; }
          }
        }
      }
      
      if (!bestMatch) { skipped++; continue; }
      
      const funcAbsPos = searchStart + bestMatch.index;
      const funcEnd = searchStart + bestMatch.index + bestMatch[0].length;
      
      // Find the ( of params then matching )
      let parenStart = funcEnd;
      while (parenStart < txt.length && txt[parenStart] !== '(') parenStart++;
      if (txt[parenStart] !== '(') { skipped++; continue; }
      
      let depth = 1, parenEnd = parenStart;
      for (let i = parenStart + 1; i < Math.min(txt.length, parenStart + 3000); i++) {
        if (txt[i] === '(') depth++;
        else if (txt[i] === ')') { depth--; if (depth === 0) { parenEnd = i; break; } }
      }
      if (parenEnd === parenStart) { skipped++; continue; }
      
      // Check for existing return type `) :`
      let checkIdx = parenEnd + 1;
      while (checkIdx < txt.length && /[\s\n\r]/.test(txt[checkIdx])) checkIdx++;
      if (txt[checkIdx] === ':') { skipped++; continue; }
      
      // Determine return type
      let returnType = 'React.ReactNode';
      if (isRoute) {
        const beforeFunc = txt.substring(funcAbsPos, funcEnd);
        returnType = beforeFunc.includes('async') ? 'Promise<NextResponse>' : 'NextResponse';
      }
      
      // Insert after )
      txt = txt.substring(0, parenEnd + 1) + ': ' + returnType + txt.substring(parenEnd + 1);
      changed = true;
      totalFixes++;
    }
    
    if (changed) {
      writeFileSync(file, txt, 'utf8');
      filesFixed++;
    }
  }
  
  const totalW = [...fileWarnings.values()].reduce((s, ws) => s + ws.length, 0);
  console.log(`Fixed: ${totalFixes}/${totalW} in ${filesFixed} files (${skipped} skipped)`);
});