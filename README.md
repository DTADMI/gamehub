# 🎮 GameHub - Modern Gaming Platform

> A production-ready monorepo featuring Next.js 15 frontend, NestJS backend, and multiple integrated games and projects.

[![CI](https://github.com/your-org/gamehub/workflows/CI/badge.svg)](https://github.com/your-org/gamehub/actions)
[![E2E](https://github.com/your-org/gamehub/workflows/E2E%20Tests/badge.svg)](https://github.com/your-org/gamehub/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

## ✨ Features

- 🎯 **Modern Tech Stack**: Next.js 15, React 19, NestJS 11, Prisma, PostgreSQL
- 🏗️ **Monorepo Architecture**: Turborepo + pnpm workspaces
- 🎨 **UI Components**: shadcn/ui + Tailwind CSS v4
- 🔐 **Authentication**: NextAuth.js with JWT + OAuth
- 🌐 **Real-time**: WebSockets with Socket.io
- 🧪 **Testing**: Vitest, Playwright, Jest
- 🐳 **Docker**: Development and production containers
- 🚀 **CI/CD**: GitHub Actions workflows
- 🌍 **i18n**: Multi-language support (EN/FR)
- ♿ **Accessibility**: WCAG 2.1 AA compliant
- 📱 **Mobile-First**: Responsive and touch-optimized
- 🎮 **Games**: Snake, Breakout, Memory, Chess, Tetris, and more

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
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

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in dev mode |
| `pnpm build` | Build all packages |
| `pnpm test` | Run all tests |
| `pnpm lint` | Lint codebase |
| `pnpm format` | Format code with Prettier |
| `pnpm type-check` | Run TypeScript checks |
| `pnpm clean` | Clean build artifacts |

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
│   ├── app/                    # Next.js frontend
│   │   ├── app/               # App Router pages
│   │   ├── components/        # React components
│   │   ├── lib/              # Utilities
│   │   └── public/           # Static assets
│   └── api/                   # NestJS backend
│       ├── src/              # Source code
│       ├── prisma/           # Database schema
│       └── test/             # Tests
├── packages/
│   ├── shared/               # Shared utilities
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Helper functions
│   │   └── components/      # Shared components
│   ├── games/               # Game packages
│   │   ├── snake/
│   │   ├── breakout/
│   │   ├── memory/
│   │   └── ...
│   ├── projects/            # Full-stack projects
│   │   ├── story-forge/
│   │   └── quest-hunt/
│   └── ui/                  # UI component library
├── docs/                    # Documentation
├── .github/                 # GitHub workflows
├── docker-compose.yml       # Docker services
├── turbo.json              # Turborepo config
├── pnpm-workspace.yaml     # pnpm workspaces
└── package.json            # Root package
```

## 🛠️ Tech Stack

### Frontend

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
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

## 🎮 Games

Current playable games:

- **Snake**: Classic snake game with multiple control schemes
- **Breakout**: Brick breaker with power-ups and particles
- **Memory**: Card matching game with animations
- **Chess**: Full chess implementation
- **Checkers**: American checkers
- **Tetris**: Block puzzle classic
- **Bubble Pop**: Bubble shooter
- **Pattern Matching**: Knitzy-style puzzle

### Narrative Games

- **Rite of Discovery**: Point-and-click adventure
- **Systems Discovery**: Educational system exploration
- **Toymaker Escape**: Puzzle escape room

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

- [Setup Guide](./docs/SETUP.md)
- [Architecture](./docs/architecture-monorepo.md)
- [Docker Setup](./docs/docker-centralization.md)
- [Game Development](./docs/new-games-development-plan.md)
- [API Documentation](http://localhost:8080/api/docs)

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
