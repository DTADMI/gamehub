# Base stage with pnpm
FROM node:20.20.0-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

# Development stage
FROM base AS development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 8080
CMD ["pnpm", "--filter", "@gamehub/api", "dev"]

# Build stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter @gamehub/api build
RUN pnpm deploy --filter=@gamehub/api --prod /prod/api

# Production stage
FROM node:20.20.0-alpine AS production
RUN apk add --no-cache dumb-init
WORKDIR /app
ENV NODE_ENV=production
USER node
COPY --chown=node:node --from=builder /prod/api .
EXPOSE 8080
CMD ["dumb-init", "node", "dist/main"]
