# SpecForge — AI-Powered API Documentation Generator

## Architecture

```
┌─────────────┐     HTTP      ┌──────────────────────┐     HTTP      ┌──────────────┐
│   Frontend   │ ──────────── │      Backend          │ ──────────── │  AI Service   │
│  React+Vite  │              │  FastAPI + SQLAlchemy  │              │   FastAPI     │
│  Tailwind    │              │  MySQL 8 (Docker)      │              │   Groq LLM    │
└─────────────┘              └──────────────────────┘              └──────────────┘
     :5173                         :3000                              :8000
```

## Data Flow

1. User pastes API code or OpenAPI spec → Frontend
2. Frontend POST → FastAPI `/api/projects`
3. FastAPI POST → AI Service `/parse` (extract endpoints)
4. Parsed endpoints saved to MySQL
5. FastAPI POST → AI Service `/generate` (generate docs per endpoint)
6. Generated docs saved to MySQL
7. Frontend renders searchable, tabbed documentation UI

## Tech Stack

| Layer       | Tech                                        |
|-------------|---------------------------------------------|
| Frontend    | React 18, Vite, Tailwind CSS, Lenis         |
| Backend     | Python, FastAPI, SQLAlchemy 2.0 (async)     |
| Database    | MySQL 8 (Docker), aiomysql driver            |
| AI Service  | Python, FastAPI, Groq API                    |
| LLM         | Groq (llama-3.1-70b-versatile)              |

## Quick Start

### 1. MySQL (Docker)

```bash
cd backend
docker-compose up -d
```

Wait for healthcheck to pass:
```bash
docker-compose ps   # Status should show "healthy"
```

### 2. Backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # edit credentials if needed

# Option A: Auto-create tables on startup
uvicorn app.main:app --host 0.0.0.0 --port 3000 --reload

# Option B: Use Alembic migrations
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port 3000 --reload
```

### 3. AI Service

```bash
cd ai-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env            # add GROQ_API_KEY
uvicorn app.main:app --reload --port 8000
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Backend API Routes

| Method | Path                          | Description              |
|--------|-------------------------------|--------------------------|
| GET    | /api/health                   | Health check             |
| POST   | /api/projects                 | Create project           |
| GET    | /api/projects                 | List projects            |
| GET    | /api/projects/:id             | Get project with docs    |
| DELETE | /api/projects/:id             | Delete project           |
| POST   | /api/projects/parse-api       | Parse API code via AI    |
| POST   | /api/projects/generate-docs   | Generate docs via AI     |
| GET    | /api/endpoints/:id            | Get endpoint detail      |
| GET    | /api/search?q=                | Search endpoints         |
| GET    | /api/export/:id/markdown      | Export docs as Markdown  |

## Environment Variables (Backend)

| Variable              | Default            | Description                    |
|-----------------------|--------------------|--------------------------------|
| DB_HOST               | localhost          | MySQL host                     |
| DB_PORT               | 3306               | MySQL port                     |
| DB_USER               | specforge_user     | MySQL user                     |
| DB_PASSWORD           | specforge_pass     | MySQL password                 |
| DB_NAME               | specforge          | MySQL database name            |
| APP_ENV               | development        | development / production       |
| APP_PORT              | 3000               | Backend port                   |
| AI_SERVICE_URL        | http://localhost:8000 | AI microservice URL         |
| CORS_ORIGIN           | http://localhost:5173 | Allowed CORS origin          |
| RATE_LIMIT_PER_MINUTE | 100                | Max requests per minute        |

## Project Structure (Backend)

```
backend/
├── docker-compose.yml          # MySQL 8 container
├── requirements.txt            # Python dependencies
├── alembic.ini                 # Alembic config
├── alembic/
│   ├── env.py                  # Async migration runner
│   ├── script.py.mako          # Migration template
│   └── versions/
│       └── 001_initial.py      # Initial schema migration
├── .env.example
└── app/
    ├── main.py                 # FastAPI app + lifespan + error handlers
    ├── core/
    │   ├── config.py           # Pydantic Settings
    │   ├── exceptions.py       # Custom exception hierarchy
    │   └── logging.py          # Structured logger
    ├── db/
    │   ├── database.py         # Async engine + connection pool
    │   └── session.py          # AsyncSession factory + DI
    ├── models/
    │   ├── base.py             # DeclarativeBase (InnoDB + utf8mb4)
    │   ├── enums.py            # Python enums
    │   ├── id_gen.py           # CUID generator
    │   ├── project.py          # Project model
    │   ├── endpoint.py         # Endpoint model
    │   ├── parameter.py        # Parameter model
    │   ├── example.py          # Example model
    │   └── documentation_page.py
    ├── schemas/
    │   ├── response.py         # SuccessResponse / PaginatedResponse
    │   ├── project.py          # ProjectCreate / ProjectOut
    │   ├── endpoint.py         # EndpointCreate / EndpointOut
    │   ├── parameter.py        # ParameterCreate / ParameterOut
    │   ├── example.py          # ExampleCreate / ExampleOut
    │   └── doc_page.py         # DocPageCreate / DocPageOut
    ├── crud/
    │   ├── project.py          # Project async queries
    │   ├── endpoint.py         # Endpoint async queries + search
    │   └── doc_page.py         # DocumentationPage async queries
    ├── services/
    │   ├── ai_client.py        # httpx async client + retry
    │   ├── project_service.py  # Business logic (parse, generate)
    │   └── export_service.py   # Markdown export
    └── api/
        ├── router.py           # Aggregates all route modules
        └── routes/
            ├── projects.py     # /api/projects/*
            ├── endpoints.py    # /api/endpoints/*
            ├── search.py       # /api/search
            └── export.py       # /api/export/*
```
