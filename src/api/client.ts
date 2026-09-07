/**
 * Thin API client. All network access flows through here so that pages and
 * components never talk to transport directly.
 *
 * While `VITE_API_BASE_URL` is unset the client resolves through the isolated
 * mock layer in `src/mock`, which can be deleted wholesale once the Part 2 API
 * is reachable.
 */
export const API_BASE_URL: string = import.meta.env["VITE_API_BASE_URL"] ?? "";

export const USE_MOCK = API_BASE_URL === "";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "include",
  });
  if (!res.ok) throw new ApiError(await res.text().catch(() => res.statusText), res.status);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** Latency simulation for the mock transport, keeps loading states honest. */
function delay<T>(value: T, ms = 220): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export const api = {
  get: <T>(path: string, mock: () => T) =>
    USE_MOCK ? delay(mock()) : http<T>(path, { method: "GET" }),
  post: <T>(path: string, body: unknown, mock: () => T) =>
    USE_MOCK ? delay(mock(), 420) : http<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown, mock: () => T) =>
    USE_MOCK ? delay(mock(), 420) : http<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  del: <T>(path: string, mock: () => T) =>
    USE_MOCK ? delay(mock(), 420) : http<T>(path, { method: "DELETE" }),
};

/**
 * Real-time channel. Uses SSE when an API base URL exists, otherwise replays
 * the mock activity feed on an interval. Consumers are transport-agnostic.
 */
export function subscribeToEvents<T>(
  channel: string,
  onEvent: (event: T) => void,
  mockTick?: () => T,
): () => void {
  if (!USE_MOCK) {
    const source = new EventSource(`${API_BASE_URL}/api/stream/${channel}`);
    source.onmessage = (msg) => onEvent(JSON.parse(msg.data) as T);
    return () => source.close();
  }
  if (!mockTick) return () => {};
  const timer = setInterval(() => onEvent(mockTick()), 4000);
  return () => clearInterval(timer);
}
