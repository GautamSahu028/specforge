# SpecForge — AI-Powered API Documentation Generator

> Paste your API code or OpenAPI spec. Get beautiful, searchable documentation in seconds — powered by Groq LLMs.

---

## 📌 Project Overview

SpecForge is a full-stack web application that automatically generates structured, human-readable API documentation from raw source code or OpenAPI specifications. It uses a fast LLM (via Groq) to parse endpoints, infer parameters, and write documentation — then stores and serves everything through a REST API with a polished React UI.

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                        Docker Compose Network                        │
│                                                                      │
│  ┌──────────────┐   /api proxy   ┌──────────────────────────────┐   │
│  │   Frontend   │ ─────────────▶ │          Backend              │   │
│  │ React + Vite │                │  FastAPI + SQLAlchemy 2.0     │   │
│  │  Tailwind    │                │  async MySQL driver           │   │
│  │   :5173      │                │         :3000                 │   │
│  └──────────────┘                └─────────────┬────────────────┘   │
│                                                │                     │
│                              ┌─────────────────┼──────────────────┐  │
│                              ▼                 ▼                  │  │
│                   ┌──────────────────┐  ┌──────────────────────┐  │  │
│                   │   AI Service     │  │      MySQL 8          │  │  │
│                   │  FastAPI + Groq  │  │  Persistent volume   │  │  │
│                   │     :8000        │  │      :3306            │  │  │
│                   └──────────────────┘  └──────────────────────┘  │  │
│                          │                                         │  │
└──────────────────────────┼─────────────────────────────────────────┘  │
                           ▼
                     Groq LLM API
                  (external, requires key)
```

| Service      | Technology                          | Port |
|--------------|-------------------------------------|------|
| Frontend     | React 18, Vite, Tailwind CSS        | 5173 |
| Backend      | Python, FastAPI, SQLAlchemy 2.0     | 3000 |
| AI Service   | Python, FastAPI, Groq SDK           | 8000 |
| Database     | MySQL 8 (Docker container)          | 3306 |

---

## 🚀 Quick Start

**Prerequisites:** Docker and Docker Compose installed. Nothing else required.

```bash
# 1. Clone the repository
git clone https://github.com/your-org/specforge.git
cd specforge

# 2. Create your .env file from the template
cp .env.example .env

# 3. Open .env and set your Groq API key + strong passwords
#    (see Environment Setup below)

# 4. Launch everything with one command
docker-compose up --build
```

Open **http://localhost:5173** — the entire stack is running.

> **Tip:** Use `make up` if you have `make` installed.

---

## 🔐 Environment Setup

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

### Variable Reference

#### Database (MySQL 8)

| Variable              | Default                    | Required | Description                                      |
|-----------------------|----------------------------|----------|--------------------------------------------------|
| `DB_HOST`             | `db`                       | Yes      | MySQL hostname. **Must be `db`** in Docker.      |
| `DB_PORT`             | `3306`                     | No       | MySQL port.                                      |
| `DB_USER`             | `specforge_user`           | Yes      | MySQL application user.                          |
| `DB_PASSWORD`         | —                          | **Yes**  | Password for `DB_USER`. Use a strong value.      |
| `DB_NAME`             | `specforge`                | No       | Database name.                                   |
| `MYSQL_ROOT_PASSWORD` | —                          | **Yes**  | Root password for the MySQL container.           |

#### Backend

| Variable                | Default                    | Required | Description                                        |
|-------------------------|----------------------------|----------|----------------------------------------------------|
| `APP_ENV`               | `development`              | No       | `development` or `production`.                     |
| `APP_PORT`              | `3000`                     | No       | Port the backend listens on.                       |
| `CORS_ORIGIN`           | `http://localhost:5173`    | No       | Browser origin allowed for CORS requests.          |
| `RATE_LIMIT_PER_MINUTE` | `100`                      | No       | Max requests per IP per minute.                    |

