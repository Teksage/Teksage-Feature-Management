import { NextResponse } from 'next/server'

/**
 * Relays a Storage upload when the browser cannot reach Supabase Storage
 * directly (`TypeError: Failed to fetch`). Forwards the caller's JWT so
 * storage RLS still applies.
 */
export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !anonKey) {
      return NextResponse.json(
        { message: 'Supabase env vars are missing on the server.' },
        { status: 500 }
      )
    }

    const auth = request.headers.get('authorization')
    if (!auth) {
      return NextResponse.json({ message: 'Not authenticated.' }, { status: 401 })
    }

    const form = await request.formData()
    const file = form.get('file')
    const path = form.get('path')

    if (!(file instanceof File) || typeof path !== 'string' || !path.trim()) {
      return NextResponse.json({ message: 'file and path are required.' }, { status: 400 })
    }

    const target = `${supabaseUrl}/storage/v1/object/feature-attachments/${encodeURI(path)}`
    const upstream = await fetch(target, {
      method: 'POST',
      headers: {
        Authorization: auth,
        apikey: anonKey,
        'x-upsert': 'false',
      },
      body: file,
    })

    const text = await upstream.text()
    return new NextResponse(text || null, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('content-type') ?? 'application/json',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Storage proxy failed'
    return NextResponse.json({ message }, { status: 500 })
  }
}
