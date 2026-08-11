import { createBrowserClient } from '@supabase/ssr'
import { fetchWithPatchFallback } from './patch-fallback'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client: ReturnType<typeof createBrowserClient<any>> | undefined

/**
 * NEXT_PUBLIC_* must be read as static property access so Next.js can inline
 * them for the browser bundle. Dynamic `process.env[name]` is always undefined
 * on the client.
 */
function getPublicSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
        'For local: set them in .env.local and restart `npm run dev`. ' +
        'For production: set them in Vercel env vars and Redeploy.'
    )
  }

  return { url, anonKey }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSupabaseBrowserClient(): ReturnType<typeof createBrowserClient<any>> {
  if (!client) {
    const { url, anonKey } = getPublicSupabaseConfig()
    client = createBrowserClient(url, anonKey, {
      global: { fetch: fetchWithPatchFallback },
    })
  }
  return client
}