> `AI_SERVICE_URL` is hardcoded to `http://ai-service:8000` in `docker-compose.yml` — it always uses the Docker service name and cannot be overridden via `.env`.

#### AI Service (Groq)

| Variable          | Default                    | Required | Description                                             |
|-------------------|----------------------------|----------|---------------------------------------------------------|
| `GROQ_API_KEY`    | —                          | **Yes**  | Groq API key. Get one free at https://console.groq.com  |
| `GROQ_MODEL`      | `llama-3.1-8b-instant`     | No       | Groq model ID to use.                                   |
| `GROQ_MAX_TOKENS` | `4096`                     | No       | Maximum tokens per LLM call.                            |
| `GROQ_TEMPERATURE`| `0.1`                      | No       | LLM temperature (lower = more consistent output).       |
| `LOG_LEVEL`       | `INFO`                     | No       | Logging verbosity (`DEBUG`, `INFO`, `WARNING`, `ERROR`).|

---

## 🐳 Running with Docker

### Start (foreground — see logs)
```bash
docker-compose up --build
```

### Start (background)
```bash
docker-compose up --build -d
docker-compose logs -f   # attach to logs later
```

### Stop
```bash
docker-compose down
```

### Stop and wipe all data (including MySQL volume)
```bash
docker-compose down -v
```

### Supported `docker run` env methods

All three standard methods work:

```bash
# 1. Inline flags
docker run -e GROQ_API_KEY=sk-... specforge-ai-service

# 2. Env file
docker run --env-file .env specforge-ai-service

# 3. docker-compose (recommended) — reads .env automatically
docker-compose up --build
```

---

## 🛠 Development Mode (Hot Reload)

Hot reload is **on by default** in `docker-compose.yml`:

- **Backend & AI Service** — source directories are bind-mounted into their containers and `uvicorn --reload` watches for file changes. Edit any `.py` file and the service restarts automatically.
- **Frontend** — `npm run dev` with Vite HMR. Edit any `.jsx`/`.css` file and the browser updates instantly.
- **Database** — MySQL data persists in the `mysql_data` Docker volume across restarts.

```bash
# Start with hot reload (default)
docker-compose up --build

# Or with make
make up
```

> **Windows note:** Python file watchers inside Docker on Windows may rely on polling rather than inotify. If `--reload` seems slow, this is expected behavior.

---

## 🧪 Testing

### Backend health check
```bash
curl http://localhost:3000/api/health
```

### AI Service health check
```bash
curl http://localhost:8000/health
```

### Backend API
```bash
# List projects
curl http://localhost:3000/api/projects

# Search endpoints
curl "http://localhost:3000/api/search?q=user"
```

---

## 📂 Project Structure

```
specforge/
├── docker-compose.yml          # Orchestrates all four services
├── .env.example                # Environment variable template
├── .env                        # Your local secrets (git-ignored)
├── Makefile                    # Convenience commands (make up, etc.)
├── init.sql                    # MySQL charset initialisation
│
├── frontend/                   # React + Vite application
│   ├── Dockerfile              # Dev (npm run dev) + Production (nginx) stages
│   ├── nginx.conf              # nginx config for production builds
│   ├── package.json
│   ├── vite.config.js          # Proxies /api → backend (BACKEND_URL env var)
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── pages/
│       ├── components/
│       ├── services/api.js     # Axios client (base URL: /api)
│       ├── hooks/
│       └── utils/
│
├── backend/                    # FastAPI REST API + MySQL ORM
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── alembic/versions/       # Database migrations
│   └── app/
│       ├── main.py             # FastAPI app, lifespan, middlewares
│       ├── core/               # Config, exceptions, logging
│       ├── db/                 # Async SQLAlchemy engine + sessions
│       ├── models/             # ORM models (Project, Endpoint, …)
│       ├── schemas/            # Pydantic request/response schemas
│       ├── crud/               # Async database queries
│       ├── services/           # Business logic + AI client
│       └── api/routes/         # Route handlers
│
└── ai-service/                 # FastAPI microservice — Groq LLM wrapper
    ├── Dockerfile
    ├── requirements.txt
    └── app/
        ├── main.py
        ├── config.py           # Pydantic Settings (GROQ_*)
        ├── prompts/            # LLM prompt templates
        ├── routes/api.py       # POST /parse, POST /generate
        ├── schemas/            # Request/response schemas
        └── services/           # LLM, parse, generate services
```

