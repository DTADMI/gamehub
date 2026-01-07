# GameHub - Setup Guide

This guide will help you set up the GameHub monorepo for local development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 20.0.0 ([Download](https://nodejs.org/))
- **pnpm** >= 9.0.0 (Automatically managed via Corepack)
- **Docker** & **Docker Compose** ([Download](https://www.docker.com/))
- **Git** ([Download](https://git-scm.com/))

### Enable Corepack (for pnpm)

```bash
corepack enable
corepack prepare pnpm@9.15.4 --activate
```

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/gamehub.git
cd gamehub
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and update the values as needed. The defaults should work for local development.

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Start Database Services

```bash
docker compose up -d postgres redis
```

Wait for services to be healthy:

```bash
docker compose ps
```

### 5. Setup Database

Generate Prisma client and run migrations:

```bash
pnpm prisma:generate
pnpm prisma:migrate
```

Optional - seed the database:

```bash
pnpm --filter @gamehub/api prisma:seed
```

### 6. Start Development Servers

Start all services (frontend + backend):

```bash
pnpm dev
```

Or start individually:

```bash
# Backend only
pnpm dev:api

# Frontend only
pnpm dev:app
```

### 7. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **API Documentation**: http://localhost:8080/api/docs (Swagger)

## Development Workflow

### Available Scripts

From the root directory:

```bash
# Development
pnpm dev              # Start all apps in development mode
pnpm dev:app          # Start frontend only
pnpm dev:api          # Start backend only

# Build
pnpm build            # Build all packages
pnpm build:app        # Build frontend only
pnpm build:api        # Build backend only

# Testing
pnpm test             # Run all tests
pnpm test:watch       # Run tests in watch mode
pnpm test:e2e         # Run E2E tests

# Code Quality
pnpm lint             # Lint all packages
pnpm lint:fix         # Fix linting issues
pnpm format           # Format code with Prettier
pnpm format:check     # Check code formatting
pnpm type-check       # Run TypeScript type checking

# Database
pnpm prisma:generate  # Generate Prisma client
pnpm prisma:migrate   # Run database migrations
pnpm prisma:studio    # Open Prisma Studio

# Cleanup
pnpm clean            # Clean build artifacts
pnpm clean:turbo      # Clean Turbo cache
```

### Package-Specific Commands

```bash
# Run commands for specific packages
pnpm --filter @gamehub/app <command>
pnpm --filter @gamehub/api <command>
pnpm --filter @games/shared <command>
```

## Project Structure

```
gamehub/
├── apps/
│   ├── app/              # Next.js frontend
│   └── api/              # NestJS backend
├── packages/
│   ├── shared/           # Shared utilities and types
│   ├── games/            # Individual game packages
│   ├── projects/         # Full-stack project packages
│   └── ui/               # UI component library
├── docs/                 # Documentation
├── .github/              # GitHub Actions workflows
└── docker-compose.yml    # Docker services configuration
```

## Docker Development

### Full Stack with Docker

Start everything with Docker Compose:

```bash
docker compose up -d
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- API (port 8080)
- Frontend (port 3000)

View logs:

```bash
docker compose logs -f
```

Stop all services:

```bash
docker compose down
```

Stop and remove volumes:

```bash
docker compose down -v
```

## Database Management

### Prisma Commands

```bash
# Generate Prisma Client
pnpm prisma:generate

# Create a new migration
pnpm --filter @gamehub/api prisma migrate dev --name your_migration_name

# Apply migrations
pnpm prisma:migrate

# Reset database (WARNING: deletes all data)
pnpm --filter @gamehub/api prisma migrate reset

# Open Prisma Studio
pnpm prisma:studio
```

### Database Schema Changes

1. Edit `apps/api/prisma/schema.prisma`
2. Create migration: `pnpm --filter @gamehub/api prisma migrate dev --name your_change`
3. Generate client: `pnpm prisma:generate`
4. Commit both schema and migration files

## Testing

### Unit Tests

```bash
# Run all unit tests
pnpm test

# Run tests for specific package
pnpm --filter @gamehub/api test
pnpm --filter @gamehub/app test

# Watch mode
pnpm test:watch
```

### E2E Tests

```bash
# Install Playwright browsers (first time only)
pnpm --filter @gamehub/app exec playwright install --with-deps

# Run E2E tests
pnpm test:e2e

# Run with UI
pnpm --filter @gamehub/app test:e2e:ui

# Debug mode
pnpm --filter @gamehub/app test:e2e:debug
```

## Troubleshooting

### Port Already in Use

If ports 3000 or 8080 are already in use:

1. Kill the processes using those ports
2. Or change ports in `.env.local`:
   ```
   APP_PORT=3001
   API_PORT=8081
   ```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker compose ps postgres

# View PostgreSQL logs
docker compose logs postgres

# Restart database
docker compose restart postgres
```

### Prisma Client Issues

```bash
# Regenerate Prisma client
pnpm prisma:generate

# Clear node_modules and reinstall
pnpm clean
pnpm install
```

### TypeScript Errors

```bash
# Type check all packages
pnpm type-check

# Clear and rebuild
pnpm clean
pnpm build
```

### Clear All Caches

```bash
# Clean build artifacts
pnpm clean

# Clean Turbo cache
pnpm clean:turbo

# Remove node_modules and reinstall
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install
```

## IDE Setup

### VS Code

Recommended extensions:
- ESLint
- Prettier
- Prisma
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense

Settings (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Next Steps

- Read the [Architecture Documentation](./architecture-monorepo.md)
- Check out the [API Documentation](http://localhost:8080/api/docs)
- Explore the [Game Development Guide](./new-games-development-plan.md)
- Review [Docker Centralization](./docker-centralization.md)

## Getting Help

- Check existing [GitHub Issues](https://github.com/your-org/gamehub/issues)
- Review the [Documentation](./README.md)
- Contact the team
