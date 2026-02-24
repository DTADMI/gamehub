# Package Architecture

GameHub keeps games and shared utilities in `packages/` while the app lives at the repo root.

## Packages

- `packages/game-platform` - shared game platform utilities, metadata, and layout components
- `packages/games/*` - individual games
- `packages/ui` - shared UI library

## App

The Next.js app imports packages directly and transpiles them via `next.config.ts`.
