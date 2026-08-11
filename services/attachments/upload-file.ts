import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { BUCKET } from './attachment-server'

/**
 * Upload to Supabase Storage. If the browser blocks the direct call
 * (`Failed to fetch`), retry through our same-origin proxy.
 */
export async function uploadAttachmentFile(file: File, storagePath: string) {
  const supabase = getSupabaseBrowserClient()

  try {
    const { error } = await supabase.storage.from(BUCKET).upload(storagePath, file, {
      upsert: false,
    })
    if (error) {
      if (/failed to fetch|networkerror/i.test(error.message)) {
        // fall through to proxy
      } else {
        throw error
      }
    } else {
      return
    }
  } catch (err) {
    const isNetwork =
      err instanceof TypeError ||
      (err instanceof Error && /failed to fetch|networkerror/i.test(err.message))
    if (!isNetwork) throw err
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.access_token) throw new Error('Not authenticated')

  const form = new FormData()
  form.set('file', file)
  form.set('path', storagePath)

  const res = await fetch('/api/storage-upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.access_token}` },
    body: form,
  })

  if (!res.ok) {
    let message = 'Upload failed'
    try {
      const json = (await res.json()) as { message?: string; error?: string }
      message = json.message ?? json.error ?? message
    } catch {
      /* ignore */
    }
    throw new Error(message)
  }
}
