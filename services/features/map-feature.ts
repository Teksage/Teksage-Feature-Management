import type { IFeatureEntity } from './features.types'

/** Shared select for feature list/detail with category + creator + assignee. */
export const FEATURE_SELECT =
  '*, feature_categories(name), creator:profiles!created_by(full_name), assignee:profiles!assignee_id(full_name)'

type FeatureRow = Record<string, unknown> & {
  id: string
  feature_categories?: { name: string } | null
  creator?: { full_name: string } | null
  assignee?: { full_name: string } | null
}

export function mapFeatureRow(
  row: FeatureRow,
  voteCount: number,
  hasVoted: boolean,
  subtaskDone = 0,
  subtaskTotal = 0
): IFeatureEntity {
  const { feature_categories, creator, assignee, ...rest } = row
  return {
    ...(rest as Omit<
      IFeatureEntity,
      | 'category_name'
      | 'creator_full_name'
      | 'assignee_full_name'
      | 'vote_count'
      | 'has_voted'
      | 'subtask_done'
      | 'subtask_total'
    >),
    category_name: feature_categories?.name ?? null,
    creator_full_name: creator?.full_name ?? null,
    assignee_full_name: assignee?.full_name ?? null,
    vote_count: voteCount,
    has_voted: hasVoted,
    subtask_done: subtaskDone,
    subtask_total: subtaskTotal,
  }
}
