# GreenVoltz

GreenVoltz is an AI-powered EV charging orchestration platform based on:

$$\text{PREDICT} \longrightarrow \text{OPTIMISE} \longrightarrow \text{RESERVE} \longrightarrow \text{ADAPT}$$

---

## Architectural Foundation

- **Data Pipeline** (`data_pipeline/`): Resilient ingestion of grid signals, carbon metrics, generation mix, weather, and EV session telemetry; robust feature engineering (alignment, lag calculations, rolling aggregations, calendar/sinusoidal features, and renewable penetration).
- **Intelligence Layer** (`intelligence/`):
  - `forecasting/`: Multi-target probabilistic forecasting (P10/P50/P90 quantiles) using LightGBM, supporting carbon intensity, renewable availability, EV charging demand, and station congestion.
  - `optimiser/`: CP-SAT mathematical optimisation scheduler powered by Google OR-Tools.
  - `simulation/`: Synthetic and scenario-driven EV fleet generation, battery SOC dynamics, and charging requests.
- **Backend API** (`backend/`): High-performance asynchronous FastAPI service with clean separation between routes, schemas, services, and PostgreSQL persistence via SQLAlchemy.

---

## Getting Started

### Prerequisites
- Python 3.11+
- [uv](https://github.com/astral-sh/uv) (recommended)
- Docker & Docker Compose (for PostgreSQL)

### Setup Virtual Environment
```bash
uv venv --python 3.11
source .venv/bin/activate
uv pip install -e ".[dev]"
```

### Run Tests
```bash
pytest
```

### Run Backend API
```bash
uvicorn backend.app.main:app --reload --port 8000
```

Verify health:
```bash
curl http://localhost:8000/health
```

---

## License & Attribution

GreenVoltz is MIT licensed. Portions of the data collectors, feature engineering, and forecasting modules are adapted from [EV-Charging-Demand-Optimisation](https://github.com) (c) 2026 James Westwood under the MIT License.
