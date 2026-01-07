# Docker Configuration for GameHub Monorepo

The application is deployed using a single Dockerfile at the root which handles both the API and Frontend depending on
the build target.

## Root Dockerfile

- **Location**: `./Dockerfile`
- **API Build**: `docker build --target api -t gamehub-api .`
- **Frontend Build**: `docker build --target frontend -t gamehub-frontend .`

## Deployment

The CI/CD pipeline in `.github/workflows/ci-cd.yml` automatically builds and pushes these images to Google Artifact
Registry.
