# GreenVoltz Mock Services

This directory contains static mock implementations of the API services.
They are used when `VITE_USE_MOCKS=true` is set in your `.env` file.

## How It Works

Each endpoint module in `src/services/endpoints/` checks `USE_MOCKS`:

```ts
import { USE_MOCKS } from '@/services/api';

export async function listStations(): Promise<Station[]> {
  if (USE_MOCKS) return mockStations(); // ← returns static data
  return request<Station[]>('/v1/stations');
}
```

## Adding a Mock

1. Create a file in `src/mocks/` named `<resource>.mock.ts`.
2. Export a function returning the mock data shaped to the API contract.
3. Reference it in the corresponding endpoint module.

## Toggle

In your `.env.local`:
```
VITE_USE_MOCKS=true
```

Set to `false` (or omit) to hit the real GreenVoltz backend at `VITE_API_BASE_URL`.
