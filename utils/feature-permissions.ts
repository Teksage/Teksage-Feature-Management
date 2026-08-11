import type { AuthUser } from '@/store/auth-store'

interface FeatureAssignee {
  assignee_id: string | null
}

export function isAdmin(user: AuthUser | null | undefined): boolean {
  return user?.role === 'Admin'
}

export function isAssignee(
  user: AuthUser | null | undefined,
  assigneeId: string | null | undefined
): boolean {
  return !!user && !!assigneeId && user.id === assigneeId
}

/** Admin or the feature assignee — status changes and subtasks. */
export function canManageAssignedFeature(
  user: AuthUser | null | undefined,
  feature: FeatureAssignee
): boolean {
  return isAdmin(user) || isAssignee(user, feature.assignee_id)
}

/** Admin-only — edit title, priority, assignee, delete, docs, attachments. */
export function canEditFeatureMeta(user: AuthUser | null | undefined): boolean {
  return isAdmin(user)
}

export function canDragFeature(
  user: AuthUser | null | undefined,
  feature: FeatureAssignee
): boolean {
  return canManageAssignedFeature(user, feature)
}
