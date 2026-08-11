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

export function invalidateSubtasks(queryClient: QueryClient, featureId: string) {
  void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.subtasks, featureId] })
  void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.features] })
}

export function invalidateActivity(queryClient: QueryClient, featureId: string) {
  void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.activity, featureId] })
}

export function invalidateAttachments(queryClient: QueryClient, featureId: string) {
  void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.attachments, 'v2', featureId] })
}

export function invalidateDocs(queryClient: QueryClient, featureId: string) {
  void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.docs, featureId] })
}

export function invalidateNotifications(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.notifications] })
}
