#!/bin/bash
# Fix imports based on file depth

find src -type f \( -name "*.tsx" -o -name "*.ts" \) | while read file; do
  # Count directory depth from src/
  depth=$(echo "$file" | grep -o "/" | wc -l)
  depth=$((depth - 1)) # Subtract 1 for src/ itself
  
  # Build relative path (each level adds ../)
  rel_path=""
  for ((i=0; i<depth+2; i++)); do
    rel_path="${rel_path}../"
  done
  rel_path="${rel_path}../shared/src"
  
  # Replace imports
  sed -i "s|from '../../../../shared/src'|from '${rel_path}'|g" "$file"
  sed -i "s|from '../../../../shared/src/|from '${rel_path}/|g" "$file"
done
