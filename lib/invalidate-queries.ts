import type { QueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/lib/constants'

export function invalidateFeatures(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.features] })
  void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.feature] })
  void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.dashboardStats] })
}

export function invalidateCategories(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.categories] })
}

export function invalidateTeam(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.team] })
}

export function invalidateComments(queryClient: QueryClient, featureId: string) {
  void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.comments, featureId] })
}
