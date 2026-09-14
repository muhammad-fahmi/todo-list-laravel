# TaskFlow - Full-Stack Monorepo Todo Application
### Laravel 13 + React 19 + shadcn/ui + JWT Auth + Docker Server Simulation

A production-grade, full-stack Todo and Task Management system structured as a **Monorepo** with stateless JWT authentication, policy-based data isolation, self-documenting codebases, responsive shadcn/ui design, and **Optimistic UI** updates.

---

## 🌟 Key Highlights

- **Backend:** Laravel 13 REST API with `php-open-source-saver/jwt-auth`, strict types (`declare(strict_types=1);`), granular policies (`TodoPolicy`, `CategoryPolicy`, `TagPolicy`), Eloquent Resources, Form Requests, and full PHPDoc docblocks.
- **Frontend:** React 19 + TypeScript + Vite, styled with Tailwind CSS v4 and shadcn/ui components (Radix primitives), featuring dark & light theme modes.
- **Optimistic UI:** Powered by TanStack Query (React Query) — status toggles and task deletions reflect instantly with zero latency, with automatic rollback and Sonner toast notifications on failure.
- **Docker Simulation:**
  - **Development (`docker-compose.dev.yml`):** Nginx ingress gateway on port `8080`, live code synchronization, Vite WebSocket HMR, PostgreSQL 16, and Redis 7.
  - **Production (`docker-compose.prod.yml`):** Multi-stage builds, OPcache acceleration, immutable static asset caching, and security headers.

---

## 📁 Monorepo Structure

```text
todo-list-laravel/
├── apps/
│   ├── backend/               # Laravel 13 REST API Application
│   │   ├── app/
│   │   │   ├── Http/
│   │   │   │   ├── Controllers/Api/v1/ # AuthController, TodoController, CategoryController, TagController
│   │   │   │   ├── Requests/          # Form Requests with user-scoped validation
│   │   │   │   └── Resources/         # Eloquent API JSON Resources
│   │   │   ├── Models/                # User (JWTSubject), Todo, Category, Tag
│   │   │   ├── Policies/              # TodoPolicy, CategoryPolicy, TagPolicy
│   │   │   └── Services/              # AuthService, TodoService, CategoryService, TagService
│   │   ├── database/migrations/       # Cascading FKs & compound indexes
│   │   ├── routes/api.php             # Versioned API routes (/api/v1/...)
│   │   └── tests/Feature/             # Automated test suite (13 passing tests)
│   │
│   └── frontend/              # React 19 + Vite + TypeScript SPA
│       ├── src/
│       │   ├── components/
│       │   │   ├── ui/                # shadcn/ui primitives (Button, Card, Dialog, Badge, Select, etc.)
│       │   │   ├── layout/            # AppLayout, ThemeToggle, Sidebar, Header
│       │   │   ├── todos/             # SummaryCards, TodoCard, TodoFiltersBar, TodoDialog, CategoryDialog
│       │   │   └── auth/              # ProtectedRoute guard
│       │   ├── context/               # AuthContext (JWT session management)
│       │   ├── hooks/                 # useTodos (Optimistic UI mutations), useCategories
│       │   ├── lib/                   # apiClient (Axios interceptors), utils (cn)
│       │   ├── pages/                 # LoginPage, RegisterPage, DashboardPage
│       │   └── types/                 # TypeScript interfaces & DTOs
│       └── components.json            # shadcn/ui configuration
│
├── docker/                    # Docker build definitions
│   ├── backend/               # Dockerfile.dev, Dockerfile.prod, php.ini
│   ├── frontend/              # Dockerfile.dev, Dockerfile.prod
│   └── nginx/                 # default.dev.conf, default.prod.conf
│
├── docker-compose.dev.yml     # Local development orchestration (Nginx on :8080)
├── docker-compose.prod.yml    # Production simulation orchestration
├── .env.docker.example        # Environment variables template for Docker
├── package.json               # Root monorepo scripts
├── PRD.md                     # Product Requirement Document
└── README.md
```

---

## 🚀 Getting Started

### Option A: Running with Docker (Recommended)

Docker sets up the complete server environment including PHP-FPM, PostgreSQL 16, Redis 7, Node 20 with Vite HMR, and an Nginx Ingress gateway.

1. **Start the Development Containers:**
   ```bash
   npm run docker:dev
   # or
   docker compose -f docker-compose.dev.yml up -d --build
   ```

2. **Run Migrations & Seeders inside container:**
   ```bash
   docker compose -f docker-compose.dev.yml exec backend-api php artisan migrate --seed
   ```

3. **Generate JWT Secret:**
   ```bash
   docker compose -f docker-compose.dev.yml exec backend-api php artisan jwt:secret
   ```

