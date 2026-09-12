# Local backend demo setup

This workflow uses an isolated SQLite database because Docker Desktop/Postgres
is not available in the current development environment. The backend already
uses SQLAlchemy and its test suite proves the model metadata can be created on
SQLite. No production database is modified.

## SQLite demo workflow

From the repository root:

```powershell
$env:DATABASE_URL = "sqlite:///./data/greenvoltz_demo.db"
python scripts/seed_demo.py --reset
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```

The deterministic seed creates 8 stations, 68 chargers, 3 vehicles, 3
charging requests, 3 reservations, charging sessions, tariffs, renewable
forecasts, station status records, an optimization result, and one persisted
adaptation scenario.

There are no Alembic migrations in this repository. The seed command uses
`Base.metadata.create_all()` for this isolated demo database.

Verify readiness in another terminal:

```powershell
curl.exe http://127.0.0.1:8000/health
curl.exe http://127.0.0.1:8000/health/ready
curl.exe http://127.0.0.1:8000/api/v1/health
curl.exe http://127.0.0.1:8000/api/v1/health/ready
```

## PostgreSQL alternative

Docker Compose is available in [docker-compose.yml](../docker-compose.yml),
but requires Docker Desktop and its Linux engine:

```powershell
docker compose up -d postgres
$env:DATABASE_URL = "postgresql+psycopg2://greenvoltz:greenvoltz_secret@localhost:5432/greenvoltz_db"
python scripts/seed_demo.py --reset
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```

Do not commit a real `.env` or credentials.

## Frontend modes

In `frontend/.env.local`:

```text
VITE_API_BASE_URL=http://localhost:8000
VITE_USE_MOCKS=true
```

Keep mocks enabled for the deterministic hackathon flow. Set
`VITE_USE_MOCKS=false` only when using the service adapters against the seeded
backend. Existing pages remain mock-first where backend responses do not
contain the presentation data they display.
