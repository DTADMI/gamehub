# Build Output & Generated Files

This document describes the build outputs and generated files in the GameHub monorepo.

## Generated Files (Git Ignored)

The following types of files are automatically generated during development and build processes and are **not committed** to version control:

### 1. Compiled JavaScript Files

**Location**: Anywhere alongside TypeScript source files
- `**/*.js` - Compiled from `.ts` or `.tsx` files
- `**/*.js.map` - Source maps

**Exception**: Configuration files are committed:
- `*.config.js` (next.config.js, tailwind.config.js, etc.)
- `/scripts/**/*.js`
- `/cypress/**/*.js`

**Why**: TypeScript is the source of truth. Compiled JS files are build artifacts that can be regenerated from TS sources at any time.

### 2. Build Directories

- `.next/` - Next.js build output
- `dist/` - Distribution bundles
- `build/` - Build artifacts
- `out/` - Next.js static export output
- `.turbo/` - Turborepo cache

### 3. Dependency Directories

- `node_modules/` - NPM packages
- `.pnpm-store/` - pnpm global store

### 4. Cache & Temp Files

- `*.tsbuildinfo` - TypeScript incremental compilation info
- `.cache/` - Various tool caches
- `.parcel-cache/` - Parcel bundler cache

### 5. Test Outputs

- `coverage/` - Test coverage reports
- `test-results/` - Playwright test results
- `playwright-report/` - Playwright HTML reports

## Build Commands

### Development

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev

# Build frontend
pnpm --filter @gamehub/frontend build

# Build API
pnpm --filter @gamehub/api build
```

### Production

```bash
# Build all packages
pnpm build

# Build specific workspace
pnpm --filter <workspace-name> build
```

## Clean Build

To remove all generated files and start fresh:

```bash
# Remove node_modules and lock files
pnpm clean

# Remove build outputs
rm -rf .next dist build out .turbo

# Reinstall
pnpm install
```

## TypeScript Compilation

The monorepo uses TypeScript exclusively for source code. JavaScript files that appear alongside TypeScript files are compilation artifacts and should never be edited directly.

### Source Files (Committed)
- `*.ts` - TypeScript files
- `*.tsx` - TypeScript + JSX files
- `*.d.ts` - TypeScript declaration files

### Generated Files (Not Committed)
- `*.js` - Compiled JavaScript
- `*.js.map` - Source maps

## CI/CD Pipeline

The CI/CD pipeline automatically:
1. Installs dependencies
2. Compiles TypeScript
3. Runs tests
4. Builds production bundles
5. Deploys artifacts

**No generated files need to be committed** for the pipeline to work.

## Troubleshooting

### "Module not found" errors

If you see errors about missing `.js` files:
1. Ensure TypeScript compilation is working: `pnpm tsc --noEmit`
2. Check that source `.ts`/`.tsx` files exist
3. Verify your tsconfig.json configuration
4. Clear cache and rebuild: `rm -rf .next .turbo && pnpm build`

### Stale JS files

If you have old `.js` files causing issues:
```bash
# Remove all compiled JS files (safe - they'll regenerate)
find packages -name "*.js" -path "*/src/*" -not -path "*/node_modules/*" -type f -delete
```

## Best Practices

1. ✅ **DO** commit TypeScript source files (`.ts`, `.tsx`)
2. ✅ **DO** commit configuration files (`.config.js`)
3. ❌ **DON'T** commit compiled JavaScript in `src/` directories
4. ❌ **DON'T** edit generated `.js` files directly
5. ✅ **DO** use `pnpm clean` before fresh installs
6. ✅ **DO** add new build outputs to `.gitignore`
