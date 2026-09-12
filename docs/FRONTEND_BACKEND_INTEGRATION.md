# GreenVoltz frontend/backend integration contract

This document records the backend contract currently implemented in the
repository. The frontend remains mock-first so the Driver, Operator,
Optimization, and Disruptions demo flows do not depend on a running database.

## Runtime configuration

| Setting | Default | Meaning |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:8000` | Backend origin. Versioned paths are appended by `apiClient.ts`. |
| `VITE_USE_MOCKS` | `true` in `.env.example` | Mock-first demo mode. Set to `false` to use the adapter functions documented below. |

The central client is [apiClient.ts](../frontend/src/services/apiClient.ts).
It provides JSON requests, HTTP errors, request timeouts, and transport
errors. `api.ts` re-exports it for compatibility with existing endpoint code.

## Endpoint inventory

| Endpoint | Method | Purpose | Request | Response | Frontend service | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `/health` | GET | Liveness check | None | `{ status, service, version }` | `apiClient.request` | **IMPLEMENTED** |
| `/health/ready` | GET | Liveness plus database readiness | None | `{ status, service, version }` | `apiClient.request` | **IMPLEMENTED**; requires database |
| `/api/v1/health` | GET | Versioned liveness check | None | `{ status, service, version }` | `apiClient.request` | **IMPLEMENTED** |
| `/api/v1/health/ready` | GET | Versioned readiness check | None | `{ status, service, version }` | `apiClient.request` | **IMPLEMENTED**; requires database |
| `/api/v1/stations/` | GET | List stations and chargers | None | `StationResponse[]` | `operatorService.getBackendNetworkInputs` | **PARTIALLY IMPLEMENTED** |
| `/api/v1/stations/{station_id}` | GET | Get one station and chargers | Path integer ID | `StationResponse` | No page adapter yet | **IMPLEMENTED** |
| `/api/v1/stations/{station_id}/chargers` | GET | List station chargers | Path integer ID | `ChargerResponse[]` | No page adapter yet | **IMPLEMENTED** |
| `/api/v1/charging/recommend` | POST | Generate an optimized charging recommendation | `ChargingRequestCreate` | `ChargingRecommendation` | `driverService.getDriverPageData`, `driverService.getDriverRecommendation`, `optimizationService.runBackendOptimization` | **IMPLEMENTED + VERIFIED** for the raw Driver recommendation path |
| `/api/v1/reservations/` | POST | Create a reservation | `ReservationCreate` | `ReservationResponse` | No adapter yet | **IMPLEMENTED** |
| `/api/v1/reservations/{reservation_id}` | GET | Read a reservation | Path integer ID | `ReservationResponse` | No adapter yet | **IMPLEMENTED** |
| `/api/v1/reservations/{reservation_id}/cancel` | POST | Cancel a reservation | Path integer ID | `ReservationResponse` | No adapter yet | **IMPLEMENTED** |
| `/api/v1/analytics/overview` | GET | Aggregate request, reservation, energy, cost, and carbon values | None | `AnalyticsOverview` object | `operatorService.getBackendNetworkInputs` | **PARTIALLY IMPLEMENTED** |
| `/api/v1/adaptation/events` | POST | Submit a disruption event and adapt the plan | `DisruptionEvent` | `AdaptationResultResponse` | No adapter yet | **IMPLEMENTED** |
| `/api/v1/adaptation/replan` | POST | Submit a disruption event for replanning | `DisruptionEvent` | `AdaptationResultResponse` | `disruptionService.submitBackendDisruption` | **PARTIALLY IMPLEMENTED** |
| `/api/v1/adaptation/{adaptation_id}` | GET | Retrieve a persisted adaptation result | Path integer ID | Stored adaptation JSON/result | No adapter yet | **IMPLEMENTED** |

## Contract mismatches and unavailable data

### Stations and Operator

The backend station response contains IDs, coordinates, total charger count,
and charger connector/power data. It does not provide the Operator page's
derived availability, utilization, health status, demand map, or station
labels used by the demo. The adapter therefore exposes raw backend inputs
without pretending they are equivalent to `OperatorOverview`.

### Charging sessions

There is no REST endpoint for listing active charging sessions in the current
router. The Operator page's active-session data is **MOCK ONLY**.

### Reservations

Reservation create/read/cancel endpoints exist, but the frontend Driver
reservation interaction is currently local demo state. A reservation adapter
is not wired because the Driver mock lacks the backend's required numeric
`request_id`, `charger_id`, and ISO datetime fields.

### Analytics

Only `/api/v1/analytics/overview` exists. It returns aggregate database
totals, not the time-series demand, renewable, carbon, or utilization
signals displayed in Operator and Optimization. Those visualizations remain
**MOCK ONLY**.

### Driver recommendation integration

When `VITE_USE_MOCKS=false`, `/driver` calls the seeded backend recommendation
endpoint with a typed request. `mapBackendRecommendationToDriverData()` maps
the supported solver fields into the existing presentation model. Station
metadata that the backend does not return remains demo-derived, and a failed
request keeps the existing mock page visible with a non-blocking API warning.
This is the one real frontend/backend path verified end-to-end.

### Optimization

The backend exposes recommendation generation at
`POST /api/v1/charging/recommend`, not a dedicated `/optimization` endpoint.
Its request requires numeric vehicle and time-slot constraints, and its
response is a solver plan with numeric station/charger IDs. The current
Optimization page uses richer presentation-oriented mock schedule data, so the
raw adapter is available but the page is not silently switched to an
incompatible response.

### Disruptions and replanning

The backend adaptation contract accepts a typed `DisruptionEvent` and returns
plan item IDs/counts and solver output. It does not return the page's station
names, battery values, human-readable assignments, or timeline entries. The
Disruptions page therefore remains **MOCK ONLY** while
`submitBackendDisruption` provides the raw contract boundary.

## Seeded database verification

The following results were exercised against the isolated SQLite demo database
created by `scripts/seed_demo.py --reset`:

| Feature | Endpoint | Real DB verified? | Frontend connected? | Notes |
| --- | --- | --- | --- | --- |
| Health/readiness | `/health`, `/health/ready`, `/api/v1/health`, `/api/v1/health/ready` | **YES** (200) | API client only | Readiness is database-backed. |
| Stations and chargers | `/api/v1/stations/`, `/api/v1/stations/{station_id}`, `/api/v1/stations/{station_id}/chargers` | **YES** (200; 8 stations) | Partial | Raw station inputs are available to Operator adapters. |
| Driver recommendation | `POST /api/v1/charging/recommend` | **YES** (200; valid solver response) | **YES** | `/driver` maps the real response when mocks are disabled. |
| Reservations | `/api/v1/reservations/`, `/{reservation_id}`, `/{reservation_id}/cancel` | **YES** (create/read/cancel) | No | Driver reservation UI remains local demo state. |
| Analytics | `/api/v1/analytics/overview` | **YES** (200; aggregate object) | Partial | Aggregate values are connected to the raw Operator adapter. |
| Adaptation | `/api/v1/adaptation/events`, `/replan`, `/{adaptation_id}` | **YES** (200) | Raw adapter only | Full Disruptions presentation remains mock-driven. |
| OpenAPI contract | `/openapi.json` | **YES** (200) | No | Confirmed all documented routes are present. |

## Error/loading/empty behavior

`apiClient.request` distinguishes:

- `ApiError` for non-2xx HTTP responses, including status and response text.
- `ApiRequestError` for timeout and network/transport failures.
- Successful empty arrays/objects, which remain valid API results and are not
  converted to fake data.

The current completed demo pages intentionally initialize from synchronous
mock services. API adapter functions are isolated in the service layer, so
adding loading/error UI when a page is migrated does not require moving
fetch logic into components.