---

## 🤝 Contribution Guide

### 1. Fork and clone

```bash
git clone https://github.com/your-username/specforge.git
cd specforge
```

### 2. Create your environment file

```bash
cp .env.example .env
# Edit .env — set GROQ_API_KEY and strong passwords
```

### 3. Start the stack

```bash
docker-compose up --build
```

The app is live at http://localhost:5173 with hot reload enabled.

### 4. Branch naming

| Type     | Pattern                   | Example                          |
|----------|---------------------------|----------------------------------|
| Feature  | `feat/<short-description>`| `feat/export-pdf`                |
| Bug fix  | `fix/<short-description>` | `fix/rate-limit-header`          |
| Chore    | `chore/<description>`     | `chore/update-dependencies`      |
| Docs     | `docs/<description>`      | `docs/docker-setup`              |

### 5. Pull request guidelines

- Keep PRs focused — one feature or fix per PR.
- Write a clear description of *what* changed and *why*.
- Test locally with `docker-compose up --build` before opening a PR.
- Reference any related issues with `Fixes #123` in the PR body.
- All services must pass their health checks after your change.

---

## Backend API Reference

| Method | Path                            | Description                      |
|--------|---------------------------------|----------------------------------|
| GET    | `/api/health`                   | Health check                     |
| POST   | `/api/projects`                 | Create project                   |
| GET    | `/api/projects`                 | List all projects                |
| GET    | `/api/projects/:id`             | Get project with full docs       |
| DELETE | `/api/projects/:id`             | Delete project                   |
| POST   | `/api/projects/parse-api`       | Parse API code via AI            |
| POST   | `/api/projects/generate-docs`   | Generate docs via AI             |
| GET    | `/api/endpoints/:id`            | Get single endpoint detail       |
| GET    | `/api/search?q=`                | Search endpoints                 |
| GET    | `/api/export/:id/markdown`      | Export project docs as Markdown  |

---


## What SpecForge Does

AI-powered API documentation generator. Users paste API source code or an OpenAPI spec → Groq LLM extracts endpoints → generates human-readable documentation. Three services communicate over HTTP:

```
Frontend (React + Vite)  :5173
        ↓ /api proxy
Backend (FastAPI)         :3000
    ├─ AI Service (Groq)  :8000
    └─ MySQL 8            :3306
```

---

## Running the Project

**Recommended: Docker (one command)**
```bash
cp .env.example .env   # fill in GROQ_API_KEY at minimum
make up                # builds and starts all services with hot-reload
make logs              # tail logs
make down              # stop
make clean             # remove containers + volumes (wipes DB)
```

**Frontend only (local dev)**
```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
npm run build
npm run preview
```

