const DEFAULT_API_BASE_URL = 'http://localhost:8000';
const DEFAULT_TIMEOUT_MS = 10_000;

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;
export const API_BASE_URL = configuredBaseUrl.replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    message?: string,
  ) {
    super(message ?? `API request failed (${status} ${statusText})`);
    this.name = 'ApiError';
  }
}

export class ApiRequestError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

function withTimeout(signal?: AbortSignal): { signal: AbortSignal; cleanup: () => void } {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  const forwardAbort = () => controller.abort();
  signal?.addEventListener('abort', forwardAbort, { once: true });

  return {
    signal: controller.signal,
    cleanup: () => {
      window.clearTimeout(timeout);
      signal?.removeEventListener('abort', forwardAbort);
    },
  };
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}/${path.replace(/^\/+/, '')}`;
  const timeout = withTimeout(options.signal ?? undefined);

  try {
    const response = await fetch(url, {
      ...options,
      signal: timeout.signal,
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const message = await response.text().catch(() => '');
      throw new ApiError(response.status, response.statusText, message || undefined);
    }

    if (response.status === 204) return undefined as T;
    return await response.json() as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiRequestError(`API request timed out: ${url}`, error);
    }
    throw new ApiRequestError(`API request failed: ${url}`, error);
  } finally {
    timeout.cleanup();
  }
}

export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false';
