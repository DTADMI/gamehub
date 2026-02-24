# Architecture Overview

GameHub is now a single Next.js application with a modular package layout for games and shared UI.

## Structure

- `app/` - Next.js App Router routes and layouts
- `components/` - Shared components (including admin tooling)
- `lib/` - Supabase clients and types
- `packages/` - Game packages and shared platform utilities

## Data Layer

Supabase provides:

- Auth for admin access
- Postgres tables for resume and blog content
- RLS policies for public read + admin write

## Content Management

The `/admin` dashboard uses Supabase CRUD with a rich text editor to manage resume and blog content.
