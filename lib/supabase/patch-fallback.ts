import { SUPABASE_WRITE_PROXY_PATH } from '@/lib/constants'

/** Only headers PostgREST needs; anything else the browser set is dropped. */
const FORWARDED_HEADERS = [
  'apikey',
  'authorization',
  'content-type',
  'prefer',
  'accept',
  'accept-profile',
  'content-profile',
]

function headersToRecord(init?: HeadersInit): Record<string, string> {
  if (!init) return {}
  const entries =
    init instanceof Headers
      ? [...init.entries()]
      : Array.isArray(init)
        ? init
        : Object.entries(init)

  return Object.fromEntries(
    entries.filter(([key]) => FORWARDED_HEADERS.includes(key.toLowerCase()))
  )
}

/**
 * Supabase sends every update as an HTTP `PATCH`, and some browser environments
 * (extensions, filtering proxies) drop that method for third-party API hosts —
 * the request never leaves the tab and `fetch` rejects with `TypeError`.
 * Reads, inserts and deletes use other methods, so only updates break.
 *
 * When a direct `PATCH` cannot leave the browser, replay it through our own
 * origin, which forwards it server-side with the caller's own token so RLS
 * still decides what the request is allowed to touch.
 */
export async function fetchWithPatchFallback(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  if ((init?.method ?? 'GET').toUpperCase() !== 'PATCH') return fetch(input, init)

  try {
    return await fetch(input, init)
  } catch (error) {
    // A blocked method rejects before any response exists, always as a TypeError.
    if (!(error instanceof TypeError)) throw error

    return fetch(SUPABASE_WRITE_PROXY_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: String(input),
        headers: headersToRecord(init?.headers),
        body: typeof init?.body === 'string' ? init.body : null,
      }),
    })
  }
}
