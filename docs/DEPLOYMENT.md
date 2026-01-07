# Deployment Guide

This guide covers deploying GameHub to various platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Docker Deployment](#docker-deployment)
- [Cloud Platforms](#cloud-platforms)
  - [Vercel (Frontend)](#vercel-frontend)
  - [Google Cloud Run](#google-cloud-run)
  - [AWS](#aws)
  - [Railway](#railway)
- [Database Setup](#database-setup)
- [CDN and Assets](#cdn-and-assets)
- [Monitoring](#monitoring)

## Prerequisites

- Production environment variables configured
- Database (PostgreSQL) provisioned
- Redis instance (optional but recommended)
- Domain name (optional)
- SSL certificate (managed by platform or custom)

## Environment Variables

### Required for Frontend

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<secure-random-string>
```

### Required for Backend

```env
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=<secure-random-string>
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

### Optional

```env
REDIS_URL=redis://host:6379
GOOGLE_CLIENT_ID=<google-oauth-id>
GOOGLE_CLIENT_SECRET=<google-oauth-secret>
STRIPE_SECRET_KEY=<stripe-key>
```

## Docker Deployment

### Build Production Images

```bash
# Build API image
docker build -f apps/api/Dockerfile -t gamehub-api:latest --target production .

# Build App image
docker build -f apps/app/Dockerfile -t gamehub-app:latest --target production .
```

### Run with Docker Compose

```bash
# Production stack
docker compose -f docker-compose.prod.yml up -d
```

### Push to Container Registry

#### Docker Hub

```bash
docker tag gamehub-api:latest yourusername/gamehub-api:latest
docker push yourusername/gamehub-api:latest

docker tag gamehub-app:latest yourusername/gamehub-app:latest
docker push yourusername/gamehub-app:latest
```

#### GitHub Container Registry

```bash
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

docker tag gamehub-api:latest ghcr.io/your-org/gamehub-api:latest
docker push ghcr.io/your-org/gamehub-api:latest

docker tag gamehub-app:latest ghcr.io/your-org/gamehub-app:latest
docker push ghcr.io/your-org/gamehub-app:latest
```

## Cloud Platforms

### Vercel (Frontend)

Vercel is ideal for the Next.js frontend.

#### Setup

1. Install Vercel CLI:
   ```bash
   pnpm add -g vercel
   ```

2. Login:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   cd apps/app
   vercel --prod
   ```

#### Configuration

Create `vercel.json` in `apps/app/`:

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_API_URL": "@api-url",
    "NEXTAUTH_URL": "@nextauth-url",
    "NEXTAUTH_SECRET": "@nextauth-secret"
  }
}
```

Add environment variables in Vercel dashboard.

### Google Cloud Run

#### Prerequisites

```bash
# Install gcloud CLI
# https://cloud.google.com/sdk/docs/install

# Login and set project
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

#### Deploy API

```bash
# Build and push
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/gamehub-api apps/api

# Deploy
gcloud run deploy gamehub-api \
  --image gcr.io/YOUR_PROJECT_ID/gamehub-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production,DATABASE_URL=YOUR_DB_URL" \
  --set-secrets="JWT_SECRET=jwt-secret:latest"
```

#### Deploy Frontend

```bash
# Build and push
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/gamehub-app apps/app

# Deploy
gcloud run deploy gamehub-app \
  --image gcr.io/YOUR_PROJECT_ID/gamehub-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="NEXT_PUBLIC_API_URL=https://gamehub-api-xxx.run.app/api"
```

### AWS

#### Elastic Container Service (ECS)

1. Create ECR repositories:
   ```bash
   aws ecr create-repository --repository-name gamehub-api
   aws ecr create-repository --repository-name gamehub-app
   ```

2. Build and push:
   ```bash
   # Login to ECR
   aws ecr get-login-password --region us-east-1 | \
     docker login --username AWS --password-stdin \
     ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

   # Build and push
   docker build -t ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/gamehub-api:latest \
     -f apps/api/Dockerfile --target production .
   docker push ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/gamehub-api:latest
   ```

3. Create ECS task definition and service via AWS Console or CLI

#### AWS Amplify (Frontend Alternative)

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

### Railway

Railway provides simple deployment for both services.

#### Using Railway CLI

```bash
# Install
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy API
cd apps/api
railway up

# Deploy Frontend
cd ../app
railway up
```

#### Using GitHub Integration

1. Connect GitHub repo to Railway
2. Configure build commands:
   - API: `pnpm --filter @gamehub/api build`
   - App: `pnpm --filter @gamehub/app build`
3. Set environment variables
4. Deploy automatically on push

## Database Setup

### Supabase

1. Create project at [supabase.com](https://supabase.com)
2. Get connection string from Settings → Database
3. Run migrations:
   ```bash
   DATABASE_URL=<supabase-url> pnpm prisma:migrate deploy
   ```

### Google Cloud SQL

```bash
# Create instance
gcloud sql instances create gamehub-db \
  --database-version=POSTGRES_16 \
  --tier=db-f1-micro \
  --region=us-central1

# Create database
gcloud sql databases create gamehub --instance=gamehub-db

# Get connection string
gcloud sql instances describe gamehub-db
```

### AWS RDS

1. Create PostgreSQL instance via AWS Console
2. Configure security groups
3. Get endpoint and create connection string
4. Run migrations

## Redis Setup

### Upstash (Serverless Redis)

1. Create database at [upstash.com](https://upstash.com)
2. Copy connection URL
3. Add to environment variables

### Google Cloud Memorystore

```bash
gcloud redis instances create gamehub-redis \
  --size=1 \
  --region=us-central1 \
  --redis-version=redis_7_0
```

## CDN and Assets

### Cloudflare

1. Add site to Cloudflare
2. Update DNS records
3. Configure caching rules
4. Enable CDN for static assets

### AWS CloudFront

1. Create distribution
2. Set origin to your frontend domain
3. Configure cache behaviors
4. Update DNS

## SSL Certificates

Most platforms provide automatic SSL:

- **Vercel**: Automatic
- **Cloud Run**: Automatic with custom domain
- **Railway**: Automatic
- **Custom**: Use Let's Encrypt with certbot

## Health Checks

Add health endpoints:

```typescript
// API: apps/api/src/health/health.controller.ts
@Get('health')
healthCheck() {
  return { status: 'ok', timestamp: new Date() };
}
```

```typescript
// Frontend: apps/app/app/api/health/route.ts
export async function GET() {
  return Response.json({ status: 'ok' });
}
```

## Monitoring

### Application Monitoring

- **Sentry**: Error tracking
- **New Relic**: APM
- **DataDog**: Full-stack monitoring
- **LogRocket**: Session replay

### Infrastructure Monitoring

- **Google Cloud Monitoring**
- **AWS CloudWatch**
- **Grafana + Prometheus**

### Logging

```typescript
// Add structured logging
import { Logger } from '@nestjs/common';

const logger = new Logger('AppName');
logger.log('Application started');
logger.error('Error occurred', error.stack);
```

## Performance Optimization

### Frontend

- Enable Next.js image optimization
- Use ISR (Incremental Static Regeneration)
- Implement code splitting
- Enable compression
- Configure CDN caching

### Backend

- Enable response compression
- Implement database query optimization
- Use Redis caching
- Set up connection pooling
- Enable HTTP/2

## Security Checklist

- [ ] Environment variables secured
- [ ] HTTPS enabled
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Security headers set (Helmet)
- [ ] Database credentials rotated
- [ ] API keys in secrets manager
- [ ] Firewall rules configured
- [ ] Regular security updates
- [ ] Monitoring and alerts set up

## CI/CD

GitHub Actions workflows are pre-configured in `.github/workflows/`:

- `ci.yml`: Linting, testing, building
- `e2e.yml`: End-to-end tests
- `deploy.yml`: Automated deployment

### Manual Deployment

```bash
# Trigger deployment workflow
gh workflow run deploy.yml
```

## Rollback

### Vercel

```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback <deployment-url>
```

### Cloud Run

```bash
# List revisions
gcloud run revisions list --service=gamehub-app

# Rollback
gcloud run services update-traffic gamehub-app \
  --to-revisions=REVISION-NAME=100
```

## Troubleshooting

### Build Failures

- Check build logs
- Verify all dependencies are installed
- Ensure environment variables are set
- Check Node.js version compatibility

### Runtime Errors

- Check application logs
- Verify database connection
- Check Redis connection
- Review environment variables
- Check network/firewall rules

### Performance Issues

- Monitor response times
- Check database query performance
- Review CDN cache hit rates
- Analyze bundle sizes
- Profile application

## Support

For deployment issues:
- Check platform documentation
- Review GitHub Issues
- Contact support team

## Next Steps

- Set up monitoring and alerts
- Configure backup strategy
- Implement auto-scaling
- Set up staging environment
- Document runbooks
