import type { IActivityItem } from './use-get-activity'

type ProfileRef = { full_name: string } | null

function nameOf(profile: ProfileRef, fallbackId: string): string {
  return profile?.full_name ?? fallbackId.slice(0, 8)
}

function push(
  items: IActivityItem[],
  row: Omit<IActivityItem, 'feature_id'> & { feature_id?: string },
  featureId: string
) {
  items.push({ ...row, feature_id: featureId })
}

/** Builds a timeline from existing tables — no feature_activity storage. */
export function buildDerivedActivity(
  featureId: string,
  feature: {
    created_at: string
    created_by: string
    creator: ProfileRef
  } | null,
  comments: Array<{
    id: string
    user_id: string
    body: string
    created_at: string
    profiles: ProfileRef
  }>,
  subtasks: Array<{
    id: string
    title: string
    status: string
    created_by: string
    created_at: string
    updated_at: string
    creator: ProfileRef
  }>,
  attachments: Array<{
    id: string
    items: Array<{ kind: string; label: string }>
    uploaded_by: string
    created_at: string
    uploader: ProfileRef
  }>,
  doc: {
    updated_at: string
    updated_by: string | null
    body: string
    updater: ProfileRef
  } | null
): IActivityItem[] {
  const items: IActivityItem[] = []

  if (feature) {
    push(items, {
      id: `feature-created-${featureId}`,
      actor_id: feature.created_by,
      action: 'created',
      field: 'feature',
      old_value: null,
      new_value: null,
      created_at: feature.created_at,
      actor_full_name: nameOf(feature.creator, feature.created_by),
    }, featureId)
  }

  for (const c of comments) {
    push(items, {
      id: `comment-${c.id}`,
      actor_id: c.user_id,
      action: 'commented',
      field: 'comment',
      old_value: null,
      new_value: c.body.slice(0, 120),
      created_at: c.created_at,
      actor_full_name: nameOf(c.profiles, c.user_id),
    }, featureId)
  }

  for (const s of subtasks) {
    push(items, {
      id: `subtask-add-${s.id}`,
      actor_id: s.created_by,
      action: 'subtask_added',
      field: 'subtask',
      old_value: null,
      new_value: s.title,
      created_at: s.created_at,
      actor_full_name: nameOf(s.creator, s.created_by),
    }, featureId)

    const edited = new Date(s.updated_at).getTime() - new Date(s.created_at).getTime() > 2000
    if (edited && s.status !== 'Idea') {
      push(items, {
        id: `subtask-status-${s.id}`,
        actor_id: s.created_by,
        action: s.status === 'Completed' ? 'subtask_completed' : 'subtask_status_changed',
        field: 'subtask',
        old_value: null,
        new_value: s.status === 'Completed' ? s.title : s.status,
        created_at: s.updated_at,
        actor_full_name: nameOf(s.creator, s.created_by),
      }, featureId)
    }
  }

  for (const a of attachments) {
    const summary = a.items
      .map((i) => `${i.kind === 'file' ? '📎' : '🔗'} ${i.label}`)
      .join(', ')
    push(items, {
      id: `attachment-${a.id}`,
      actor_id: a.uploaded_by,
      action: 'attachment_added',
      field: 'attachment',
      old_value: null,
      new_value: summary || null,
      created_at: a.created_at,
      actor_full_name: nameOf(a.uploader, a.uploaded_by),
    }, featureId)
  }

  if (doc?.body.trim() && doc.updated_by) {
    push(items, {
      id: `docs-${featureId}`,
      actor_id: doc.updated_by,
      action: 'docs_updated',
      field: 'docs',
      old_value: null,
      new_value: null,
      created_at: doc.updated_at,
      actor_full_name: nameOf(doc.updater, doc.updated_by),
    }, featureId)
  }

  return items.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}
