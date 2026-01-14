#!/usr/bin/env python3
"""
Fix TypeScript implicit 'any' errors in quest-hunt.
"""

import re
import os
from pathlib import Path

def fix_file(filepath):
    """Add explicit any types to parameters with implicit 'any' type."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    modified = False

    # Fix ws parameter in WebSocket connection handler
    pattern = r"wss\.on\('connection',\s*\(ws,\s*request,\s*client\)\s*=>"
    if re.search(pattern, content):
        replacement = "wss.on('connection', (ws: any, request: any, client: any) =>"
        content = re.sub(pattern, replacement, content)
        modified = True

    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed: {filepath}")
        return True
    return False

def main():
    """Fix all TypeScript files with implicit 'any' errors."""
    base_dir = Path('B:/git/gamehub/packages/projects/quest-hunt/apps/web')

    # Find all TypeScript files
    patterns = ['**/*.ts', '**/*.tsx']
    files_to_check = []

    for pattern in patterns:
        files_to_check.extend(base_dir.glob(pattern))

    # Skip node_modules and .next
    files_to_check = [
        f for f in files_to_check
        if 'node_modules' not in str(f) and '.next' not in str(f)
    ]

    fixed_count = 0
    for filepath in files_to_check:
        if fix_file(filepath):
            fixed_count += 1

    print(f"\nFixed {fixed_count} files")

if __name__ == '__main__':
    main()