**Backend only (local dev)** — requires MySQL and AI service running
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 3000
```

**Health checks**
```bash
curl http://localhost:3000/api/health
curl http://localhost:8000/health
```

There are no test suites currently in the repository.

---

## Architecture

### Request lifecycle (core flow)

1. User submits code → `POST /projects/parse-api` → `project_service.parse_api()`
2. Backend calls `ai_client.parse_api()` → AI Service `POST /parse` → Groq LLM
3. Endpoints extracted, validated, stored as `Endpoint + Parameter + Example` rows; project status → `PARSED`
4. User triggers `POST /projects/generate-docs` → backend iterates endpoints, calls AI Service `POST /generate` per endpoint
5. Docs stored in `DocumentationPage`; project status → `COMPLETED`

**Project status machine:** `PENDING → PARSING → PARSED → GENERATING → COMPLETED | FAILED`

### Backend (`/backend/app/`)

| Layer | Path | Responsibility |
|---|---|---|
| Routes | `api/routes/` | HTTP handlers — thin, delegate to services |
| Services | `services/` | Business logic: `project_service`, `ai_client`, `auth_service`, `export_service` |
| CRUD | `crud/` | Async SQLAlchemy queries |
| Models | `models/` | SQLAlchemy ORM models (User, Project, Endpoint, Parameter, Example, DocumentationPage) |
| Schemas | `schemas/` | Pydantic request/response models |
| Core | `core/` | Config (Pydantic Settings), exceptions, logging |

All DB operations use `async/await` with `AsyncSession`. Protected routes use FastAPI `Depends` to inject the current user from JWT cookie.

**Custom exceptions** in `core/exceptions.py` (`AppError`, `NotFoundError`, `ValidationError`, `AIServiceError`, `TimeoutError`, `DuplicateError`) are caught globally → `{success: false, error: {code, message}}` JSON responses.

**Auth:** JWT stored as HttpOnly cookie (`access_token`, SameSite=Lax). Axios sends cookies via `withCredentials: true`. Token expiry: 7 days.

### AI Service (`/ai-service/app/`)

Minimal FastAPI wrapper around Groq SDK. Two endpoints: `POST /parse` and `POST /generate`. `LLMService` is a singleton with Tenacity retry decorator. Responses are parsed as JSON (markdown fences stripped). Sanitization of extracted endpoints (method validation, path normalization) happens in `parse_service.py` before returning to backend.

### Frontend (`/frontend/src/`)

| Path | Role |
|---|---|
| `main.jsx` | Mounts `<AuthProvider><App />` |
| `App.jsx` | BrowserRouter + AnimatePresence page transitions |
| `context/AuthContext` | Global auth state — provides `user`, `isAuthenticated`, `login`, `signup`, `logout` |
| `services/api.js` | Axios instance (`baseURL: /api`, `withCredentials: true`, 180s timeout) |
| `pages/` | Route-level components |
| `components/` | Shared UI components |

**Protected routes** use `<ProtectedRoute>` which redirects to `/login` if `!isAuthenticated`. `/home` and `/dashboard` both render `DashboardHomePage` (same component).

**Styling:** Tailwind with custom design tokens defined in `tailwind.config.js` — use these instead of raw colors:
- Surfaces: `surface-0` through `surface-4` (dark grays)
- `accent` (indigo), `mint`, `coral`
- Text: `text-primary`, `text-secondary`, `text-muted`
- Glass effect: `glass` utility class (backdrop-blur + semi-transparent bg)

**Animations:** Framer Motion throughout. Page transitions via `AnimatePresence`. Card stagger pattern: `delay: 0.1 + index * 0.07`. Layout animations use `layoutId="nav-pill"` for shared element transitions.

### Database

MySQL 8 via SQLAlchemy async + aiomysql. Migrations in `/backend/alembic/versions/` — two migrations: `001_initial` (all base tables) and `002_add_users`. All PKs are CUIDs. Cascade deletes on `project_id` FKs.

---

## Environment Variables

Copy `.env.example` to `.env`. Required to get running:
- `GROQ_API_KEY` — from https://console.groq.com
- Database credentials (`DB_USER`, `DB_PASSWORD`, `DB_NAME`, etc.)
- `JWT_SECRET` — any strong random string

Key optional tuning:
- `GROQ_MODEL` — default `llama-3.1-8b-instant`
- `RATE_LIMIT_PER_MINUTE` — default 100
- `AI_SERVICE_URL` — defaults to `http://localhost:8000`; Docker sets it to `http://ai-service:8000`
