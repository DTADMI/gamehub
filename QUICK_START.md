# 🚀 Quick Start Guide

Get GameHub running in **5 minutes**!

## Prerequisites Check

```bash
# Check Node.js version (should be 20+)
node --version

# Check if pnpm is available
pnpm --version

# If pnpm not found, enable it
corepack enable
```

## Step 1: Install Dependencies (2 min)

```bash
# Install all packages
pnpm install
```

## Step 2: Environment Setup (1 min)

```bash
# Copy environment file
cp .env.example .env.local

# The defaults work for local development!
# Edit .env.local only if you need custom ports or settings
```

## Step 3: Start Database (1 min)

```bash
# Start PostgreSQL and Redis
docker compose up -d postgres redis

# Wait for services to be healthy (check with)
docker compose ps
```

## Step 4: Setup Database (1 min)

```bash
# Generate Prisma client
pnpm prisma:generate

# Run database migrations
pnpm prisma:migrate

# Optional: Seed with example data
pnpm --filter @gamehub/api prisma:seed
```

## Step 5: Start Development Servers (<1 min)

```bash
# Start everything (frontend + backend)
pnpm dev
```

**That's it!** 🎉

## Access Your Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **API Docs**: http://localhost:8080/api/docs
- **Prisma Studio**: Run `pnpm prisma:studio`

## Verify Everything Works

### Frontend Test
1. Open http://localhost:3000
2. You should see the GameHub landing page
3. Navigate to `/games` to see available games

### Backend Test
```bash
# Test API health
curl http://localhost:8080/api/health

# Or visit in browser
# http://localhost:8080/api/docs (Swagger UI)
```

## Common Issues

### "Port already in use"

**Solution 1**: Change ports in `.env.local`
```env
APP_PORT=3001
API_PORT=8081
```

**Solution 2**: Kill existing processes
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### "Cannot connect to database"

```bash
# Check if PostgreSQL is running
docker compose ps postgres

# Restart if needed
docker compose restart postgres

# Check logs
docker compose logs postgres
```

### "Prisma Client not generated"

```bash
# Regenerate Prisma Client
pnpm prisma:generate

# If that doesn't work, clean and reinstall
pnpm clean
pnpm install
pnpm prisma:generate
```

### "Module not found" errors

```bash
# Clear everything and reinstall
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install
```

## Development Workflow

### Make Changes

```bash
# Frontend changes: apps/app/
# Backend changes: apps/api/
# Shared code: packages/shared/

# Both apps support hot reload!
```

### Run Tests

```bash
# All tests
pnpm test

# Specific package
pnpm --filter @gamehub/api test
pnpm --filter @gamehub/app test

# E2E tests
pnpm test:e2e
```

### Code Quality

```bash
# Lint
pnpm lint

# Format
pnpm format

# Type check
pnpm type-check
```

### Database Changes

```bash
# 1. Edit apps/api/prisma/schema.prisma
# 2. Create migration
pnpm --filter @gamehub/api prisma migrate dev --name your_change
# 3. Generate client
pnpm prisma:generate
```

## Useful Commands

```bash
# View all scripts
pnpm run

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Clean build artifacts
pnpm clean

# Reset database (⚠️ deletes all data)
pnpm --filter @gamehub/api prisma migrate reset
```

## Project Structure

```
gamehub/
├── apps/
│   ├── app/     ← Next.js frontend (port 3000)
│   └── api/     ← NestJS backend (port 8080)
├── packages/
│   ├── shared/  ← Shared code
│   └── games/   ← Game packages
└── docs/        ← Documentation
```

## Next Steps

1. ✅ You're running! Now explore:
   - 📖 [Full Setup Guide](./docs/SETUP.md)
   - 🏗️ [Architecture Docs](./docs/architecture-monorepo.md)
   - 🚀 [Deployment Guide](./docs/DEPLOYMENT.md)
   - 🤝 [Contributing](./CONTRIBUTING.md)

2. Try building a feature:
   - Add a new API endpoint
   - Create a new game component
   - Modify existing games

3. Run E2E tests:
   ```bash
   # Install Playwright browsers (first time)
   pnpm --filter @gamehub/app exec playwright install --with-deps

   # Run tests
   pnpm test:e2e
   ```

## Getting Help

- 📚 Check [documentation](./docs/)
- 🐛 Search [GitHub Issues](https://github.com/your-org/gamehub/issues)
- 📧 Email: dtadmi@gmail.com

## Development Tips

### VS Code Setup

Install recommended extensions:
- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes...

# Pre-commit hooks will run automatically
git commit -m "feat: add my feature"

# Push and create PR
git push origin feature/my-feature
```

### Performance

- Hot reload works for both frontend and backend
- Turborepo caches build outputs
- Changes in `packages/shared` trigger rebuilds

### Debugging

#### Frontend (Next.js)
- Use browser DevTools
- Add `console.log()` or `debugger`
- Check terminal for errors

#### Backend (NestJS)
```bash
# Run in debug mode
pnpm --filter @gamehub/api start:debug

# Attach debugger on port 9229
```

## Troubleshooting Checklist

- [ ] Node.js 20+ installed
- [ ] pnpm enabled (`corepack enable`)
- [ ] Dependencies installed (`pnpm install`)
- [ ] `.env.local` created
- [ ] Docker running
- [ ] PostgreSQL healthy (`docker compose ps`)
- [ ] Prisma client generated
- [ ] Migrations applied

Still stuck? Check the [detailed troubleshooting guide](./docs/SETUP.md#troubleshooting).

---

**Happy coding! 🎮**