4. **Access the Application:**
   - **Frontend & API Gateway:** `http://localhost:8080` (Zero CORS issues — `/api/*` routes to Laravel, `/*` routes to React).

5. **Pushing Code Updates to Running Containers:**
   - **Instant Hot-Sync (Zero Rebuild — fastest for active editing):**
     ```bash
     npm run sync:frontend:dev   # Copies apps/frontend/src into container (Vite HMR updates immediately)
     npm run sync:backend:dev    # Copies apps/backend/app into container
     npm run sync:dev            # Copies both frontend and backend
     ```
   - **Individual Service Rebuild (When adding npm or composer packages):**
     ```bash
     npm run update:frontend:dev # Rebuilds only frontend-spa
     npm run update:backend:dev  # Rebuilds only backend-api
     ```
   - **Batch Update (Whole Stack):**
     ```bash
     npm run update:dev          # Rebuilds dev stack
     npm run update:prod         # Rebuilds prod stack
     ```
   - **Running Artisan in Containers:**
     ```bash
     npm run artisan:dev -- migrate
     npm run artisan:dev -- optimize:clear
     ```

---

### Option B: Running Natively (Without Docker)

#### 1. Backend Setup (Laravel):
```bash
cd apps/backend
composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
php artisan migrate
php artisan serve --port=8000
```

#### 2. Frontend Setup (React):
```bash
cd apps/frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser. The Vite dev server automatically proxies `/api` requests to `http://localhost:8000`.

---

## 🧪 Automated Testing

### Backend Feature Tests
Executes tests covering user registration, JWT login, token refresh, logout, Todo CRUD, status toggling, summary metrics, and policy-based user isolation:
```bash
cd apps/backend
php artisan test
```

### Frontend Type Checking & Build
Executes TypeScript type validation and Vite production bundle generation:
```bash
cd apps/frontend
npm run build
```

---

## 📡 REST API Reference

All endpoints are prefixed with `/api/v1`.

| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register new user account | No |
| `POST` | `/api/v1/auth/login` | Authenticate credentials & return JWT | No |
| `POST` | `/api/v1/auth/refresh` | Refresh existing JWT token | Yes |
| `POST` | `/api/v1/auth/logout` | Invalidate current JWT session | Yes |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile | Yes |
| `GET` | `/api/v1/todos` | List user todos with query filters | Yes |
| `POST` | `/api/v1/todos` | Create a new task | Yes |
| `GET` | `/api/v1/todos/{id}` | Get task details | Yes |
| `PUT` | `/api/v1/todos/{id}` | Update task details | Yes |
| `PATCH`| `/api/v1/todos/{id}/toggle` | Quick toggle completion status | Yes |
| `DELETE`| `/api/v1/todos/{id}` | Delete task | Yes |
| `GET` | `/api/v1/todos/summary` | Get aggregated dashboard metrics | Yes |
| `GET` | `/api/v1/categories` | List user categories with task counts | Yes |
| `POST` | `/api/v1/categories` | Create custom category | Yes |
| `DELETE`| `/api/v1/categories/{id}` | Delete category | Yes |
| `GET` | `/api/v1/tags` | List user tags | Yes |
| `POST` | `/api/v1/tags` | Create user tag | Yes |
| `DELETE`| `/api/v1/tags/{id}` | Delete tag | Yes |

---

## ⚡ Optimistic UI Updates

TaskFlow features zero-perceived latency for user interactions:
- **Checkbox Toggle:** Checking a task immediately marks it completed and updates the completion rate progress bar before the network request returns.
- **Rollback on Error:** If the server fails to persist the change, TanStack Query immediately rolls back to the snapshot state and alerts the user with a Sonner toast notification.
- **Instant Deletions:** Deleted tasks disappear instantaneously from the active list view.

---

## 🔄 CI/CD & Code Review Workflow

Every push to the repository is automatically validated through GitHub Actions:
- **Backend API Tests & Standards:** Executes Laravel Pint formatting verification, route and config validation, and 13 feature tests (60 assertions) against in-memory database.
- **Frontend SPA Checks:** Executes Oxlint linter, TypeScript compiler checks (`tsc -b`), and production Vite bundling.
- **Full-Stack Docker E2E Verification:** Automatically builds the multi-stage production Docker containers, spins up the stack, executes database migrations, and validates live HTTP ingress and JWT authentication.

### Automated Pull Request Workflow for Reviewers
Whenever changes are pushed to any branch (e.g., `git push origin feature/...`):
1. GitHub Actions automatically checks if an open Pull Request targeting `main` exists.
2. If not, it automatically generates a formatted Pull Request with commit notes and CI checklists.
3. Reviewers can inspect the code diffs and approve the Pull Request before merging into `main`.

---

## 📄 License
MIT
