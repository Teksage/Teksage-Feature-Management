import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export interface CreateNotificationInput {
  userId: string
  featureId?: string | null
  type: string
  title: string
  body?: string | null
}

/** Best-effort notify; skips self and never throws. */
export async function createNotification(
  input: CreateNotificationInput,
  actorId?: string
): Promise<void> {
  if (actorId && input.userId === actorId) return
  try {
    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.from('notifications').insert({
      user_id: input.userId,
      feature_id: input.featureId ?? null,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
    })
    if (error) console.warn('[notifications]', error.message)
  } catch (err) {
    console.warn('[notifications]', err)
  }
}
