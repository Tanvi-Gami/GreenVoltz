# GreenVoltz golden demo

## Start

Terminal 1:

```powershell
$env:DATABASE_URL="sqlite:///./data/greenvoltz_demo.db"
python scripts/seed_demo.py --reset
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```

Terminal 2:

```powershell
Set-Location frontend
$env:VITE_API_BASE_URL="http://localhost:8000"
$env:VITE_USE_MOCKS="false"
npm run dev
```

## Three-minute flow

1. Open `/driver` and show the backend optimizer recommendation.
2. Select **Reserve charger** and confirm the reservation. The returned backend reservation ID is shown in the confirmation flow.
3. Open `/operator` and show seeded stations, active sessions, aggregate analytics, and energy signals.
4. Open `/disruptions`, click **Simulate disruption**, then **Replan with AI**.
5. Show affected EV sessions and the recovered assignments returned by the adaptation API.
6. Open `/optimization` and run optimization to show the persisted backend result and before/after values.

For a backend-independent rehearsal, set `VITE_USE_MOCKS=true`. Mock mode is
explicit fallback mode; it is not the live integration path.
