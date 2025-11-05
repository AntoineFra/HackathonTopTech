/**
 * services/api.ts
 * Small centralized fetch helper for calling the external backend.
 * - Reads NEXT_PUBLIC_BACKEND_URL (client) or BACKEND_URL (server) and falls back to NEXT_PUBLIC_BACKEND_URL.
 * - Normalizes trailing slashes.
 * - Adds a convenient apiFetch wrapper that throws on non-OK responses and parses JSON when possible.
 */

function getBackendUrl(): string {
  // Prefer server-only BACKEND_URL when available, but allow NEXT_PUBLIC_BACKEND_URL for client usage.
  const serverUrl = typeof process !== 'undefined' ? (process.env.BACKEND_URL as string | undefined) : undefined;
  const publicUrl = typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_BACKEND_URL as string | undefined) : undefined;
  const url = serverUrl || publicUrl;
  if (!url) {
    throw new Error('BACKEND_URL or NEXT_PUBLIC_BACKEND_URL environment variable is required');
  }
  return url.replace(/\/$/, '');
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const base = getBackendUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${base}${normalizedPath}`;

  const headers = {
    'Accept': 'application/json',
    ...((options && (options.headers as Record<string, string>)) || {}),
  } as Record<string, string>;

  // Only set Content-Type if body is present and not a FormData
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`Request to ${url} failed with status ${res.status}: ${text}`);
    // Attach status for callers who want to branch on it
    // @ts-ignore
    err.status = res.status;
    throw err;
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return res.text();
}
