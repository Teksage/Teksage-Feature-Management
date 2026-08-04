import type {
  FeaturePlatform,
  FeaturePriority,
  FeatureStatus,
} from '@/types/supabase.types'
import type { FeatureBoardTab } from '@/lib/constants'

export interface IFeatureEntity {
  id: string
  title: string
  description: string | null
  status: FeatureStatus
  priority: FeaturePriority
  platform: FeaturePlatform
  web_status: FeatureStatus | null
  app_status: FeatureStatus | null
  category_id: string | null
  target_release: string | null
  created_by: string
  created_at: string
  updated_at: string
  vote_count: number
  has_voted: boolean
  category_name: string | null
  creator_full_name: string | null
}

export interface IFeatureFilters {
  status?: FeatureStatus
  priority?: FeaturePriority
  platform?: FeaturePlatform
  categoryId?: string
  search?: string
}

/** Status shown on a given board tab (Both features track Web/App separately). */
export function statusForTab(feature: IFeatureEntity, tab: FeatureBoardTab): FeatureStatus {
  if (tab === 'Web') return feature.web_status ?? feature.status
  return feature.app_status ?? feature.status
}

export function matchesBoardTab(feature: IFeatureEntity, tab: FeatureBoardTab): boolean {
  if (tab === 'Web') return feature.platform === 'Website' || feature.platform === 'Both'
  return feature.platform === 'App' || feature.platform === 'Both'
}
