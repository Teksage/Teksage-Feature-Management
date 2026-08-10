import { NextResponse } from 'next/server'

/**
 * Replays a Supabase `PATCH` that the browser refused to send (see
 * `lib/supabase/patch-fallback.ts`). The caller's own `Authorization` header is
 * forwarded untouched, so Postgres RLS still governs the write — this endpoint
 * grants no access the browser did not already have.
 */
const FORWARDED_HEADERS = [
  'apikey',
  'authorization',
  'content-type',
  'prefer',
  'accept',
  'accept-profile',
  'content-profile',
]

interface WriteProxyPayload {
  url?: unknown
  headers?: unknown
  body?: unknown
}

export async function POST(request: Request) {
  try {
    const restPrefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''}/rest/v1/`
    const { url, headers, body } = (await request.json()) as WriteProxyPayload

    if (typeof url !== 'string' || !url.startsWith(restPrefix)) {
      return NextResponse.json(
        { message: 'Only Supabase REST writes can be forwarded.' },
        { status: 400 }
      )
    }

    const outgoing = new Headers()
    for (const [key, value] of Object.entries((headers as Record<string, unknown>) ?? {})) {
      if (typeof value === 'string' && FORWARDED_HEADERS.includes(key.toLowerCase())) {
        outgoing.set(key, value)
      }
    }

    const upstream = await fetch(url, {
      method: 'PATCH',
      headers: outgoing,
      body: typeof body === 'string' ? body : undefined,
    })

    // PostgREST returns 204 No Content on successful updates. The Fetch
    // Response constructor rejects a body with 204/205, so pass null.
    if (upstream.status === 204 || upstream.status === 205) {
      return new NextResponse(null, { status: upstream.status })
    }

    const text = await upstream.text()
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('content-type') ?? 'application/json',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Write proxy failed'
    return NextResponse.json({ message }, { status: 500 })
  }
}
