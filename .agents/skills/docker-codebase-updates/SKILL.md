---
name: docker-codebase-updates
description: Guide and cheatsheet for syncing and updating the TaskFlow codebase in running Docker containers (batch and individual service updates, instant hot-sync, migrations, and cache management).
---

# Docker Codebase Updates & Synchronization Guide

This skill provides step-by-step procedures to propagate codebase modifications to running Docker containers for both **Development** and **Production** environments in the TaskFlow monorepo.

---

## 1. Instant Hot-Sync (Zero Rebuild — Fastest for Active Editing)

Use Docker copy (`docker cp`) to push code changes into running containers in under 1 second without rebuilding Docker images.

### Frontend Hot-Sync (Vite HMR auto-triggers on change):
```bash
# Push frontend source changes to dev container
npm run sync:frontend:dev
# Or directly via docker CLI:
docker cp apps/frontend/src/. todo-frontend-dev:/app/src/
```

### Backend Hot-Sync (PHP takes effect immediately):
```bash
# Push Laravel app source code to dev container
npm run sync:backend:dev
# Or directly via docker CLI:
docker cp apps/backend/app/. todo-backend-dev:/var/www/backend/app/
```

### Full-Stack Hot-Sync:
```bash
npm run sync:dev
```

---

## 2. Individual Service Rebuild (Fast Container Updates)

When adding new dependencies (`package.json` or `composer.json`), changing environment configs, or modifying Dockerfiles, rebuild only the specific service rather than the entire stack.

### Development:
- **Frontend SPA only:**
  ```bash
  npm run update:frontend:dev
  # Equivalent:
  docker compose -f docker-compose.dev.yml up -d --build frontend-spa
  ```
- **Backend API only:**
  ```bash
  npm run update:backend:dev
  # Equivalent:
  docker compose -f docker-compose.dev.yml up -d --build backend-api
  ```
- **Nginx Gateway only:**
  ```bash
  docker compose -f docker-compose.dev.yml up -d --build nginx-gateway
  ```

### Production:
- **Frontend & Nginx Gateway** *(Nginx multi-stage builds the production bundle)*:
  ```bash
  docker compose -f docker-compose.prod.yml up -d --build nginx-gateway
  ```
- **Backend API only:**
  ```bash
  docker compose -f docker-compose.prod.yml up -d --build backend-api
  ```

---

## 3. Batch Updates (Rebuilding the Whole Stack)

When performing major architectural changes or switching branches:

### Development Stack:
```bash
npm run update:dev
# Equivalent:
docker compose -f docker-compose.dev.yml up -d --build
```

### Production Stack:
```bash
npm run update:prod
# Equivalent:
docker compose -f docker-compose.prod.yml up -d --build
```

---

## 4. Post-Update Lifecycle Commands

After pushing backend changes (such as database migrations, route updates, or config changes), run Artisan commands inside the container:

### Run Migrations:
```bash
# Development:
npm run artisan:dev -- migrate
# Or:
docker compose -f docker-compose.dev.yml exec backend-api php artisan migrate

# Production:
npm run artisan:prod -- migrate --force
# Or:
docker compose -f docker-compose.prod.yml exec backend-api php artisan migrate --force
```

### Clear Cache & Re-optimize:
```bash
# Development:
npm run artisan:dev -- optimize:clear

# Production:
npm run artisan:prod -- optimize
```
