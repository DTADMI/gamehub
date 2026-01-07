# Base stage with pnpm
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY apps/app/package.json ./apps/app/
COPY packages/shared/package.json ./packages/shared/
COPY packages/games/*/package.json ./packages/games/
RUN pnpm install --frozen-lockfile

# Development stage
FROM base AS development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["pnpm", "--filter", "@gamehub/app", "dev"]

# Build stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @gamehub/app build

# Production stage
FROM node:20-alpine AS production
RUN apk add --no-cache dumb-init
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
USER node

# Copy standalone build
COPY --chown=node:node --from=builder /app/apps/app/.next/standalone ./
COPY --chown=node:node --from=builder /app/apps/app/.next/static ./apps/app/.next/static
COPY --chown=node:node --from=builder /app/apps/app/public ./apps/app/public

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["dumb-init", "node", "apps/app/server.js"]
