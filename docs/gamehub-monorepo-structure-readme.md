# GameHub Structure

GameHub is a single Next.js application with shared packages for games and UI.

```
app/                  # Next.js routes
components/           # Shared components
lib/                  # Supabase clients + types
packages/
  game-platform/      # Game platform utilities + metadata
  games/              # Individual games
  ui/                 # UI library
scripts/              # Supabase migrations
```
