# GameHub - Monorepo Architecture

## 📁 Project Structure

```
gamehub/
├── apps/
│   ├── app/           # Next.js frontend application
│   └── api/                # NestJS backend API
│
├── packages/
│   ├── shared/             # Shared utilities, types, and configs
│   │   ├── config/         # Shared configuration (eslint, prettier, etc.)
│   │   ├── types/          # Shared TypeScript types
│   │   └── utils/          # Shared utility functions
│   │
│   ├── games/              # Individual game packages
│   │   ├── game-1/         # Game 1 package
│   │   │   ├── src/        # Game source code
│   │   │   ├── public/     # Game assets
│   │   │   └── package.json
│   │   └── game-2/         # Game 2 package
│   │
│   └── projects/           # Other project packages
│       └── project-1/      # Project 1 package
│
├── .github/
│   └── workflows/          # GitHub Actions workflows
│
├── .husky/                 # Git hooks
├── .vscode/                # VSCode settings
├── .eslintrc.js            # Base ESLint config
├── .prettierrc             # Prettier config
├── package.json            # Root package.json
├── pnpm-workspace.yaml     # PNPM workspace config
├── turbo.json              # Turborepo config
└── README.md               # This file
```

## 🏗️ Architecture

### Frontend (Next.js)

- **Framework**: Next.js 14+ with App Router
- **UI Components**: Radix UI (accessible primitives)
- **Styling**: TailwindCSS with CSS Modules
- **State Management**: React Context + useReducer
- **Form Handling**: React Hook Form with Zod validation
- **Testing**: Vitest + React Testing Library
- **E2E Testing**: Playwright

### Backend (NestJS)

- **Framework**: NestJS
- **API**: RESTful + WebSockets for real-time features
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + OAuth2
- **Validation**: Class-validator + class-transformer
- **Testing**: Jest + Supertest

## 🛠️ Development Setup

### Prerequisites

- Node.js 20+
- PNPM 8+
- Docker (for local database)
- PostgreSQL 15+

### Installation

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev

# Or start specific apps
pnpm --filter frontend dev
pnpm --filter api dev:watch
```

## 🚀 Deployment

### CI/CD

- GitHub Actions for automated testing and deployment
- Automated versioning with Changesets
- Preview deployments for PRs

### Hosting

- **Frontend**: Vercel
- **Backend**: AWS ECS or Railway
- **Database**: Supabase or AWS RDS
- **Storage**: AWS S3 or Cloudflare R2

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run frontend tests
pnpm --filter frontend test

# Run API tests
pnpm --filter api test

# Run E2E tests
pnpm --filter frontend test:e2e
```

## 🛡️ Security

- **Dependencies**: Regular updates with Dependabot
- **Code Quality**: ESLint + Prettier
- **Secrets**: Environment variables with validation
- **CORS**: Strict origin policies
- **Rate Limiting**: Implemented at API gateway level

## 📱 Mobile Support

- Responsive design with mobile-first approach
- Touch-friendly UI components
- PWA support for offline capabilities
- Mobile-specific optimizations

## 🔄 Development Workflow

1. Create a new branch: `git checkout -b feature/name`
2. Make changes and commit with conventional commits
3. Push and create a PR
4. CI runs tests and checks
5. Code review and approval
6. Merge to main (auto-deploys to staging)
7. Create a release (auto-deploys to production)

## 📚 Documentation

- Component documentation with Storybook
- API documentation with Swagger/OpenAPI
- ADRs (Architecture Decision Records)
- Setup and deployment guides
