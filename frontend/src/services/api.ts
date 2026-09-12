/**
 * Base API client for GreenVoltz.
 *
 * Reads VITE_API_BASE_URL from env (defaults to '/api').
 * When VITE_USE_MOCKS=true, endpoint modules should return static mock data
 * instead of calling request(). See src/mocks/README.md.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    message?: string,
  ) {
    super(message ?? `API Error ${status}: ${statusText}`);
    this.name = 'ApiError';
  }
}

export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new ApiError(res.status, res.statusText, text || undefined);
  }

  // Handle 204 No Content
  if (res.status === 204) return undefined as unknown as T;

  return res.json() as Promise<T>;
}

export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';
