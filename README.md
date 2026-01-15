# 🎮 GameHub - Modern Gaming, Projects & Personal Platform

> A comprehensive full-stack monorepo showcasing Next.js 16 frontend, NestJS 11 backend, with 17 integrated games, 5 full-stack projects including a personal blog platform for reviews and commentary.

[![CI](https://github.com/your-org/gamehub/workflows/CI/badge.svg)](https://github.com/your-org/gamehub/actions)
[![E2E](https://github.com/your-org/gamehub/workflows/E2E%20Tests/badge.svg)](https://github.com/your-org/gamehub/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

## ✨ Features

### Core Platform

- 🎯 **Modern Tech Stack**: Next.js 16, React 19, NestJS 11, Prisma, PostgreSQL
- 🏗️ **Monorepo Architecture**: Turborepo + pnpm workspaces with optimized package structure
- 🎨 **UI Components**: @gamehub/ui (shadcn/ui) + Tailwind CSS v4
- 🔐 **Hybrid Authentication**: NextAuth.js (projects) + Firebase Auth (games) + Supabase Auth (geospatial projects)
- 🌐 **Real-time**: WebSockets with Socket.io
- 🧪 **Testing**: Vitest, Playwright, Jest with 85% backend + 75% frontend coverage
- 🐳 **Docker**: Development and production containers
- 🚀 **CI/CD**: GitHub Actions workflows
- 🌍 **i18n**: Multi-language support (EN/FR)
- ♿ **Accessibility**: WCAG 2.1 AA compliant
- 📱 **Mobile-First**: Responsive and touch-optimized

### Games, Projects & Content

- 🎮 **17 Playable Games**: Including arcade, board, puzzle, and narrative adventures
- 📦 **3 Specialized Packages**: @gamehub/ui, @gamehub/game-platform, @games/pointclick-engine
- 🗂️ **5 Full-Stack Projects**: LibraKeeper, QuestHunt, Personal Blog, StoryForge, VelvetGalaxy
- ✍️ **Personal Blog Platform**: Reviews, analysis, and commentary on politics, entertainment, tech
- 🎭 **Narrative Engine**: Custom point-and-click engine with puzzle systems
- 📊 **Bundle Optimization**: 40-60% reduction through package splitting strategy

## 🎯 Current State & Objectives

**GameHub** is a comprehensive full-stack platform that serves as both a showcase of modern web development techniques and a personal hub for gaming, project management, and content creation. The platform demonstrates expertise in monorepo architecture, TypeScript development, and modern JavaScript frameworks while providing practical applications for entertainment, productivity, and personal expression.

### Application Description & Purpose

GameHub is designed as a multi-faceted digital platform that combines:

**🎮 Gaming Hub**: A diverse collection of 17 games spanning arcade classics (Snake, Breakout, Tetris), strategic board games (Chess, Checkers), puzzle challenges (Memory, Knitzy), and immersive narrative adventures (Rite of Discovery, Toymaker Escape, Systems Discovery). Each game features polished gameplay, responsive controls, leaderboards, and multilingual support (EN/FR).

**🗂️ Full-Stack Projects**: Production-ready applications including LibraKeeper (personal library management with budget tracking), QuestHunt (geocaching social network with real-time maps and PostGIS), StoryForge (collaborative writing platform with real-time editing), and VelvetGalaxy (lifestyle social network).

**✍️ Personal Blog & Reviews**: A content management system for sharing personal insights, analysis, and reviews on:

- **Political Analysis**: Platform comparisons, policy reviews, civic commentary
- **Entertainment Reviews**: Movies, anime, TV series, documentaries
- **Music Reviews**: Albums, concerts, artist spotlights, genre exploration
- **Tech Commentary**: Software reviews, development insights, industry trends
- **Personal Essays**: Thoughts, experiences, and creative writing

**🏗️ Technical Showcase**: Demonstrates modern development practices including:

- Monorepo architecture with Turborepo and pnpm workspaces
- Hybrid authentication strategies (NextAuth, Firebase, Supabase)
- Bundle optimization through strategic package splitting
- Comprehensive testing (Vitest, Playwright, Jest)
- CI/CD pipelines with GitHub Actions
- Multi-tenant architecture with independent deployments

### Core Objectives

1. **Demonstrate Technical Excellence**: Showcase proficiency in modern web technologies, architectural patterns, and development best practices
2. **Provide Entertainment**: Offer a diverse range of quality games for casual and dedicated players
3. **Enable Productivity**: Deliver practical tools for personal organization and project management
4. **Foster Creativity**: Support writing, content creation, and personal expression through the blog platform
5. **Share Knowledge**: Provide insightful commentary and reviews to inform and engage readers
6. **Maintain Efficiency**: Optimize for performance, cost-effectiveness ($20-40/month), and developer experience

### What's Implemented ✅

- **17 games** across multiple genres (arcade, board, puzzle, narrative)
- **2 production projects** (LibraKeeper, QuestHunt) - fully deployed
- **1 active development project** (Personal Blog) - in planning/early development
- **3 specialized packages** for optimized bundle sizes (@gamehub/ui, @gamehub/game-platform, @games/pointclick-engine)
- **Hybrid architecture** with Firebase (games), Supabase (geospatial), and Prisma (relational)
- **Comprehensive testing** with Vitest, Playwright, and Jest
- **Full CI/CD pipeline** with GitHub Actions

### Current Focus 🔨

- **Bundle Optimization**: Recently completed package splitting (40-60% size reduction expected)
- **Personal Blog Development**: Building content management system for reviews and commentary
- **Admin Dashboard**: Planning unified management interface (see [requirements](./docs/ADMIN_DASHBOARD_REQUIREMENTS.md))
- **New Projects**: StoryForge (writing platform) and VelvetGalaxy (lifestyle network) in development

### Key Achievements 📊

- **Package Architecture**: Reduced dependencies from 87 to 23 for UI consumers
- **Independent Projects**: Each project deployable separately with optimized stack
- **Cost Efficiency**: $20-40/month for entire platform (optimal)
- **Modern Stack**: Next.js 16, React 19, NestJS 11, TypeScript 5.7

## 📋 Table of Contents

- [Current State & Objectives](#-current-state--objectives)
- [Quick Start](#-quick-start)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Development](#-development)
- [Testing](#-testing)
- [Games & Projects](#-games--projects)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Quick Start

Get up and running in 5 minutes:

```bash
# Clone the repository
git clone https://github.com/your-org/gamehub.git
cd gamehub

# Enable pnpm (if not already enabled)
corepack enable

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Start database services
docker compose up -d postgres redis

# Setup database
pnpm prisma:generate
pnpm prisma:migrate

# Start development servers
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app!

## 📦 Prerequisites

- **Node.js** >= 20.0.0
- **pnpm** >= 9.0.0 (managed via Corepack)
- **Docker** and **Docker Compose**
- **Git**

### System Requirements

- **OS**: Windows 10+, macOS 11+, or Linux
- **RAM**: 8GB minimum, 16GB recommended
- **Disk**: 5GB free space

## 📥 Installation

### 1. Clone and Setup

```bash
git clone https://github.com/your-org/gamehub.git
cd gamehub
corepack enable
pnpm install
```

### 2. Environment Configuration

Create `.env.local` from the example:

```bash
cp .env.example .env.local
```

Key environment variables:

```env
# Database
DATABASE_URL=postgresql://gamehub:password@localhost:5432/gamehub

# API
API_PORT=8080
JWT_SECRET=your-secret-key

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXTAUTH_SECRET=your-nextauth-secret
```

See [.env.example](./.env.example) for all available options.

### 3. Database Setup

```bash
# Start PostgreSQL and Redis
docker compose up -d postgres redis

# Run migrations
pnpm prisma:generate
pnpm prisma:migrate

# Optional: Seed database
pnpm --filter @gamehub/api prisma:seed
```

## 💻 Development

### Start Development Servers

```bash
# All services
pnpm dev

# Frontend only (port 3000)
pnpm dev:app

# Backend only (port 8080)
pnpm dev:api
```

### Available Commands

| Command           | Description                |
| ----------------- | -------------------------- |
| `pnpm dev`        | Start all apps in dev mode |
| `pnpm build`      | Build all packages         |
| `pnpm test`       | Run all tests              |
| `pnpm lint`       | Lint codebase              |
| `pnpm format`     | Format code with Prettier  |
| `pnpm type-check` | Run TypeScript checks      |
| `pnpm clean`      | Clean build artifacts      |

### Package-Specific Commands

```bash
# Work with specific packages
pnpm --filter @gamehub/app <command>
pnpm --filter @gamehub/api <command>
pnpm --filter @games/snake <command>
```

### Hot Reload

Both frontend and backend support hot module replacement:

- **Frontend**: Changes reflect instantly
- **Backend**: NestJS watches for file changes

## 🧪 Testing

### Unit & Integration Tests

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm --filter @gamehub/api test:cov
```

### E2E Tests

```bash
# Install Playwright (first time)
pnpm --filter @gamehub/app exec playwright install --with-deps

# Run E2E tests
pnpm test:e2e

# UI mode
pnpm --filter @gamehub/app test:e2e:ui

# Debug
pnpm --filter @gamehub/app test:e2e:debug
```

## 🐳 Docker

### Development with Docker

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

Services:

- **Frontend**: http://localhost:3000
- **API**: http://localhost:8080
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### Production Build

```bash
# Build images
docker compose -f docker-compose.prod.yml build

# Run production stack
docker compose -f docker-compose.prod.yml up -d
```

## 🚀 Deployment

### Build for Production

```bash
pnpm build
```

### Deploy to Cloud

The project includes GitHub Actions workflows for automated deployment:

- **CI**: Linting, testing, and building
- **E2E**: End-to-end testing
- **Deploy**: Docker image building and deployment

See [.github/workflows](./.github/workflows) for workflow configurations.

### Supported Platforms

- **Frontend**: Vercel, Netlify, AWS Amplify, Cloud Run
- **Backend**: AWS ECS, Google Cloud Run, Railway, Render
- **Database**: Supabase, AWS RDS, Google Cloud SQL

## 📁 Project Structure

```
gamehub/
├── apps/
│   ├── frontend/                        # @gamehub/frontend - Next.js 16 (main app)
│   │   ├── app/                        # App Router pages
│   │   │   ├── (auth)/                # Auth pages (login, register)
│   │   │   ├── games/                 # Game launcher & routes
│   │   │   ├── projects/              # Project routes
│   │   │   ├── leaderboard/           # Leaderboards
│   │   │   └── admin/                 # Admin dashboard (planned)
│   │   ├── components/                # Shared React components
│   │   ├── lib/                       # Client utilities
│   │   ├── public/                    # Static assets
│   │   └── package.json
│   └── api/                            # @gamehub/api - NestJS 11 backend
│       ├── src/
│       │   ├── modules/               # Feature modules
│       │   │   ├── auth/              # Authentication (JWT, NextAuth)
│       │   │   ├── games/             # Game services
│       │   │   └── admin/             # Admin API (planned)
│       │   ├── common/                # Shared utilities
│       │   └── main.ts                # App entry point
│       ├── prisma/
│       │   ├── schema.prisma          # Unified database schema
│       │   ├── migrations/            # Database migrations
│       │   └── seed.ts                # Seed data
│       ├── test/                      # Backend tests
│       └── package.json
│
├── packages/
│   ├── ui/                             # @gamehub/ui (23 deps)
│   │   ├── src/
│   │   │   ├── components/            # 55 shadcn/ui components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   └── ... (52 more)
│   │   │   ├── hooks/                 # use-mobile, use-toast
│   │   │   └── lib/                   # utils (cn function)
│   │   └── package.json
│   │
│   ├── game-platform/                  # @gamehub/game-platform (~70 deps)
│   │   ├── src/
│   │   │   ├── components/            # Game infrastructure
│   │   │   │   ├── GameContainer.tsx
│   │   │   │   ├── GameShell.tsx
│   │   │   │   ├── GameHUD.tsx
│   │   │   │   └── GameCard.tsx
│   │   │   ├── contexts/              # React contexts
│   │   │   │   ├── GameContext.tsx
│   │   │   │   ├── SoundContext.tsx
│   │   │   │   └── AuthContext.tsx
│   │   │   ├── lib/
│   │   │   │   ├── firebase/          # Firebase integration
│   │   │   │   ├── i18n/              # Internationalization
│   │   │   │   └── sound/             # Sound manager (Howler.js)
│   │   │   └── metadata/              # Game registry
│   │   └── package.json
│   │
│   ├── pointclick-engine/              # @games/pointclick-engine (2 deps)
│   │   ├── src/
│   │   │   ├── core/                  # Game engine
│   │   │   │   ├── Engine.ts
│   │   │   │   ├── SceneManager.ts
│   │   │   │   └── Persistence.ts
│   │   │   ├── puzzles/               # Puzzle systems
│   │   │   │   ├── gears/
│   │   │   │   ├── pipes/
│   │   │   │   ├── wires/
│   │   │   │   ├── keypads/
│   │   │   │   └── sequences/
│   │   │   ├── react/                 # React components
│   │   │   │   ├── DialogueBox.tsx
│   │   │   │   ├── InventoryBar.tsx
│   │   │   │   └── SceneController.tsx
│   │   │   └── i18n/                  # Narrative translations (EN/FR)
│   │   └── package.json
│   │
│   ├── games/                          # Individual game packages (17 total)
│   │   ├── _engine/                   # @games/engine - Base engine framework
│   │   ├── snake/                     # @games/snake - 2D/3D snake
│   │   ├── breakout/                  # @games/breakout - Brick breaker
│   │   ├── chess/                     # @games/chess - Chess
│   │   ├── checkers/                  # @games/checkers - Checkers
│   │   ├── memory/                    # @games/memory - Card matching
│   │   ├── bubble-pop/                # @games/bubble-pop - Bubble shooter
│   │   ├── knitzy/                    # @games/knitzy - Pattern matching
│   │   ├── tetris/                    # @games/tetris - Block puzzle
│   │   ├── platformer/                # @games/platformer (in dev)
│   │   ├── tower-defense/             # @games/tower-defense (in dev)
│   │   ├── rite-of-discovery/         # @games/rite-of-discovery (narrative)
│   │   ├── systems-discovery/         # @games/systems-discovery (narrative)
│   │   ├── toymaker-escape/           # @games/toymaker-escape (narrative)
│   │   ├── elemental-conflux/         # @games/elemental-conflux (emerging)
│   │   ├── chrono-shift/              # @games/chrono-shift (emerging)
│   │   └── quantum-architect/         # @games/quantum-architect (emerging)
│   │
│   ├── projects/                       # Full-stack project packages (5 total)
│   │   ├── libra-keeper/              # @projects/libra-keeper ✅
│   │   │   ├── app/                   # Next.js 16 app
│   │   │   ├── components/            # Local UI components
│   │   │   ├── lib/                   # Utilities
│   │   │   └── package.json           # Prisma, NextAuth
│   │   ├── quest-hunt/                # @projects/quest-hunt ✅
│   │   │   ├── app/                   # Next.js 16 app
│   │   │   ├── components/            # Local UI components
│   │   │   ├── lib/                   # Supabase client
│   │   │   └── package.json           # Supabase (PostGIS)
│   │   ├── personal-blog/             # @projects/personal-blog 🟡
│   │   │   ├── app/                   # Next.js 16 app
│   │   │   │   ├── blog/             # Blog routes
│   │   │   │   ├── admin/            # Content management
│   │   │   │   └── api/              # API routes
│   │   │   ├── components/            # Blog components
│   │   │   │   ├── editor/           # Rich text editor
│   │   │   │   ├── post/             # Post display
│   │   │   │   └── layout/           # Blog layout
│   │   │   ├── content/               # MDX content files
│   │   │   ├── lib/                   # Utilities, MDX processor
│   │   │   └── package.json           # Prisma, MDX, NextAuth
│   │   ├── story-forge/               # @projects/story-forge 🟡
│   │   │   └── package.json           # (schema defined, pending)
│   │   └── velvet-galaxy/             # @projects/velvet-galaxy 🔜
│   │       └── package.json           # (planning phase)
│   │
│   ├── projects-metadata/              # @gamehub/projects-metadata
│   │   └── src/                       # Project registry and manifests
│   │
│   └── tsconfig/                       # @gamehub/tsconfig
│       └── base.json                  # Shared TypeScript configs
│
├── docs/                               # Documentation
│   ├── PACKAGE_ARCHITECTURE.md        # ⭐ Package structure details
│   ├── action-plan.md                 # ⭐ Development roadmap
│   ├── ADMIN_DASHBOARD_REQUIREMENTS.md
│   ├── ARCHITECTURE_STRATEGY.md
│   ├── ARCHITECTURE_OPTIONS_ANALYSIS.md
│   ├── GAME_ENGINE_STRATEGY.md
│   ├── SETUP.md
│   ├── DEPLOYMENT.md
│   └── ...                            # Additional docs
│
├── tests/                              # Unit tests (Vitest)
│   ├── pointclick.*.test.ts           # Point-click engine tests
│   ├── *.test.ts                      # Game logic tests
│   └── ...
│
├── tests-e2e/                          # E2E tests (Playwright)
│   ├── smoke.spec.ts                  # Smoke tests
│   ├── *.spec.ts                      # Game-specific tests
│   └── global-setup.ts
│
├── .github/
│   └── workflows/                     # CI/CD pipelines
│       ├── ci.yml                     # Lint, test, build
│       └── e2e.yml                    # E2E tests
│
├── docker-compose.yml                  # PostgreSQL, Redis
├── turbo.json                          # Turborepo configuration
├── pnpm-workspace.yaml                 # Workspace definitions
├── package.json                        # Root dependencies
├── tsconfig.json                       # Root TypeScript config
└── README.md                           # This file
```

## 🛠️ Tech Stack

### Frontend

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript 5.7](https://www.typescriptlang.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Auth**: [NextAuth.js](https://next-auth.js.org/)
- **State**: React Context + Hooks
- **Testing**: [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/)

### Backend

- **Framework**: [NestJS 11](https://nestjs.com/)
- **Language**: [TypeScript 5.7](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL 16](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Cache**: [Redis](https://redis.io/)
- **Auth**: JWT + Passport
- **Validation**: class-validator + class-transformer
- **WebSockets**: [Socket.io](https://socket.io/)
- **API Docs**: [Swagger/OpenAPI](https://swagger.io/)
- **Testing**: [Jest](https://jestjs.io/) + [Supertest](https://github.com/visionmedia/supertest)

### DevOps & Tools

- **Monorepo**: [Turborepo](https://turbo.build/)
- **Package Manager**: [pnpm](https://pnpm.io/)
- **Containerization**: [Docker](https://www.docker.com/)
- **CI/CD**: [GitHub Actions](https://github.com/features/actions)
- **Linting**: [ESLint](https://eslint.org/)
- **Formatting**: [Prettier](https://prettier.io/)
- **Git Hooks**: [Husky](https://typicode.github.io/husky/)

## 🎮 Games & Projects

### Arcade & Board Games (10)

**Classic Arcade**:

- **Snake**: 2D canvas + optional Three.js 3D mode, multiple control schemes
- **Breakout**: Brick breaker with power-ups, particles, and advanced physics
- **Bubble Pop**: Bubble shooter with combo mechanics
- **Tetris**: Block puzzle with modern controls

**Board & Puzzle Games**:

- **Chess**: Full chess implementation with move validation
- **Checkers**: American checkers with AI opponent
- **Memory**: Card matching game with smooth animations
- **Knitzy**: Pattern matching puzzle game

**Advanced Games**:

- **Platformer**: Side-scrolling platformer (in development)
- **Tower Defense**: Strategic tower placement game (in development)

### Narrative Adventures (3)

Point-and-click games powered by @games/pointclick-engine:

- **Rite of Discovery**: African prehistory educational adventure with multiple puzzle systems (EN/FR)
- **Systems Discovery**: Human body systems exploration game with interactive diagrams (EN/FR)
- **Toymaker Escape**: Multi-route puzzle escape room with gear, pipe, and wire puzzles (EN/FR)

### Emerging Games (4)

- **Elemental Conflux**: Elemental strategy game (in development)
- **Chrono Shift**: Time-based puzzle game (in development)
- **Quantum Architect**: Quantum mechanics puzzle game (in development)
- **Game Engine**: Base game engine framework for rapid development

### Full-Stack Projects (4)

**Production Ready**:

- **LibraKeeper** 📚: Personal library management system
  - Stack: Next.js 16 + NextAuth + Prisma + PostgreSQL
  - Features: Book tracking, budgets, wishlists, reading progress
  - Status: ✅ Production deployed

- **QuestHunt** 🗺️: Geocaching social network
  - Stack: Next.js 16 + Supabase (PostGIS for geospatial)
  - Features: Location-based quests, real-time maps, user activities
  - Status: ✅ Production deployed

**In Development**:

- **StoryForge** ✍️: Collaborative writing platform
  - Stack: Next.js 16 + NextAuth + Prisma + Socket.io
  - Features: Story creation, real-time collaboration, AI assistance
  - Status: 🟡 Schema defined, implementation pending

- **VelvetGalaxy** 🌟: Lifestyle social network
  - Stack: TBD (Prisma or Supabase)
  - Features: To be defined
  - Status: 🔜 Planning phase

### Personal Content Platform (1)

**In Development**:

- **Personal Blog** ✍️: Content management system for reviews and commentary
  - Stack: Next.js 16 + Prisma + PostgreSQL + MDX
  - Features:
    - **Political Analysis**: Platform comparisons, policy reviews, civic commentary
    - **Entertainment Reviews**: Movies, anime, TV shows, documentaries
    - **Music Reviews**: Album reviews, concert experiences, genre exploration
    - **Tech Commentary**: Software reviews, development insights, industry analysis
    - **Personal Essays**: Creative writing, personal experiences, thought pieces
  - Technical Features:
    - Rich text editor with MDX support
    - Tagging and categorization system
    - Search and filtering
    - Comments and engagement tracking
    - SEO optimization
    - RSS feed generation
    - Social media integration
  - Status: 🟡 Planning/early development

## 🌍 Internationalization

Supports multiple languages out of the box:

- English (en)
- French (fr)

Add new languages by creating translation files in `apps/app/i18n/`.

## ♿ Accessibility

GameHub is built with accessibility in mind:

- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- ARIA labels and roles
- High contrast mode support
- Reduced motion support

## 🔒 Security

Security best practices implemented:

- JWT token authentication
- Secure HTTP headers (Helmet)
- CORS configuration
- Rate limiting
- Input validation
- SQL injection prevention (Prisma)
- XSS protection
- CSRF protection
- Environment variable validation

## 📊 Performance

Optimization techniques:

- Code splitting
- Dynamic imports
- Image optimization (Next.js Image)
- Bundle analysis
- Caching strategies
- Database query optimization
- Redis caching
- CDN integration

## 🔮 Planned Features & Roadmap

### Near-Term (Q1 2026)

- **Personal Blog Development**: Build content management system with MDX support
  - Rich text editor with preview
  - Tagging and categorization
  - SEO optimization and RSS feeds
  - Initial content: political analysis, movie/anime reviews
- **Bundle Size Testing**: Measure actual bundle size reductions from package splitting
- **Admin Dashboard Phase 1**: User management, project configuration, basic analytics
- **StoryForge Development**: Complete implementation of writing platform
- **Documentation Updates**: Comprehensive deployment guides per project

### Mid-Term (Q2-Q3 2026)

- **Blog Enhancement**: Comments system, social sharing, analytics, newsletter integration
- **Content Expansion**: Regular posts on politics, entertainment, music, tech
- **Admin Dashboard Phase 2**: Feature flags system, advanced analytics, cost monitoring
- **VelvetGalaxy Launch**: Complete lifestyle network implementation
- **Game Engine Standardization**: Evaluate PixiJS for arcade games, Phaser 3 for platformer
- **Performance Optimization**: Advanced caching strategies, CDN integration
- **Multiplayer Features**: Real-time multiplayer for select games

### Long-Term (Q4 2026+)

- **Mobile Apps**: Native iOS/Android apps using React Native
- **AI Integration**: AI-powered content generation for StoryForge
- **3D Games**: Three.js/React Three Fiber games
- **Community Features**: User profiles, social features, achievements system
- **Advanced Analytics**: User journey tracking, A/B testing framework

### Continuous Improvements

- Test coverage expansion (target: 90%+)
- Accessibility enhancements (WCAG 2.1 AAA)
- Performance monitoring and optimization
- Security audits and updates

See [action-plan.md](./docs/action-plan.md) for detailed sprint planning and current priorities.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow the existing code style
- Run `pnpm lint` and `pnpm format` before committing
- Write tests for new features
- Update documentation as needed

## 📚 Documentation

### Getting Started

- [Setup Guide](./docs/SETUP.md) - Installation and configuration
- [Quick Start](./docs/QUICK_START.md) - Get running in 5 minutes
- [Docker Setup](./docs/docker-centralization.md) - Container orchestration

### Architecture

- [Package Architecture](./docs/PACKAGE_ARCHITECTURE.md) - Monorepo package structure ⭐
- [Architecture Strategy](./docs/ARCHITECTURE_STRATEGY.md) - Bundle optimization strategy
- [Architecture Analysis](./docs/ARCHITECTURE_OPTIONS_ANALYSIS.md) - Platform decisions
- [Game Engine Strategy](./docs/GAME_ENGINE_STRATEGY.md) - Game implementation patterns
- [Monorepo Architecture](./docs/architecture-monorepo.md) - Overall architecture

### Development

- [Action Plan](./docs/action-plan.md) - Current development roadmap ⭐
- [Personal Blog Requirements](./docs/PERSONAL_BLOG_REQUIREMENTS.md) - Blog platform specs ⭐ NEW
- [Game Development](./docs/new-games-development-plan.md) - Creating new games
- [Admin Dashboard Requirements](./docs/ADMIN_DASHBOARD_REQUIREMENTS.md) - Admin features (planned)

### Deployment

- [Deployment Guide](./docs/DEPLOYMENT.md) - Production deployment
- [API Documentation](http://localhost:8080/api/docs) - Backend API reference

## 🐛 Troubleshooting

Common issues and solutions:

### Port Already in Use

```bash
# Change ports in .env.local
APP_PORT=3001
API_PORT=8081
```

### Database Connection Failed

```bash
# Restart database
docker compose restart postgres

# Check logs
docker compose logs postgres
```

### Prisma Client Issues

```bash
# Regenerate client
pnpm prisma:generate

# Reset and rebuild
pnpm clean && pnpm install
```

See [SETUP.md](./docs/SETUP.md#troubleshooting) for more solutions.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 👥 Team

- **Darryl Ulrich T** - [GitHub](https://github.com/DTADMI) | [LinkedIn](https://www.linkedin.com/in/darryl-ulrich-t-62358476/)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) team
- [NestJS](https://nestjs.com/) team
- [Vercel](https://vercel.com/)
- [shadcn](https://twitter.com/shadcn) for ui components
- All open-source contributors

## 📧 Contact

- Email: dtadmi@gmail.com
- GitHub: [@DTADMI](https://github.com/DTADMI)

---

<div align="center">
  Made with ❤️ by the GameHub team
</div>
